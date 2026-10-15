/**
 * Seed 3 danh mục và 3 bài Market Updates & Guides mẫu của Sean Truong Real Estate.
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo slug, bài / danh mục đã có giữ nguyên, nên chạy lại db:seed an toàn.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';

@Injectable()
export class BlogSeed {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,
  ) {}

  async run(): Promise<void> {
    const categories = [
      {
        name: 'Market Update',
        slug: 'market-update',
        description: 'Prices, inventory and rates across Orange County and the Bay Area',
        sortOrder: 1,
      },
      {
        name: 'Buyer & Seller Guides',
        slug: 'guides',
        description: 'Step-by-step guides for buying and selling a home in California',
        sortOrder: 2,
      },
      {
        name: 'Relocation',
        slug: 'relocation',
        description: 'Moving to California — foreign buyers, schools and communities',
        sortOrder: 3,
      },
    ];

    for (const category of categories) {
      const existing = await this.categoryRepo.findOneBy({
        slug: category.slug,
      });
      if (existing) continue;
      await this.categoryRepo.save(this.categoryRepo.create(category));
    }

    const savedCategories = await this.categoryRepo.find();
    const categoryIdBySlug = new Map(
      savedCategories.map((item) => [item.slug, item.id]),
    );

    const posts: Partial<BlogPost>[] = [
      {
        title: '2026 Orange County Market Update',
        slug: '2026-orange-county-market-update',
        categoryId: categoryIdBySlug.get('market-update'),
        excerpt:
          'Where prices, inventory, and rates are heading this fall — and what it means for buyers and sellers.',
        content:
          '<p>Orange County home prices have held firm through the summer, supported by limited inventory in Irvine, Newport Beach, and Tustin.</p>' +
          '<p>Mortgage rates have eased slightly, bringing more buyers back to open houses. For sellers, well-prepared homes priced to the market continue to receive multiple offers.</p>' +
          '<p>Thinking about your next move? Schedule a consultation for a neighborhood-by-neighborhood look at the numbers.</p>',
        coverImagePath:
          'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=75',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-08-02T08:00:00Z'),
        sortOrder: 1,
      },
      {
        title: 'Buyer Guide: From Pre-Approval to Keys',
        slug: 'buyer-guide-from-pre-approval-to-keys',
        categoryId: categoryIdBySlug.get('guides'),
        excerpt:
          'A step-by-step walkthrough of the California home-buying process, including escrow, title, and closing costs.',
        content:
          '<p>Buying a home in California starts with a mortgage pre-approval, so you know your budget and can make a confident offer.</p>' +
          '<p>Once your offer is accepted, escrow opens: inspections, appraisal, loan approval, and title review all happen within the contingency period.</p>' +
          '<p>At closing you sign the final documents, funds are wired, the deed is recorded — and you get the keys.</p>',
        coverImagePath:
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=75',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-07-24T08:00:00Z'),
        sortOrder: 2,
      },
      {
        title: 'Relocating to California From Abroad',
        slug: 'relocating-to-california-from-abroad',
        categoryId: categoryIdBySlug.get('relocation'),
        excerpt:
          'What foreign buyers and new arrivals need to know — financing, schools, communities, and settling in.',
        content:
          '<p>Foreign buyers can purchase property in California, but financing options, documentation, and tax considerations differ from those of local buyers.</p>' +
          '<p>Choosing the right community often comes down to schools, commute, and culture — Orange County and the Bay Area each offer strong options for families.</p>' +
          '<p>Sean works with clients in English and Vietnamese to make the move as smooth as possible.</p>',
        coverImagePath:
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=75',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-07-15T08:00:00Z'),
        sortOrder: 3,
      },
    ];

    let createdCount = 0;
    for (const post of posts) {
      const existing = await this.postRepo.findOneBy({ slug: post.slug });
      if (existing) continue;
      await this.postRepo.save(this.postRepo.create(post));
      createdCount++;
    }

    console.log(
      createdCount > 0
        ? `--- [Seed] Blog: created ${createdCount} post(s).`
        : '--- [Seed] Blog: nothing missing, skipping.',
    );
  }
}
