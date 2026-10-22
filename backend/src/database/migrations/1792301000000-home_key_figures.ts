/**
 * Migration thay dải số liệu trang chủ (section key-figures): bỏ "Five-Star Reviews" / "Communities Served", dùng 4 số liệu chuyên nghiệp
 * hơn — 15+ năm kinh nghiệm, 350+ gia đình, mạng lưới 2,000+ agent FirstTeam® (Brokerage Network), phục vụ song ngữ — mỗi cột kèm dòng mô tả nhỏ.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ thay khi section còn bộ số cũ (nhận ra qua nhãn "Five-Star Reviews"); admin đã sửa thì giữ nguyên.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_STATS = [
  { value: '350+', label: 'Homes Sold' },
  { value: '15+', label: 'Years of Experience' },
  { value: '120+', label: 'Five-Star Reviews' },
  { value: '40+', label: 'Communities Served' },
];

const NEW_STATS = [
  { value: '15+', label: 'Years of Local Expertise', note: 'Orange County & the Bay Area' },
  { value: '350+', label: 'Families Guided Home', note: 'Buyers, sellers & investors' },
  { value: '2,000+', label: 'Brokerage Network', note: 'FirstTeam® agents across SoCal' },
  { value: 'EN · VI', label: 'Bilingual Service', note: 'English & Tiếng Việt' },
];

const HOME_KEY_FIGURES_FILTER =
  "`section_key` = 'key-figures' AND `page_id` = (SELECT `id` FROM `pages` WHERE `slug` = 'home' LIMIT 1)";

export class HomeKeyFigures1792301000000 implements MigrationInterface {
  name = 'HomeKeyFigures1792301000000';

  private setStats(queryRunner: QueryRunner, stats: unknown[], markerLabel: string) {
    return queryRunner.query(
      `UPDATE \`page_sections\` SET \`metadata\` = JSON_SET(\`metadata\`, '$.stats', JSON_EXTRACT(?, '$')) WHERE ${HOME_KEY_FIGURES_FILTER} AND CAST(\`metadata\` AS CHAR) LIKE ?`,
      [JSON.stringify(stats), `%${markerLabel}%`],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.setStats(queryRunner, NEW_STATS, 'Five-Star Reviews');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.setStats(queryRunner, OLD_STATS, 'Bilingual Service');
  }
}
