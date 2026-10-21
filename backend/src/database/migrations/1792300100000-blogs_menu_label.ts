/**
 * Migration đổi tên mục menu gốc "Resources" (trỏ tới /news) thành "Blogs" trong database đã có sẵn menu.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ đổi mục gốc còn đúng tên cũ "Resources"; admin đã tự đặt tên khác thì giữ nguyên. Website hiện menu thả xuống Blogs
 * (tab danh mục + bài mới) cho mục menu nào trỏ tới /news, không phụ thuộc tên.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlogsMenuLabel1792300100000 implements MigrationInterface {
  name = 'BlogsMenuLabel1792300100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `menu_items` SET `label` = 'Blogs' WHERE `label` = 'Resources' AND `href` = '/news' AND `parent_id` IS NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `menu_items` SET `label` = 'Resources' WHERE `label` = 'Blogs' AND `href` = '/news' AND `parent_id` IS NULL",
    );
  }
}
