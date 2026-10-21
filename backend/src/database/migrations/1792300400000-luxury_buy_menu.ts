/**
 * Migration đổi mục con "Buyer Consultation" (/contact?topic=buy) của menu Buy thành "Luxury" — trang tìm nhà lọc sẵn nhà giá từ $5M.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: link dùng bộ lọc giá "5000+" (nghìn USD, xem property-search.ts → parsePriceRange), không dùng loại nhà "luxury".
 * Chỉ đổi mục con còn đúng link cũ; admin đã sửa link khác thì giữ nguyên.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_LABEL = 'Buyer Consultation';
const OLD_HREF = '/contact?topic=buy';
const NEW_LABEL = 'Luxury';
const NEW_HREF = '/properties?price=5000%2B';

export class LuxuryBuyMenu1792300400000 implements MigrationInterface {
  name = 'LuxuryBuyMenu1792300400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `menu_items` SET `label` = ?, `href` = ? WHERE `href` = ? AND `parent_id` IS NOT NULL',
      [NEW_LABEL, NEW_HREF, OLD_HREF],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `menu_items` SET `label` = ?, `href` = ? WHERE `href` = ? AND `parent_id` IS NOT NULL',
      [OLD_LABEL, OLD_HREF, NEW_HREF],
    );
  }
}
