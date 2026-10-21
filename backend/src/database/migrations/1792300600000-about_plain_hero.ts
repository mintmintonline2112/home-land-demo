/**
 * Migration đưa dải đầu trang About về kiểu trang Contact: nền navy trơn, chỉ tiêu đề + breadcrumb — gỡ ảnh nền bờ biển và dòng lead
 * mà migration 1792300500000-about_page_layouts đã điền.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ gỡ khi còn đúng ảnh / lead đó; admin đã tự đổi sang giá trị khác thì giữ nguyên. Bố cục các section bên dưới không đổi.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const ABOUT_SLUG = 'about';
const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=80';
const HERO_IMAGE_POSITION = '50% 60%';
const HERO_LEAD =
  'Local expertise, honest advice and bilingual service for buyers and sellers across Orange County and the Bay Area.';

export class AboutPlainHero1792300600000 implements MigrationInterface {
  name = 'AboutPlainHero1792300600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `pages` SET `hero_image_path` = NULL, `hero_image_position` = NULL WHERE `slug` = ? AND `hero_image_path` = ?',
      [ABOUT_SLUG, HERO_IMAGE_URL],
    );
    await queryRunner.query('UPDATE `pages` SET `lead` = NULL WHERE `slug` = ? AND `lead` = ?', [ABOUT_SLUG, HERO_LEAD]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `pages` SET `hero_image_path` = ?, `hero_image_position` = ? WHERE `slug` = ? AND `hero_image_path` IS NULL',
      [HERO_IMAGE_URL, HERO_IMAGE_POSITION, ABOUT_SLUG],
    );
    await queryRunner.query('UPDATE `pages` SET `lead` = ? WHERE `slug` = ? AND `lead` IS NULL', [HERO_LEAD, ABOUT_SLUG]);
  }
}
