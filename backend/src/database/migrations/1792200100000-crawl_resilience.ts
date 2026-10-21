/**
 * Bổ sung lịch thử lại, chẩn đoán lỗi và thống kê worker cho các lượt crawl hiện có.
 * Dùng bởi: db:run / db:run:prod; giữ nguyên hàng đợi, bản xem trước và dữ liệu nhà.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrawlResilience1792200100000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE property_crawl_runs
      ADD retryCount int unsigned NOT NULL DEFAULT 0,
      ADD failureCount int unsigned NOT NULL DEFAULT 0,
      ADD duplicateCount int unsigned NOT NULL DEFAULT 0,
      ADD nextAttemptAt datetime(3) NULL,
      ADD lastProcessedAt datetime(3) NULL,
      ADD lastErrorCode varchar(60) NULL,
      ADD lastError varchar(1000) NULL,
      ADD coverageLimited tinyint NOT NULL DEFAULT 0,
      ADD lastPageDurationMs int unsigned NOT NULL DEFAULT 0,
      ADD INDEX IDX_crawl_run_schedule (status, nextAttemptAt)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE property_crawl_runs DROP INDEX IDX_crawl_run_schedule,
      DROP COLUMN retryCount, DROP COLUMN failureCount, DROP COLUMN duplicateCount,
      DROP COLUMN nextAttemptAt, DROP COLUMN lastProcessedAt, DROP COLUMN lastErrorCode,
      DROP COLUMN lastError, DROP COLUMN coverageLimited, DROP COLUMN lastPageDurationMs`);
  }
}
