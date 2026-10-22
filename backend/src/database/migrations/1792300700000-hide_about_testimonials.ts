/**
 * Migration ẩn section "What Clients Say" (testimonials) của trang About — tắt is_active, không xoá dữ liệu.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: muốn hiện lại thì bật section trong Admin → Trang → About. Giữ dòng trong DB để db:seed không chèn lại section này.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const ABOUT_TESTIMONIALS_FILTER =
  "`section_key` = 'testimonials' AND `page_id` = (SELECT `id` FROM `pages` WHERE `slug` = 'about' LIMIT 1)";

export class HideAboutTestimonials1792300700000 implements MigrationInterface {
  name = 'HideAboutTestimonials1792300700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE \`page_sections\` SET \`is_active\` = 0 WHERE ${ABOUT_TESTIMONIALS_FILTER}`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE \`page_sections\` SET \`is_active\` = 1 WHERE ${ABOUT_TESTIMONIALS_FILTER}`);
  }
}
