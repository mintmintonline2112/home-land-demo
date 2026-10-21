/**
 * Seed menu điều hướng chính của website (Buy, Sell, Orange County, Areas, Blogs, About Sean, Contact và mục con).
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo href — mục đã có (kể cả admin đã sửa / ẩn / xoá mềm) giữ nguyên, nên chạy lại db:seed trên production an toàn.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MenuItem } from 'src/modules/admin/menu-items/menu-item.entity';

interface SeedMenuChild {
  label: string;
  href: string;
}

interface SeedMenuItem {
  label: string;
  href: string;
  description?: string;
  showSubmenu?: boolean;
  children?: SeedMenuChild[];
}

const areaChild = (label: string, keyword: string): SeedMenuChild => ({
  label,
  href: `/properties?keyword=${encodeURIComponent(keyword)}`,
});

const MENU_TREE: SeedMenuItem[] = [
  {
    label: 'Buy',
    href: '/properties',
    children: [
      { label: 'Property Search', href: '/properties' },
      { label: 'Featured Homes', href: '/#featured' },
      { label: 'Buyer Consultation', href: '/contact?topic=buy' },
    ],
  },
  {
    label: 'Sell',
    href: '/contact?topic=sell',
    children: [
      { label: 'Home Valuation', href: '/home-valuation' },
      { label: 'Seller Consultation', href: '/contact?topic=sell' },
    ],
  },
  {
    label: 'Orange County',
    href: '/properties?keyword=Orange%20County',
    showSubmenu: false,
  },
  {
    label: 'Areas',
    href: '/properties#areas',
    children: [
      areaChild('Irvine', 'Irvine'),
      areaChild('Newport Beach', 'Newport Beach'),
      areaChild('Tustin & North Tustin', 'Tustin'),
      areaChild('Villa Park', 'Villa Park'),
      areaChild('Anaheim Hills', 'Anaheim Hills'),
      areaChild('Orange', 'Orange'),
      areaChild('Garden Grove', 'Garden Grove'),
      areaChild('Westminster (Little Saigon)', 'Westminster'),
      areaChild('San Francisco', 'San Francisco'),
      areaChild('San Jose', 'San Jose'),
      areaChild('Silicon Valley', 'Silicon Valley'),
      areaChild('Bay Area', 'Bay Area'),
    ],
  },
  {
    label: 'Blogs',
    href: '/news',
    children: [
      { label: 'Market Updates', href: '/news?category=market-update' },
      { label: 'Buyer & Seller Guides', href: '/news?category=guides' },
      { label: 'Relocation', href: '/news?category=relocation' },
    ],
  },
  {
    label: 'About Sean',
    href: '/about',
    showSubmenu: false,
  },
  {
    label: 'Contact',
    href: '/contact',
    showSubmenu: false,
  },
];

@Injectable()
export class MenuSeed {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
  ) {}

  async run(): Promise<void> {
    let createdCount = 0;
    let rootOrder = 0;

    for (const item of MENU_TREE) {
      rootOrder++;
      let root = await this.menuRepo.findOne({
        where: { href: item.href, parentId: IsNull() },
        withDeleted: true,
      });

      if (!root) {
        root = await this.menuRepo.save(
          this.menuRepo.create({
            label: item.label,
            href: item.href,
            description: item.description ?? null,
            parentId: null,
            isActive: true,
            showSubmenu: item.showSubmenu ?? true,
            sortOrder: rootOrder,
          }),
        );
        createdCount++;
      }

      let childOrder = 0;
      for (const child of item.children ?? []) {
        childOrder++;
        const existing = await this.menuRepo.findOne({
          where: { href: child.href, parentId: root.id },
          withDeleted: true,
        });
        if (existing) continue;

        await this.menuRepo.save(
          this.menuRepo.create({
            label: child.label,
            href: child.href,
            parentId: root.id,
            isActive: true,
            sortOrder: childOrder,
          }),
        );
        createdCount++;
      }
    }

    console.log(
      createdCount > 0
        ? `Menu seed: created ${createdCount} missing item(s).`
        : 'Menu seed: nothing missing, skipping.',
    );
  }
}
