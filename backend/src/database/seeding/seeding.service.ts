/**
 * Chạy lần lượt các seed: quyền → vai trò → nhân viên → blog → trang → định nghĩa section → menu.
 * Dùng bởi: src/seed.ts (qua seeding.module.ts).
 * Lưu ý: giữ đúng thứ tự — vai trò cần quyền, nhân viên cần vai trò.
 */
import { Injectable } from '@nestjs/common';
import { PermissionSeed } from './seeds/permission.seed';
import { RoleSeed } from './seeds/role.seed';
import { StaffSeed } from './seeds/staff.seed';
import { BlogSeed } from './seeds/blog.seed';
import { PageSeed } from './seeds/page.seed';
import { SectionDefinitionSeed } from './seeds/section-definition.seed';
import { MenuSeed } from './seeds/menu.seed';

@Injectable()
export class SeedingService {
  constructor(
    private readonly permissionSeed: PermissionSeed,
    private readonly roleSeed: RoleSeed,
    private readonly staffSeed: StaffSeed,
    private readonly blogSeed: BlogSeed,
    private readonly pageSeed: PageSeed,
    private readonly sectionDefinitionSeed: SectionDefinitionSeed,
    private readonly menuSeed: MenuSeed,
  ) {}

  async run(): Promise<void> {
    console.log('--- Start Seeding ---');
    await this.permissionSeed.run();
    await this.roleSeed.run();
    await this.staffSeed.run();
    await this.blogSeed.run();
    await this.pageSeed.run();
    await this.sectionDefinitionSeed.run();
    await this.menuSeed.run();
  }
}
