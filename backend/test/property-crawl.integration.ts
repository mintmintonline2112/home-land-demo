/**
 * Kiểm tra migration, hàng đợi, nhập trùng, cập nhật, hủy và lỗi nguồn bằng MySQL tạm trên máy local.
 * Dùng bởi: npm run check:crawl; tự tạo / xóa database tên ngẫu nhiên, không sửa database của ứng dụng.
 * Lưu ý: không gọi Zillow; dữ liệu tổng hợp chỉ tồn tại trong database kiểm thử.
 */
import 'dotenv/config';
import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Logger } from '@nestjs/common';
import { createConnection } from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { createTypeOrmOptionsFromEnv } from 'src/database/typeorm-options';
import { Properties1792050784497 } from 'src/database/migrations/1792050784497-properties';
import { PropertyCoordinates1792134797782 } from 'src/database/migrations/1792134797782-property_coordinates';
import { PropertyCrawl1792200000000 } from 'src/database/migrations/1792200000000-property_crawl';
import { CrawlResilience1792200100000 } from 'src/database/migrations/1792200100000-crawl_resilience';
import { Property } from 'src/modules/admin/properties/entities/property.entity';
import { PropertyCrawlItem } from 'src/modules/admin/properties/crawl/property-crawl-item.entity';
import { PropertyCrawlRun } from 'src/modules/admin/properties/crawl/property-crawl-run.entity';
import { PropertyCrawlService } from 'src/modules/admin/properties/crawl/property-crawl.service';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CrawlFailure } from 'src/modules/admin/properties/crawl/crawl-failure';

