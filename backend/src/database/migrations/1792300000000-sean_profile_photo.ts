/**
 * Migration thay ảnh chân dung mẫu (Unsplash) của Sean trong các section đã có trong database bằng ảnh thật trong Thư viện
 * (uploads/team/sean-truong.jpg) — trang chủ (About Sean) và trang About.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ đổi đúng link ảnh cũ; section admin đã tự đổi sang ảnh khác thì giữ nguyên. File ảnh đi theo git ở backend/uploads/team/.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_PHOTO_URL =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80';
const NEW_PHOTO_PATH = 'uploads/team/sean-truong.jpg';

export class SeanProfilePhoto1792300000000 implements MigrationInterface {
  name = 'SeanProfilePhoto1792300000000';

  private replacePhoto(queryRunner: QueryRunner, from: string, to: string) {
    return queryRunner.query(
      'UPDATE `page_sections` SET `metadata` = REPLACE(CAST(`metadata` AS CHAR), ?, ?) WHERE CAST(`metadata` AS CHAR) LIKE ?',
      [from, to, `%${from}%`],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replacePhoto(queryRunner, OLD_PHOTO_URL, NEW_PHOTO_PATH);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.replacePhoto(queryRunner, NEW_PHOTO_PATH, OLD_PHOTO_URL);
  }
}
