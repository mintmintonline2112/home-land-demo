/**
 * Migration gỡ field mapNote ("Map placeholder — Google Maps integration coming in a later phase") khỏi các section contact —
 * khung bản đồ giờ chỉ hiện khi admin đã nhập link Google Maps, không còn khung chờ.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: down không khôi phục dòng chữ cũ vì component không còn dùng field này.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContactMapNote1792301300000 implements MigrationInterface {
  name = 'RemoveContactMapNote1792301300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `page_sections` SET `metadata` = JSON_REMOVE(`metadata`, '$.mapNote') WHERE JSON_EXTRACT(`metadata`, '$.mapNote') IS NOT NULL",
    );
  }

  public async down(): Promise<void> {}
}
