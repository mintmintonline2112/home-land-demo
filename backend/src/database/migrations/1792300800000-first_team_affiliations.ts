/**
 * Migration cập nhật đoạn mô tả First Team trong các section đã có: thẻ "First Team Network" (trang chủ) và "First Team Real Estate"
 * (trang About) nói rõ First Team là thành viên sáng lập Luxury Portfolio International® và thuộc Leading Real Estate Companies of the World®.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ thay đúng câu cũ trong metadata; admin đã tự viết lại thì giữ nguyên. Nguồn: Inman 10/2023, trang agent của firstteam.com.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const TEXT_CHANGES = [
  {
    from: "Backed by one of Southern California's leading brokerages — with the reach, tools, and marketing to match.",
    to: "Backed by one of Southern California's leading independent brokerages and its global luxury network — Luxury Portfolio International® and LeadingRE®.",
  },
  {
    from: "Part of one of Southern California's leading independent brokerages, with deep market reach and marketing power.",
    to: 'A founding member of Luxury Portfolio International® and part of Leading Real Estate Companies of the World® — global reach for every listing.',
  },
];

export class FirstTeamAffiliations1792300800000 implements MigrationInterface {
  name = 'FirstTeamAffiliations1792300800000';

  private replaceText(queryRunner: QueryRunner, from: string, to: string) {
    return queryRunner.query(
      'UPDATE `page_sections` SET `metadata` = REPLACE(CAST(`metadata` AS CHAR), ?, ?) WHERE CAST(`metadata` AS CHAR) LIKE ?',
      [from, to, `%${from}%`],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const change of TEXT_CHANGES) await this.replaceText(queryRunner, change.from, change.to);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const change of TEXT_CHANGES) await this.replaceText(queryRunner, change.to, change.from);
  }
}
