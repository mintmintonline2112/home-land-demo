/**
 * Migration làm mới trang About trong database: dải đầu trang có ảnh nền + dòng lead, section "background" dùng bố cục split,
 * "testimonials" dùng spotlight trên nền navy, "network" dùng bố cục rows trên nền trắng. Section "profile" giữ nguyên.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: ảnh / lead chỉ điền khi đang trống (admin đã tự đặt thì giữ). Layout + nền ghi đè bằng JSON_SET; down gỡ layout và trả nền cũ.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const ABOUT_SLUG = 'about';
const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=80';
const HERO_IMAGE_POSITION = '50% 60%';
const HERO_LEAD =
  'Local expertise, honest advice and bilingual service for buyers and sellers across Orange County and the Bay Area.';

const SECTION_LOOKS = [
  { sectionKey: 'background', layout: 'split', background: 'tint', previousBackground: 'tint' },
  { sectionKey: 'testimonials', layout: 'spotlight', background: 'dark', previousBackground: 'plain' },
  { sectionKey: 'network', layout: 'rows', background: 'plain', previousBackground: 'tint' },
];

const ABOUT_SECTION_FILTER =
  '`section_key` = ? AND `page_id` = (SELECT `id` FROM `pages` WHERE `slug` = ? LIMIT 1)';

export class AboutPageLayouts1792300500000 implements MigrationInterface {
  name = 'AboutPageLayouts1792300500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `pages` SET `hero_image_path` = ?, `hero_image_position` = ? WHERE `slug` = ? AND (`hero_image_path` IS NULL OR `hero_image_path` = \'\')',
      [HERO_IMAGE_URL, HERO_IMAGE_POSITION, ABOUT_SLUG],
    );
    await queryRunner.query(
      'UPDATE `pages` SET `lead` = ? WHERE `slug` = ? AND (`lead` IS NULL OR `lead` = \'\')',
      [HERO_LEAD, ABOUT_SLUG],
    );
    for (const look of SECTION_LOOKS) {
      await queryRunner.query(
        `UPDATE \`page_sections\` SET \`metadata\` = JSON_SET(COALESCE(\`metadata\`, '{}'), '$.layout', ?, '$.background', ?) WHERE ${ABOUT_SECTION_FILTER}`,
        [look.layout, look.background, look.sectionKey, ABOUT_SLUG],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const look of SECTION_LOOKS) {
      await queryRunner.query(
        `UPDATE \`page_sections\` SET \`metadata\` = JSON_SET(JSON_REMOVE(\`metadata\`, '$.layout'), '$.background', ?) WHERE ${ABOUT_SECTION_FILTER}`,
        [look.previousBackground, look.sectionKey, ABOUT_SLUG],
      );
    }
    await queryRunner.query(
      'UPDATE `pages` SET `hero_image_path` = NULL, `hero_image_position` = NULL WHERE `slug` = ? AND `hero_image_path` = ?',
      [ABOUT_SLUG, HERO_IMAGE_URL],
    );
    await queryRunner.query('UPDATE `pages` SET `lead` = NULL WHERE `slug` = ? AND `lead` = ?', [ABOUT_SLUG, HERO_LEAD]);
  }
}
