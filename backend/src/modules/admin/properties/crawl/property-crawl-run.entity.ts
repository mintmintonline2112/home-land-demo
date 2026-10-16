/**
 * Lưu hàng đợi crawl bền vững, URL chờ, tiến độ và lỗi của mỗi lượt thu thập Zillow.
 * Dùng bởi: property-crawl.service.ts; không lưu HTML hoặc thông tin đăng nhập nguồn.
 */
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

export type CrawlRunStatus = 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'cancelled' | 'blocked';

@Entity('property_crawl_runs')
@Index('IDX_crawl_run_schedule', ['status', 'nextAttemptAt'])
export class PropertyCrawlRun extends BaseEntity {
  @Column({ type: 'varchar', length: 20, default: 'queued' })
  status: CrawlRunStatus;

  @Column({ type: 'json' })
  pendingUrls: string[];

  @Column({ type: 'json' })
  visitedUrls: string[];

  @Column({ type: 'int', unsigned: true, default: 0 })
  pages: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  found: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  skipped: number;

  @Column({ type: 'int', unsigned: true })
  maxPages: number;

  @Column({ type: 'int', unsigned: true })
  maxListings: number;

  @Column({ type: 'json' })
  messages: string[];

  @Column({ type: 'int', unsigned: true, default: 0 })
  retryCount: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  failureCount: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  duplicateCount: number;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  nextAttemptAt: Date | null;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  lastProcessedAt: Date | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  lastErrorCode: string | null;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  lastError: string | null;

  @Column({ type: 'boolean', default: false })
  coverageLimited: boolean;

  @Column({ type: 'int', unsigned: true, default: 0 })
  lastPageDurationMs: number;
}
