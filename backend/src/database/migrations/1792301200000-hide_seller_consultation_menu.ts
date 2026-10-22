/**
 * Migration ẩn mục con "Seller Consultation" (/contact?topic=sell) trong menu Sell — menu Sell chỉ còn "Home Valuation".
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ tắt is_active (bật lại được trong Admin → Menu), giữ dòng để db:seed không chèn lại. Chủ đề "Seller Consultation" của form
 * Liên hệ và link ở footer không đổi.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const SELLER_CONSULTATION_FILTER =
  "`label` = 'Seller Consultation' AND `href` = '/contact?topic=sell' AND `parent_id` IS NOT NULL";

export class HideSellerConsultationMenu1792301200000 implements MigrationInterface {
  name = 'HideSellerConsultationMenu1792301200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE \`menu_items\` SET \`is_active\` = 0 WHERE ${SELLER_CONSULTATION_FILTER}`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE \`menu_items\` SET \`is_active\` = 1 WHERE ${SELLER_CONSULTATION_FILTER}`);
  }
}
