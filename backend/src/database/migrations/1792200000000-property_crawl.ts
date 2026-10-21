/**
 * Thêm nguồn listing, phòng tắm lẻ và hàng đợi / bản xem trước crawl, không thay đổi dữ liệu nhà hiện có.
 * Dùng bởi: db:run / db:run:prod; cần chạy trước khi khởi động tính năng crawl.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class PropertyCrawl1792200000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE properties
      ADD source varchar(30) NULL,
      ADD source_key varchar(80) NULL,
      ADD source_url varchar(2048) NULL,
      ADD source_broker varchar(255) NULL,
      ADD last_crawled_at datetime NULL,
      MODIFY baths decimal(5,2) unsigned NOT NULL DEFAULT 0,
      ADD UNIQUE INDEX UQ_properties_source_key (source, source_key)`);
    const base = `id int unsigned NOT NULL AUTO_INCREMENT, sort_order int unsigned NOT NULL DEFAULT 0,
      created_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      updated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
      deleted_at datetime(6) NULL, PRIMARY KEY (id), INDEX IDX_base_deleted (deleted_at)`;
    await queryRunner.query(`CREATE TABLE property_crawl_runs (${base},
      status varchar(20) NOT NULL DEFAULT 'queued', pendingUrls json NOT NULL, visitedUrls json NOT NULL,
      pages int unsigned NOT NULL DEFAULT 0, found int unsigned NOT NULL DEFAULT 0, skipped int unsigned NOT NULL DEFAULT 0,
      maxPages int unsigned NOT NULL, maxListings int unsigned NOT NULL, messages json NOT NULL
    ) ENGINE=InnoDB`);
    await queryRunner.query(`CREATE TABLE property_crawl_items (${base},
      runId int unsigned NOT NULL, sourceKey varchar(80) NOT NULL, sourceUrl varchar(2048) NOT NULL,
      data json NOT NULL, fetchedAt datetime NOT NULL, propertyId int unsigned NULL,
      UNIQUE INDEX UQ_crawl_item_run_key (runId, sourceKey),
      CONSTRAINT FK_crawl_item_run FOREIGN KEY (runId) REFERENCES property_crawl_runs(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE property_crawl_items');
    await queryRunner.query('DROP TABLE property_crawl_runs');
    await queryRunner.query(`ALTER TABLE properties DROP INDEX UQ_properties_source_key,
      DROP COLUMN source, DROP COLUMN source_key, DROP COLUMN source_url,
      DROP COLUMN source_broker, DROP COLUMN last_crawled_at,
      MODIFY baths tinyint unsigned NOT NULL DEFAULT 0`);
  }
}
