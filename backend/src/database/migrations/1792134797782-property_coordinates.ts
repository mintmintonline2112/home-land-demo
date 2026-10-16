/**
 * Migration thêm toạ độ (latitude, longitude) + index cho bảng properties để ghim nhà lên bản đồ — sinh bằng TypeORM migration:generate,
 * đã bỏ các câu thừa đụng bảng / index khác.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 */
import { MigrationInterface, QueryRunner } from "typeorm";

export class PropertyCoordinates1792134797782 implements MigrationInterface {
    name = 'PropertyCoordinates1792134797782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`properties\` ADD \`latitude\` double NULL`);
        await queryRunner.query(`ALTER TABLE \`properties\` ADD \`longitude\` double NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_properties_location\` ON \`properties\` (\`latitude\`, \`longitude\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_properties_location\` ON \`properties\``);
        await queryRunner.query(`ALTER TABLE \`properties\` DROP COLUMN \`longitude\``);
        await queryRunner.query(`ALTER TABLE \`properties\` DROP COLUMN \`latitude\``);
    }

}
