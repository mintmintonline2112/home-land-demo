/**
 * Migration đổi cột thứ 4 của dải số liệu trang chủ (section key-figures) từ "EN · VI / Bilingual Service" sang con số chứng minh uy tín:
 * "70+ Countries Worldwide" — mạng lưới LeadingRE® (500+ công ty môi giới, 70+ quốc gia; RISMedia / HousingWire 2025–2026).
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ đổi khi cột 4 vẫn đang là "EN · VI"; admin đã sửa thì giữ nguyên.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const BILINGUAL_STAT = { value: 'EN · VI', label: 'Bilingual Service', note: 'English & Tiếng Việt' };
const GLOBAL_REACH_STAT = { value: '70+', label: 'Countries Worldwide', note: 'LeadingRE® — 500+ member firms' };

const HOME_KEY_FIGURES_FILTER =
  "`section_key` = 'key-figures' AND `page_id` = (SELECT `id` FROM `pages` WHERE `slug` = 'home' LIMIT 1)";

export class KeyFiguresGlobalReach1792301100000 implements MigrationInterface {
  name = 'KeyFiguresGlobalReach1792301100000';

  private replaceFourthStat(queryRunner: QueryRunner, from: { value: string }, to: object) {
    return queryRunner.query(
      `UPDATE \`page_sections\` SET \`metadata\` = JSON_SET(\`metadata\`, '$.stats[3]', JSON_EXTRACT(?, '$')) WHERE ${HOME_KEY_FIGURES_FILTER} AND JSON_UNQUOTE(JSON_EXTRACT(\`metadata\`, '$.stats[3].value')) = ?`,
      [JSON.stringify(to), from.value],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.replaceFourthStat(queryRunner, BILINGUAL_STAT, GLOBAL_REACH_STAT);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.replaceFourthStat(queryRunner, GLOBAL_REACH_STAT, BILINGUAL_STAT);
  }
}
