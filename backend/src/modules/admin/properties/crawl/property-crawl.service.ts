/**
 * Điều phối crawl Zillow: hàng đợi công bằng, retry bền vững, checkpoint nguyên tử và nhập listing được chọn vào CMS.
 * Dùng bởi: property-crawl.controller.ts; lỗi tạm thời thử lại tối đa 3 lần, trang bị chặn chờ admin tiếp tục.
 * Lưu ý: khóa theo database; tải HTTP ngoài transaction, lưu cả trang và mốc trong một transaction; shutdown hủy request đang chờ.
 */
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { DataSource, EntityManager, In, IsNull, QueryRunner, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { Property } from '../entities/property.entity';
import { PropertyCrawlRun } from './property-crawl-run.entity';
import { PropertyCrawlItem } from './property-crawl-item.entity';
import { type CrawlPage, parseZillowPage, validateZillowUrl } from './zillow-parser';
import { ImportCrawledPropertiesDto, ResumePropertyCrawlDto, StartPropertyCrawlDto } from './dto/crawl-request.dto';
import { withZillowPageNumber, zillowPageNumber } from './zillow-pagination';
import { BLOCKED_FAILURE_CODES, classifyCrawlFailure, MAX_PAGE_RETRIES, retryDelayMs } from './crawl-failure';
import { downloadZillowHtml } from './zillow-download';

const WORKER_INTERVAL_MS = 3000;
const MAX_ACTIVE_RUNS = 5;
const MESSAGE_LIMIT = 30;
const COVERAGE_MESSAGE = 'Nguồn giới hạn kết quả tìm kiếm. Cần chia nhỏ URL theo khu vực / khoảng giá để mở rộng độ phủ.';

@Injectable()
export class PropertyCrawlService extends BaseService<PropertyCrawlRun, number> implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PropertyCrawlService.name);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;
  private processing: Promise<void> | undefined;
  private activeRequest: { runId: number; controller: AbortController } | undefined;

  constructor(
    @InjectRepository(PropertyCrawlRun) private readonly runs: Repository<PropertyCrawlRun>,
    @InjectRepository(PropertyCrawlItem) private readonly items: Repository<PropertyCrawlItem>,
    private readonly database: DataSource,
    private readonly cache: AppCacheService,
  ) { super(runs); }

  onModuleInit(): void { this.schedule(); }

  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.activeRequest?.controller.abort();
    await this.processing?.catch((error: unknown) => {
      this.logger.error({ event: 'crawl.shutdown.error', message: this.errorMessage(error) });
    });
  }

  private schedule(): void {
    if (this.stopped) return;
    this.timer = setTimeout(() => {
      void this.processNextPage().catch((error: unknown) => {
        this.logger.error({ event: 'crawl.worker.error', message: this.errorMessage(error) });
      }).finally(() => this.schedule());
    }, WORKER_INTERVAL_MS);
    this.timer.unref();
  }

  private errorMessage(error: unknown): string {
    return (error instanceof Error ? error.message : 'Lỗi không xác định.').slice(0, 1000);
  }

  private appendMessage(run: PropertyCrawlRun, message: string): void {
    run.messages = [...run.messages, message.slice(0, 1000)].slice(-MESSAGE_LIMIT);
  }

  private async withDatabaseLock<T>(purpose: string, work: (connection: QueryRunner) => Promise<T>, rejectIfBusy = false): Promise<T | undefined> {
    const connection = this.database.createQueryRunner();
    const key = `crawl:${createHash('sha256').update(`${this.database.options.database}:${purpose}`).digest('hex').slice(0, 48)}`;
    let acquired = false;
    try {
      await connection.connect();
      const result = await connection.query('SELECT GET_LOCK(?, 0) AS acquired', [key]) as Array<{ acquired: number }>;
      acquired = Number(result[0]?.acquired) === 1;
      if (!acquired) {
        if (rejectIfBusy) throw new ConflictException('Một thao tác crawl khác đang xử lý. Hãy thử lại sau.');
        return undefined;
      }
      return await work(connection);
    } finally {
      try {
        if (acquired) await connection.query('SELECT RELEASE_LOCK(?)', [key]);
      } finally { await connection.release(); }
    }
  }

  private async transaction<T>(connection: QueryRunner, work: (manager: EntityManager) => Promise<T>): Promise<T> {
    await connection.startTransaction();
    try {
      const result = await work(connection.manager);
      await connection.commitTransaction();
      return result;
    } catch (error) {
      if (connection.isTransactionActive) await connection.rollbackTransaction();
      throw error;
    }
  }

  private async checkQueueCapacity(repository: Repository<PropertyCrawlRun>): Promise<void> {
    if (await repository.count({ where: { status: In(['queued', 'running']) } }) >= MAX_ACTIVE_RUNS) {
      throw new ConflictException('Đang có 5 lượt chờ/chạy. Hãy đợi hoặc dừng lượt cũ.');
    }
  }

  async start(input: StartPropertyCrawlDto): Promise<PropertyCrawlRun> {
    let urls: string[];
    try { urls = [...new Set(input.urls.map((url) => input.startPage === undefined ? validateZillowUrl(url) : withZillowPageNumber(url, input.startPage)))]; }
    catch { throw new BadRequestException('URL phải là HTTPS trên zillow.com và searchQueryState hợp lệ, không kèm tài khoản hoặc cổng riêng.'); }
    return this.withDatabaseLock('admission', (connection) => this.transaction(connection, async (manager) => {
      const repository = manager.getRepository(PropertyCrawlRun);
      await this.checkQueueCapacity(repository);
      return repository.save(repository.create({
        status: 'queued', pendingUrls: urls, visitedUrls: [], pages: 0, found: 0, skipped: 0,
        maxPages: input.maxPages, maxListings: input.maxListings, messages: [],
      }));
    }), true);
  }

  async listRuns() {
    const runs = await this.runs.find({ order: { id: 'DESC' }, take: 20 });
    return runs.map((run) => {
      const lastUrl = run.visitedUrls[run.visitedUrls.length - 1] ?? null;
      const nextUrl = run.pendingUrls[0] ?? null;
      return { ...run, checkpoint: {
        lastUrl, lastPage: lastUrl ? zillowPageNumber(lastUrl) : null,
        nextUrl, nextPage: nextUrl ? zillowPageNumber(nextUrl) : null,
      } };
    });
  }

  async resume(id: number, input: ResumePropertyCrawlDto): Promise<PropertyCrawlRun> {
    return this.withDatabaseLock('admission', (connection) => this.transaction(connection, async (manager) => {
      const repository = manager.getRepository(PropertyCrawlRun);
      const run = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!run) throw new NotFoundException('Không tìm thấy lượt crawl.');
      if (['queued', 'running'].includes(run.status)) throw new ConflictException('Lượt crawl đang chờ/chạy, không cần tiếp tục.');
      if (!run.pendingUrls.length) throw new BadRequestException('Không còn URL chờ. Hãy tạo lượt mới nếu muốn thu thập lại.');
      if (BLOCKED_FAILURE_CODES.includes(run.lastErrorCode) && run.nextAttemptAt && run.nextAttemptAt.getTime() > Date.now()) {
        throw new ConflictException(`Nguồn đang yêu cầu tạm nghỉ. Có thể thử lại sau ${Math.ceil((run.nextAttemptAt.getTime() - Date.now()) / 1000)} giây.`);
      }
      await this.checkQueueCapacity(repository);
      this.restoreLegacyCheckpoint(run);
      run.maxPages = run.pages + input.additionalPages;
      run.maxListings = await manager.getRepository(PropertyCrawlItem).countBy({ runId: id }) + input.additionalListings;
      run.status = 'queued';
      run.retryCount = 0;
      run.nextAttemptAt = null;
      run.lastError = null;
      run.lastErrorCode = null;
      this.appendMessage(run, `Tiếp tục từ trang ${zillowPageNumber(run.pendingUrls[0])}. Thêm tối đa ${input.additionalPages} trang / ${input.additionalListings} tin.`);
      return repository.save(run);
    }), true);
  }

  private restoreLegacyCheckpoint(run: PropertyCrawlRun): void {
    const message = 'Đã chạm giới hạn trang hoặc listing. Còn dữ liệu chưa thu thập.';
    if (run.found < run.maxListings || !run.visitedUrls.length || !run.messages.includes(message)) return;
    const url = run.visitedUrls.pop()!;
    run.pendingUrls = [url, ...run.pendingUrls.filter((pending) => pending !== url)];
    run.pages = Math.max(0, run.pages - 1);
    run.messages = run.messages.filter((entry) => entry !== message);
  }

  async getRun(id: number): Promise<PropertyCrawlRun> {
    const run = await this.runs.findOneBy({ id });
    if (!run) throw new NotFoundException('Không tìm thấy lượt crawl.');
    return run;
  }

  async cancel(id: number): Promise<PropertyCrawlRun> {
    const run = await this.getRun(id);
    await this.runs.update({ id, status: In(['queued', 'running', 'blocked']) }, {
      status: 'cancelled', nextAttemptAt: BLOCKED_FAILURE_CODES.includes(run.lastErrorCode) ? run.nextAttemptAt : null,
    });
    if (this.activeRequest?.runId === id) this.activeRequest.controller.abort();
    return this.getRun(id);
  }

  async listItems(runId: number, page: number) {
    await this.getRun(runId);
    const [[data, total], unimportedTotal] = await Promise.all([
      this.items.findAndCount({ where: { runId }, order: { id: 'ASC' }, skip: (page - 1) * 50, take: 50 }),
      this.items.countBy({ runId, propertyId: IsNull() }),
    ]);
    return { items: data, total, unimportedTotal, importedTotal: total - unimportedTotal, page, totalPages: Math.max(1, Math.ceil(total / 50)) };
  }

  async selectUnimportedItems(runId: number): Promise<{ itemIds: number[]; count: number }> {
    await this.getRun(runId);
    const items = await this.items.find({ where: { runId, propertyId: IsNull() }, select: ['id'], order: { id: 'ASC' } });
    return { itemIds: items.map((item) => item.id), count: items.length };
  }

  async importItems(runId: number, input: ImportCrawledPropertiesDto) {
    await this.getRun(runId);
    const result = await this.withDatabaseLock('import', (connection) => this.transaction(connection, async (manager) => {
      const itemRepository = manager.getRepository(PropertyCrawlItem);
      const selected = await itemRepository.find({ where: { runId, id: In(input.itemIds) }, order: { sourceKey: 'ASC' }, lock: { mode: 'pessimistic_write' } });
      if (selected.length !== input.itemIds.length) throw new BadRequestException('Có bản ghi không thuộc lượt crawl này.');
      const counts = { created: 0, updated: 0, skipped: 0 };
      const properties = manager.getRepository(Property);
      for (const item of selected) {
        if (item.propertyId) { counts.skipped++; continue; }
        const existing = await properties.findOne({ where: { source: 'zillow', sourceKey: item.sourceKey }, withDeleted: true, lock: { mode: 'pessimistic_write' } });
        if (existing?.deletedAt || (existing?.lastCrawledAt && existing.lastCrawledAt >= item.fetchedAt)) { counts.skipped++; continue; }
        const values = { ...item.data, lastCrawledAt: item.fetchedAt };
        let property: Property;
        if (existing) {
          await properties.update(existing.id, values);
          property = existing;
        } else {
          const slug = await generateUniqueSlug(properties, `${String(item.data.title).slice(0, 180)}-zillow-${item.sourceKey}`);
          property = await properties.save(properties.create({ ...values, slug, isActive: input.publish, isFeatured: false }));
        }
        await itemRepository.update(item.id, { propertyId: property.id });
        counts[existing ? 'updated' : 'created']++;
      }
      return counts;
    }), true);
    if (result.created || result.updated) {
      try { await this.cache.invalidate(CACHE_NS.properties); }
      catch (error) { this.logger.warn({ event: 'crawl.import.cache_refresh_failed', runId, message: this.errorMessage(error) }); }
    }
    return result;
  }

  private downloadPage(url: string): Promise<string> {
    return downloadZillowHtml(url, this.activeRequest?.controller.signal);
  }

  processNextPage(): Promise<void> {
    if (this.processing) return this.processing;
    if (this.stopped) return Promise.resolve();
    this.processing = this.withDatabaseLock('worker', (connection) => this.processLockedPage(connection))
      .then((): void => undefined).finally(() => { this.processing = undefined; });
    return this.processing;
  }

  private async processLockedPage(connection: QueryRunner): Promise<void> {
    const repository = connection.manager.getRepository(PropertyCrawlRun);
    const now = new Date();
    const coolingDown = await repository.createQueryBuilder('run').where('run.lastErrorCode IN (:...codes)', { codes: BLOCKED_FAILURE_CODES })
      .andWhere('run.nextAttemptAt > :now', { now }).getExists();
    if (coolingDown || this.stopped) return;
    const run = await repository.createQueryBuilder('run').where('run.status IN (:...statuses)', { statuses: ['queued', 'running'] })
      .andWhere('(run.nextAttemptAt IS NULL OR run.nextAttemptAt <= :now)', { now })
      .orderBy('COALESCE(run.lastProcessedAt, run.createdAt)', 'ASC').addOrderBy('run.id', 'ASC').getOne();
    if (!run) return;
    const claimed = await repository.update({ id: run.id, status: In(['queued', 'running']) }, { status: 'running' });
    if (!claimed.affected) return;
    const url = run.pendingUrls[0];
    const controller = new AbortController();
    this.activeRequest = { runId: run.id, controller };
    const started = Date.now();
    try {
      if (!url) throw new Error('Hàng đợi URL rỗng.');
      const page = parseZillowPage(await this.downloadPage(url), url);
      if (this.stopped || controller.signal.aborted) return;
      await this.persistPage(connection, run.id, url, page, started);
    } catch (error) {
      if (!this.stopped && !controller.signal.aborted) await this.persistFailure(connection, run.id, url, error);
    } finally { this.activeRequest = undefined; }
  }

  private async persistPage(connection: QueryRunner, id: number, url: string, page: CrawlPage, started: number): Promise<void> {
    const summary = await this.transaction(connection, async (manager) => {
      const repository = manager.getRepository(PropertyCrawlRun);
      const run = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!run || run.status !== 'running' || run.pendingUrls[0] !== url) return null;
      const itemRepository = manager.getRepository(PropertyCrawlItem);
      const keys = [...new Set(page.listings.map((listing) => listing.sourceKey))];
      const existing = keys.length ? await itemRepository.find({ where: { runId: id, sourceKey: In(keys) }, select: ['sourceKey'] }) : [];
      const seen = new Set(existing.map((item) => item.sourceKey));
      const fresh = page.listings.filter((listing) => !seen.has(listing.sourceKey));
      const found = await itemRepository.countBy({ runId: id });
      const selected = fresh.slice(0, Math.max(0, run.maxListings - found));
      const fetchedAt = new Date();
      for (let offset = 0; offset < selected.length; offset += 100) {
        await itemRepository.insert(selected.slice(offset, offset + 100).map((listing) => ({ ...listing, runId: id, fetchedAt, propertyId: null as number | null })));
      }
      const incomplete = selected.length < fresh.length;
      if (!incomplete) {
        run.visitedUrls.push(url);
        run.pendingUrls.shift();
        run.pages++;
        run.skipped += page.skipped;
        run.duplicateCount += existing.length;
        if (page.nextUrl && !run.visitedUrls.includes(page.nextUrl) && !run.pendingUrls.includes(page.nextUrl)) run.pendingUrls.push(page.nextUrl);
      }
      run.found = found + selected.length;
      if (page.limitedBySource && !run.coverageLimited) this.appendMessage(run, COVERAGE_MESSAGE);
      run.coverageLimited = run.coverageLimited || page.limitedBySource;
      const limited = incomplete || ((run.pages >= run.maxPages || run.found >= run.maxListings) && run.pendingUrls.length > 0);
      if (limited) this.appendMessage(run, incomplete
        ? 'Đã chạm giới hạn listing giữa trang. Giữ lại trang này để lấy phần còn thiếu khi Crawl tiếp.'
        : 'Đã chạm giới hạn trang hoặc listing; bấm Crawl tiếp để dùng mốc đã lưu.');
      run.status = limited ? 'partial' : run.pendingUrls.length ? 'running' : 'completed';
      run.retryCount = 0;
      run.nextAttemptAt = null;
      run.lastErrorCode = null;
      run.lastError = null;
      run.lastProcessedAt = fetchedAt;
      run.lastPageDurationMs = Date.now() - started;
      await repository.save(run);
      return { runId: id, pages: run.pages, added: selected.length, found: run.found, status: run.status, durationMs: run.lastPageDurationMs };
    });
    if (summary) this.logger.log({ event: 'crawl.page.saved', ...summary });
  }

  private async persistFailure(connection: QueryRunner, id: number, url: string, error: unknown): Promise<void> {
    const failure = classifyCrawlFailure(error);
    await this.transaction(connection, async (manager) => {
      const repository = manager.getRepository(PropertyCrawlRun);
      const run = await repository.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!run || run.status !== 'running' || run.pendingUrls[0] !== url) return;
      run.failureCount++;
      run.lastErrorCode = failure.code;
      run.lastError = failure.message.slice(0, 1000);
      run.lastProcessedAt = new Date();
      if (failure.blocked) {
        run.status = 'blocked';
        run.nextAttemptAt = new Date(Date.now() + Math.max(60000, failure.retryAfterMs));
        this.appendMessage(run, `${run.lastError} Cần kiểm tra nguồn rồi bấm Crawl tiếp; không tự lặp lại trang chặn.`);
      } else if (failure.retryable && run.retryCount < MAX_PAGE_RETRIES) {
        run.retryCount++;
        const delay = retryDelayMs(run.retryCount, failure.retryAfterMs);
        run.status = 'queued';
        run.nextAttemptAt = new Date(Date.now() + delay);
        this.appendMessage(run, `${run.lastError} Thử lại ${run.retryCount}/${MAX_PAGE_RETRIES} sau ${Math.ceil(delay / 1000)} giây.`);
      } else {
        run.status = run.found ? 'partial' : 'failed';
        run.nextAttemptAt = null;
        this.appendMessage(run, `${run.lastError}${failure.retryable ? ' Đã hết số lần tự thử lại.' : ''}`);
      }
      await repository.save(run);
      this.logger.warn({ event: 'crawl.page.failed', runId: id, code: failure.code, status: run.status, retryCount: run.retryCount, nextAttemptAt: run.nextAttemptAt });
    });
  }
}
