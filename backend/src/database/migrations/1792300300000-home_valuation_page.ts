/**
 * Migration trỏ các link "Home Valuation" cũ (/contact?topic=valuation) sang trang định giá nhà mới /home-valuation: mục con của menu Sell
 * và nút CTA trong các section (section sell-cta trang chủ).
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ đổi đúng link cũ; mục / section admin đã sửa sang link khác thì giữ nguyên. Chủ đề "valuation" của form Liên hệ không đổi.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_HREF = '/contact?topic=valuation';
const NEW_HREF = '/home-valuation';

export class HomeValuationPage1792300300000 implements MigrationInterface {
  name = 'HomeValuationPage1792300300000';

  private async replaceHref(queryRunner: QueryRunner, from: string, to: string) {
    await queryRunner.query('UPDATE `menu_items` SET `href` = ? WHERE `href` = ?', [to, from]);
    await queryRunner.query(
      'UPDATE `page_sections` SET `metadata` = REPLACE(CAST(`metadata` AS CHAR), ?, ?) WHERE CAST(`metadata` AS CHAR) LIKE ?',
      [`"${from}"`, `"${to}"`, `%"${from}"%`],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replaceHref(queryRunner, OLD_HREF, NEW_HREF);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.replaceHref(queryRunner, NEW_HREF, OLD_HREF);
  }
}
