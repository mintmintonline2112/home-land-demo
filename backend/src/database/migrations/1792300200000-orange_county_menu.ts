/**
 * Migration thay mục menu gốc "Luxury" (/properties?type=luxury) bằng "Orange County" — trang tìm nhà lọc sẵn các nhà ở quận Cam.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: link dùng từ khoá "Orange County", backend tự hiểu là toàn bộ thành phố Orange County (property-search.ts → KEYWORD_PLACE_ALIASES).
 * Chỉ đổi mục còn đúng link cũ; admin đã sửa link khác thì giữ nguyên.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_HREF = '/properties?type=luxury';
const NEW_HREF = '/properties?keyword=Orange%20County';

export class OrangeCountyMenu1792300200000 implements MigrationInterface {
  name = 'OrangeCountyMenu1792300200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `menu_items` SET `label` = ?, `href` = ? WHERE `href` = ? AND `parent_id` IS NULL',
      ['Orange County', NEW_HREF, OLD_HREF],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE `menu_items` SET `label` = ?, `href` = ? WHERE `href` = ? AND `parent_id` IS NULL',
      ['Luxury', OLD_HREF, NEW_HREF],
    );
  }
}