async function main() {
  Logger.overrideLogger(['error']);
  if (!['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST ?? '') || process.env.DB_TYPE !== 'mysql') throw new Error('Kiểm thử chỉ chạy với MySQL local.');
  const databaseName = `crawl_check_${randomBytes(6).toString('hex')}`;
  const connection = await createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD });
  let created = false;
  const database = new DataSource({ ...createTypeOrmOptionsFromEnv({ ...process.env, DB_NAME: databaseName }), entities: [Property, PropertyCrawlRun, PropertyCrawlItem], migrations: [Properties1792050784497, PropertyCoordinates1792134797782, PropertyCrawl1792200000000, CrawlResilience1792200100000] });
  try {
    await connection.query(`CREATE DATABASE \`${databaseName}\``);
    created = true;
    await database.initialize();
    await database.runMigrations();
    const runs = database.getRepository(PropertyCrawlRun);
    const items = database.getRepository(PropertyCrawlItem);
    const properties = database.getRepository(Property);
    let invalidations = 0;
    let failCacheRefresh = false;
    const cache = { invalidate: async () => { invalidations++; if (failCacheRefresh) throw new Error('Cache unavailable'); } } as unknown as AppCacheService;
    const service = new PropertyCrawlService(runs, items, database, cache);
    const downloader = service as unknown as { downloadPage: (url: string) => Promise<string> };
    let price = 1200000;
    let next = true;
    let listingKeys = ['123'];
    let pageLimit: number | null = null;
    const downloadedUrls: string[] = [];
    const downloadFixture = async (url: string) => {
      downloadedUrls.push(url);
      const currentPage = Number(new URL(url).pathname.match(/\/(\d+)_p\/?$/)?.[1] ?? 1);
      const nextUrl = pageLimit === null ? (next ? '/ca/2_p/' : null) : currentPage < pageLimit ? `/ca/${currentPage + 1}_p/` : null;
      const keys = pageLimit === null ? listingKeys : [String(1000 + currentPage)];
      return `<script id="__NEXT_DATA__">${JSON.stringify({ props: { pageProps: { searchPageState: { cat1: {
      searchResults: { listResults: keys.map((key) => ({ zpid: key, addressStreet: `${key} Test St`, addressCity: 'Irvine', addressState: 'CA', unformattedPrice: price, baths: 2.5, detailUrl: `/homedetails/test/${key}_zpid/`, hdpData: { homeInfo: { homeStatus: 'FOR_SALE', homeType: 'SINGLE_FAMILY' } } })) },
      searchList: { pagination: nextUrl ? { nextUrl } : {} },
    } } } } })}</script>`;
    };
    downloader.downloadPage = downloadFixture;
    await assert.rejects(() => service.start({ urls: ['https://127.0.0.1/private'], maxPages: 2, maxListings: 10 }));
    const run = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 10 });
    await service.processNextPage();
    assert.equal((await service.getRun(run.id)).status, 'running');
    assert.equal(await properties.count(), 0);
    next = false;
    await service.processNextPage();
    assert.equal((await service.getRun(run.id)).status, 'completed');
    assert.equal((await service.getRun(run.id)).duplicateCount, 1);
    const preview = await service.listItems(run.id, 1);
    assert.equal(preview.total, 1);
    const itemId = preview.items[0].id;
    assert.equal(preview.unimportedTotal, 1);
    assert.deepEqual(await service.selectUnimportedItems(run.id), { itemIds: [itemId], count: 1 });
    assert.deepEqual(await service.importItems(run.id, { itemIds: [itemId], publish: false }), { created: 1, updated: 0, skipped: 0 });
    assert.deepEqual(await service.selectUnimportedItems(run.id), { itemIds: [], count: 0 });
    assert.equal((await service.listItems(run.id, 1)).importedTotal, 1);
    await assert.rejects(() => service.selectUnimportedItems(999999));
    let property = await properties.findOneByOrFail({ sourceKey: '123' });
    assert.equal(Boolean(property.isActive), false);
    assert.equal(Number(property.baths), 2.5);
    assert.deepEqual(await service.importItems(run.id, { itemIds: [itemId], publish: false }), { created: 0, updated: 0, skipped: 1 });
    await properties.update(property.id, { isFeatured: true, isActive: true, description: 'Biên tập riêng' });
    await items.update(itemId, { fetchedAt: new Date(Date.now() - 10000) });
    await properties.update(property.id, { lastCrawledAt: new Date(Date.now() - 10000) });
    price = 1100000;
    const updatedRun = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 10 });
    await service.processNextPage();
    const updatePreview = await service.listItems(updatedRun.id, 1);
    assert.deepEqual((await service.selectUnimportedItems(updatedRun.id)).itemIds, [updatePreview.items[0].id]);
    assert.deepEqual(await service.importItems(updatedRun.id, { itemIds: [updatePreview.items[0].id], publish: false }), { created: 0, updated: 1, skipped: 0 });
    property = await properties.findOneByOrFail({ sourceKey: '123' });
    assert.equal(property.price, price);
    assert.equal(Boolean(property.isFeatured), true);
    assert.equal(Boolean(property.isActive), true);
    assert.equal(property.description, 'Biên tập riêng');
    await assert.rejects(() => service.importItems(updatedRun.id, { itemIds: [itemId], publish: true }));
    const cancelled = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 10 });
    await service.cancel(cancelled.id);
    await service.processNextPage();
    assert.equal((await service.getRun(cancelled.id)).pages, 0);
    const limited = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 10 });
    next = true;
    await service.processNextPage();
    assert.equal((await service.getRun(limited.id)).status, 'partial');
    const checkpoint = (await service.listRuns()).find((entry) => entry.id === limited.id)!.checkpoint;
    assert.equal(checkpoint.lastPage, 1);
    assert.equal(checkpoint.nextPage, 2);
    await service.resume(limited.id, { additionalPages: 1, additionalListings: 10 });
    await assert.rejects(() => service.resume(limited.id, { additionalPages: 1, additionalListings: 10 }));
    next = false;
    await service.processNextPage();
    assert.equal(downloadedUrls[downloadedUrls.length - 1], 'https://www.zillow.com/ca/2_p/');
    assert.equal((await service.getRun(limited.id)).status, 'completed');
    assert.equal((await service.listItems(limited.id, 1)).total, 1);
    await assert.rejects(() => service.resume(limited.id, { additionalPages: 1, additionalListings: 10 }));
    const blocked = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 10 });
    downloader.downloadPage = async () => { throw new Error('HTTP 403'); };
    await service.processNextPage();
    assert.equal((await service.getRun(blocked.id)).status, 'failed');
    assert.equal((await service.listItems(blocked.id, 1)).total, 0);
    assert.equal(await properties.count(), 1);
    assert.equal(invalidations, 2);
    downloader.downloadPage = downloadFixture;
    await service.resume(blocked.id, { additionalPages: 1, additionalListings: 10 });
    await service.processNextPage();
    assert.equal((await service.getRun(blocked.id)).status, 'completed');
    const startAtSix = await service.start({ urls: ['https://www.zillow.com/ca/'], startPage: 6, maxPages: 1, maxListings: 10 });
    await service.processNextPage();
    assert.equal(downloadedUrls[downloadedUrls.length - 1], 'https://www.zillow.com/ca/6_p/');
    assert.equal((await service.getRun(startAtSix.id)).status, 'completed');
    listingKeys = ['123', '456', '789'];
    const midPage = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 1 });
    await service.processNextPage();
    const paused = await service.getRun(midPage.id);
    assert.equal(paused.status, 'partial');
    assert.equal(paused.pages, 0);
    assert.equal(paused.pendingUrls[0], 'https://www.zillow.com/ca/');
    assert.equal(paused.found, 1);
    await service.resume(midPage.id, { additionalPages: 1, additionalListings: 10 });
    await service.processNextPage();
    assert.equal((await service.getRun(midPage.id)).status, 'completed');
    assert.equal((await service.listItems(midPage.id, 1)).total, 3);
    pageLimit = 10;
    const fivePages = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 5, maxListings: 100 });
    for (let index = 0; index < 5; index++) await service.processNextPage();
    assert.equal((await service.getRun(fivePages.id)).pages, 5);
    assert.equal((await service.getRun(fivePages.id)).pendingUrls[0], 'https://www.zillow.com/ca/6_p/');
    const restarted = new PropertyCrawlService(runs, items, database, cache);
    (restarted as unknown as { downloadPage: typeof downloadFixture }).downloadPage = downloadFixture;
    await restarted.resume(fivePages.id, { additionalPages: 5, additionalListings: 100 });
    await restarted.processNextPage();
    assert.equal(downloadedUrls[downloadedUrls.length - 1], 'https://www.zillow.com/ca/6_p/');
    for (let index = 0; index < 4; index++) await restarted.processNextPage();
    assert.equal((await restarted.getRun(fivePages.id)).pages, 10);
    assert.equal((await restarted.getRun(fivePages.id)).status, 'completed');
    assert.equal((await restarted.listItems(fivePages.id, 1)).total, 10);

    pageLimit = null;
    listingKeys = ['123'];
    next = false;
    const retryRun = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 100 });
    let attempts = 0;
    downloader.downloadPage = async () => { attempts++; throw new CrawlFailure('HTTP_503', 'Temporary failure', true); };
    await service.processNextPage();
    let retryState = await service.getRun(retryRun.id);
    assert.equal(retryState.status, 'queued');
    assert.equal(retryState.retryCount, 1);
    assert.equal(retryState.pages, 0);
    assert.ok(retryState.nextAttemptAt!.getTime() > Date.now());
    await service.processNextPage();
    assert.equal(attempts, 1);
    await runs.update(retryRun.id, { nextAttemptAt: new Date(Date.now() - 1000) });
    const recovered = new PropertyCrawlService(runs, items, database, cache);
    (recovered as unknown as { downloadPage: typeof downloadFixture }).downloadPage = downloadFixture;
    await recovered.processNextPage();
    retryState = await service.getRun(retryRun.id);
    assert.equal(retryState.status, 'completed');
    assert.equal(retryState.retryCount, 0);
    assert.equal(retryState.failureCount, 1);
    assert.equal(retryState.lastError, null);

    const exhausted = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 100 });
    for (let index = 0; index < 4; index++) {
      await service.processNextPage();
      await runs.update(exhausted.id, { nextAttemptAt: new Date(Date.now() - 1000) });
    }
    assert.equal((await service.getRun(exhausted.id)).status, 'failed');
    assert.equal((await service.getRun(exhausted.id)).failureCount, 4);
    assert.equal((await service.getRun(exhausted.id)).retryCount, 3);

    const sourceBlocked = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 100 });
    downloader.downloadPage = async () => { throw new CrawlFailure('HTTP_429', 'Rate limited', false, true, 120000); };
    await service.processNextPage();
    assert.equal((await service.getRun(sourceBlocked.id)).status, 'blocked');
    await assert.rejects(() => service.resume(sourceBlocked.id, { additionalPages: 1, additionalListings: 100 }));
    const waitingRun = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 100 });
    downloader.downloadPage = downloadFixture;
    const beforeCooldown = downloadedUrls.length;
    await service.processNextPage();
    assert.equal(downloadedUrls.length, beforeCooldown);
    await runs.update(sourceBlocked.id, { nextAttemptAt: new Date(Date.now() - 1000) });
    await service.processNextPage();
    assert.equal((await service.getRun(waitingRun.id)).status, 'completed');
    assert.equal((await service.getRun(sourceBlocked.id)).status, 'blocked');
    await service.resume(sourceBlocked.id, { additionalPages: 1, additionalListings: 100 });
    await service.processNextPage();
    assert.equal((await service.getRun(sourceBlocked.id)).status, 'completed');

    pageLimit = 2;
    const fairFirst = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 2, maxListings: 100 });
    const fairSecond = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 100 });
    await service.processNextPage();
    await service.processNextPage();
    assert.equal((await service.getRun(fairFirst.id)).pages, 1);
    assert.equal((await service.getRun(fairSecond.id)).pages, 1);
    await service.processNextPage();
    assert.equal((await service.getRun(fairFirst.id)).status, 'completed');
    pageLimit = null;

    const cancelledMidRequest = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 100 });
    let signalStarted!: () => void;
    let finishDownload!: () => void;
    let startedDownload = new Promise<void>((resolve) => { signalStarted = resolve; });
    downloader.downloadPage = (url) => {
      signalStarted();
      return new Promise<string>((resolve) => { finishDownload = () => { void downloadFixture(url).then(resolve); }; });
    };
    let inFlight = service.processNextPage();
    await startedDownload;
    await service.cancel(cancelledMidRequest.id);
    finishDownload();
    await inFlight;
    assert.equal((await service.getRun(cancelledMidRequest.id)).status, 'cancelled');
    assert.equal((await service.listItems(cancelledMidRequest.id, 1)).total, 0);

    const simultaneous = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 100 });
    startedDownload = new Promise<void>((resolve) => { signalStarted = resolve; });
    inFlight = service.processNextPage();
    await startedDownload;
    assert.equal(service.processNextPage(), inFlight);
    const secondWorker = new PropertyCrawlService(runs, items, database, cache);
    let secondDownloads = 0;
    (secondWorker as unknown as { downloadPage: typeof downloadFixture }).downloadPage = async (url) => { secondDownloads++; return downloadFixture(url); };
    await secondWorker.processNextPage();
    assert.equal(secondDownloads, 0);
    finishDownload();
    await inFlight;
    assert.equal((await service.getRun(simultaneous.id)).pages, 1);

    const shutdownRun = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 100 });
    const shutdownWorker = new PropertyCrawlService(runs, items, database, cache);
    startedDownload = new Promise<void>((resolve) => { signalStarted = resolve; });
    (shutdownWorker as unknown as { downloadPage: typeof downloadFixture }).downloadPage = downloader.downloadPage;
    const shutdownWork = shutdownWorker.processNextPage();
    await startedDownload;
    const shuttingDown = shutdownWorker.onModuleDestroy();
    finishDownload();
    await Promise.all([shuttingDown, shutdownWork]);
    assert.equal((await service.getRun(shutdownRun.id)).status, 'running');
    assert.equal((await service.listItems(shutdownRun.id, 1)).total, 0);
    downloader.downloadPage = downloadFixture;
    await service.processNextPage();
    assert.equal((await service.getRun(shutdownRun.id)).status, 'completed');

    listingKeys = ['500001', '500002', '500003'];
    const atomicRun = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 100 });
    await database.query(`CREATE TRIGGER fail_crawl_progress BEFORE UPDATE ON property_crawl_runs FOR EACH ROW BEGIN IF NEW.id = ${atomicRun.id} AND NEW.pages > OLD.pages THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Simulated checkpoint failure'; END IF; END`);
    await service.processNextPage();
    assert.equal((await service.listItems(atomicRun.id, 1)).total, 0);
    assert.equal((await service.getRun(atomicRun.id)).pages, 0);
    assert.equal((await service.getRun(atomicRun.id)).pendingUrls[0], 'https://www.zillow.com/ca/');
    await database.query('DROP TRIGGER fail_crawl_progress');
    await service.resume(atomicRun.id, { additionalPages: 1, additionalListings: 100 });
    await service.processNextPage();
    assert.equal((await service.listItems(atomicRun.id, 1)).total, 3);
    failCacheRefresh = true;
    const cacheItem = (await service.listItems(atomicRun.id, 1)).items[0].id;
    assert.deepEqual(await service.importItems(atomicRun.id, { itemIds: [cacheItem], publish: false }), { created: 1, updated: 0, skipped: 0 });
    const selectionRun = await service.start({ urls: ['https://www.zillow.com/ca/'], maxPages: 1, maxListings: 200 });
    await service.cancel(selectionRun.id);
    await items.insert(Array.from({ length: 125 }, (_, index) => ({
      runId: selectionRun.id, sourceKey: String(700000 + index), sourceUrl: `https://www.zillow.com/homedetails/test/${700000 + index}_zpid/`,
      data: { title: `Selection fixture ${index}` }, fetchedAt: new Date(), propertyId: index < 5 ? property.id : null,
    })));
    const globalSelection = await service.selectUnimportedItems(selectionRun.id);
    assert.equal(globalSelection.count, 120);
    assert.equal(new Set(globalSelection.itemIds).size, 120);
    const lastSelectionPage = await service.listItems(selectionRun.id, 3);
    assert.equal(lastSelectionPage.unimportedTotal, 120);
    assert.equal(lastSelectionPage.importedTotal, 5);
    assert.ok(lastSelectionPage.items.every((item) => globalSelection.itemIds.includes(item.id)));
    assert.ok(!(await service.listItems(selectionRun.id, 1)).items.slice(0, 5).some((item) => globalSelection.itemIds.includes(item.id)));
    const runner = database.createQueryRunner();
    await new CrawlResilience1792200100000().down(runner);
    await new PropertyCrawl1792200000000().down(runner);
    await new PropertyCrawl1792200000000().up(runner);
    await new CrawlResilience1792200100000().up(runner);
    await runner.release();
    console.log('PASS: migrations, import, checkpoints, persistent retry/exhaustion, 429 cooldown, fair scheduling, two-worker exclusion, cancel/shutdown recovery, atomic page rollback and cache failure after import.');
  } finally {
    if (database.isInitialized) await database.destroy();
    if (created && /^crawl_check_[a-f0-9]{12}$/.test(databaseName)) await connection.query(`DROP DATABASE \`${databaseName}\``);
    await connection.end();
  }
}

void main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Kiểm thử thất bại'); process.exitCode = 1; });
