/**
 * Migration tạo bảng properties (nhà đăng bán) — sinh bằng TypeORM migration:generate, đã bỏ các câu thừa đụng bảng khác.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Properties1792050784497 implements MigrationInterface {
  name = 'Properties1792050784497';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`properties\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`sort_order\` int UNSIGNED NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`title\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`listing_id\` varchar(40) NULL, \`status\` varchar(40) NOT NULL DEFAULT 'For Sale', \`type\` varchar(20) NOT NULL, \`type_label\` varchar(80) NULL, \`region\` varchar(30) NOT NULL, \`neighborhood\` varchar(120) NULL, \`city\` varchar(120) NOT NULL, \`state\` varchar(2) NOT NULL DEFAULT 'CA', \`zip\` varchar(10) NULL, \`address\` varchar(255) NULL, \`price\` int UNSIGNED NOT NULL, \`beds\` tinyint UNSIGNED NOT NULL DEFAULT '0', \`baths\` tinyint UNSIGNED NOT NULL DEFAULT '0', \`sqft\` int UNSIGNED NOT NULL DEFAULT '0', \`lot_size\` varchar(40) NULL, \`garage\` tinyint UNSIGNED NOT NULL DEFAULT '0', \`stories\` tinyint UNSIGNED NOT NULL DEFAULT '1', \`year_built\` smallint UNSIGNED NULL, \`facing\` varchar(40) NULL, \`hoa\` varchar(60) NULL, \`is_featured\` tinyint(1) NOT NULL DEFAULT '0', \`is_active\` tinyint(1) NOT NULL DEFAULT '1', \`listed_at\` date NULL, \`description\` text NULL, \`amenities\` json NULL, \`images\` json NULL, \`meta_title\` varchar(255) NULL, \`meta_description\` varchar(320) NULL, INDEX \`IDX_base_deleted\` (\`deleted_at\`), UNIQUE INDEX \`UQ_properties_slug\` (\`slug\`), INDEX \`IDX_properties_type\` (\`type\`), INDEX \`IDX_properties_region\` (\`region\`), INDEX \`IDX_properties_featured\` (\`is_featured\`), INDEX \`IDX_properties_listing\` (\`is_active\`, \`sort_order\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_properties_listing\` ON \`properties\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_properties_featured\` ON \`properties\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_properties_region\` ON \`properties\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_properties_type\` ON \`properties\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_properties_slug\` ON \`properties\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_base_deleted\` ON \`properties\``,
    );
    await queryRunner.query(`DROP TABLE \`properties\``);
  }
}
