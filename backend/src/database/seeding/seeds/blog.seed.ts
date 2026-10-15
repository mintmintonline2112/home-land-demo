/**
 * Seed 3 danh mục và 12 bài Market Updates & Guides mẫu của Sean Truong Real Estate (thị trường, hướng dẫn mua / bán, chuyển đến California).
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo slug, bài / danh mục đã có giữ nguyên, nên chạy lại db:seed an toàn.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';

const unsplash = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=75`;

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
      {
        title: 'Bay Area Housing Market: Fall 2026 Snapshot',
        slug: 'bay-area-housing-market-fall-2026',
        categoryId: categoryIdBySlug.get('market-update'),
        excerpt:
          'Silicon Valley demand stays strong while San Francisco condos offer new opportunities — here is what the numbers say this season.',
        content:
          '<p>Bay Area home prices held steady through late summer, with single-family homes in San Jose, Sunnyvale, and Mountain View still drawing multiple offers when priced well.</p>' +
          '<h2>Where buyers have room to negotiate</h2>' +
          '<p>San Francisco condos — especially in SoMa and Mission Bay — are sitting longer than single-family homes. That gives buyers more time, more inspection leverage, and occasionally seller credits toward closing costs.</p>' +
          '<h2>What sellers should know</h2>' +
          '<ul><li>Homes that are staged and professionally photographed still sell fastest.</li><li>Pricing slightly under recent comps is drawing the strongest offer activity.</li><li>Pre-listing inspections help reduce renegotiation in escrow.</li></ul>' +
          '<p>Thinking about a move this fall? Sean can prepare a neighborhood-by-neighborhood pricing report for your home or your target area.</p>',
        coverImagePath: unsplash('1513584684374-8bab748fbf90'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-28T08:00:00Z'),
        sortOrder: 4,
      },
      {
        title: 'Irvine vs. Tustin: Which Community Fits Your Family?',
        slug: 'irvine-vs-tustin-which-community-fits-your-family',
        categoryId: categoryIdBySlug.get('market-update'),
        excerpt:
          'Two of Orange County\'s most popular family communities compared — schools, home styles, prices, and commute.',
        content:
          '<p>Irvine and Tustin sit side by side, but they offer different lifestyles and price points. Here is a quick comparison to help you decide where to start your search.</p>' +
          '<h2>Irvine</h2>' +
          '<p>Master-planned villages, award-winning Irvine Unified schools, and resort-style community amenities. Newer construction is common, and most neighborhoods have an HOA and Mello-Roos.</p>' +
          '<h2>Tustin</h2>' +
          '<p>A mix of historic Old Town charm, newer Tustin Legacy homes, and large-lot estates in North Tustin — often with no HOA. Prices per square foot are typically lower than Irvine.</p>' +
          '<h2>Bottom line</h2>' +
          '<p>If newer homes and amenities are the priority, Irvine is hard to beat. If you want more land, character, or flexibility, Tustin deserves a close look.</p>',
        coverImagePath: unsplash('1600047509807-ba8f99d2cdde'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-10T08:00:00Z'),
        sortOrder: 5,
      },
      {
        title: 'Mortgage Rates This Fall: What Buyers Should Do Now',
        slug: 'mortgage-rates-this-fall-what-buyers-should-do',
        categoryId: categoryIdBySlug.get('market-update'),
        excerpt:
          'Rates have eased from their summer highs. Here is how to lock in, compare lenders, and stay competitive.',
        content:
          '<p>After a choppy summer, mortgage rates have eased slightly — enough to bring more buyers back into the market.</p>' +
          '<h2>Three moves for buyers</h2>' +
          '<ul><li><strong>Get fully underwritten pre-approval</strong> so your offer looks as strong as cash.</li><li><strong>Compare at least three lenders</strong> — small rate differences add up over 30 years.</li><li><strong>Ask about rate buydowns</strong>, which sellers sometimes fund as a credit.</li></ul>' +
          '<p>Sean works with trusted local lenders for conventional, jumbo, and foreign-national loans and can make introductions at any stage.</p>',
        coverImagePath: unsplash('1484154218962-a197022b5858'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-08-20T08:00:00Z'),
        sortOrder: 6,
      },
      {
        title: 'Seller Guide: 10 Ways to Prepare Your Home for Market',
        slug: 'seller-guide-10-ways-to-prepare-your-home',
        categoryId: categoryIdBySlug.get('guides'),
        excerpt:
          'Simple, high-impact steps that help your home sell faster and for more — from decluttering to pre-listing inspections.',
        content:
          '<p>First impressions drive offers. These ten steps consistently deliver the best return before you list.</p>' +
          '<ol><li>Declutter and depersonalize every room.</li><li>Deep clean, including windows and carpets.</li><li>Fresh, neutral paint where needed.</li><li>Fix small repairs — leaky faucets, sticky doors, burned-out bulbs.</li><li>Boost curb appeal with fresh mulch and a clean entry.</li><li>Brighten rooms with warm, consistent lighting.</li><li>Stage key rooms: living room, kitchen, primary bedroom.</li><li>Order a pre-listing inspection.</li><li>Gather permits, warranties, and utility costs.</li><li>Invest in professional photography and video.</li></ol>' +
          '<p>Sean provides a custom marketing plan — including staging advice and professional media — with every listing.</p>',
        coverImagePath: unsplash('1600566753086-00f18fb6b3ea'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-18T08:00:00Z'),
        sortOrder: 7,
      },
      {
        title: 'Understanding Escrow and Closing Costs in California',
        slug: 'understanding-escrow-and-closing-costs-in-california',
        categoryId: categoryIdBySlug.get('guides'),
        excerpt:
          'What happens during escrow, who pays what, and how to budget for closing costs as a buyer or seller.',
        content:
          '<p>In California, a neutral escrow company holds funds and documents until every condition of the sale is met. A typical escrow lasts 30 days.</p>' +
          '<h2>Buyer closing costs</h2>' +
          '<p>Plan for roughly 2–3% of the purchase price: lender fees, appraisal, title insurance for the lender, escrow fees, prepaid taxes and insurance.</p>' +
          '<h2>Seller closing costs</h2>' +
          '<p>Sellers usually cover the owner\'s title policy, transfer taxes, their share of escrow fees, and agent commissions.</p>' +
          '<p>Every transaction is different — Sean will walk you through an estimated net sheet or closing cost breakdown before you sign.</p>',
        coverImagePath: unsplash('1560185007-cde436f6a4d0'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-08-12T08:00:00Z'),
        sortOrder: 8,
      },
      {
        title: 'First-Time Buyer Programs in Orange County',
        slug: 'first-time-buyer-programs-in-orange-county',
        categoryId: categoryIdBySlug.get('guides'),
        excerpt:
          'Down payment assistance, low-down-payment loans, and tips to make your first purchase more affordable.',
        content:
          '<p>Buying your first home in Orange County can feel out of reach, but several programs can help close the gap.</p>' +
          '<ul><li><strong>CalHFA loans</strong> with down payment and closing cost assistance.</li><li><strong>FHA loans</strong> with as little as 3.5% down.</li><li><strong>Conventional 3%-down loans</strong> for qualified first-time buyers.</li></ul>' +
          '<p>Eligibility depends on income, credit, and the property. Sean can connect you with lenders who specialize in first-time buyer programs.</p>',
        coverImagePath: unsplash('1576941089067-2de3c901e126'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-07-30T08:00:00Z'),
        sortOrder: 9,
      },
      {
        title: 'Buying a Home in California as a Foreign National',
        slug: 'buying-a-home-in-california-as-a-foreign-national',
        categoryId: categoryIdBySlug.get('relocation'),
        excerpt:
          'Financing, taxes, and documents international buyers need — plus how to manage a purchase from overseas.',
        content:
          '<p>There is no citizenship requirement to own property in California. International buyers purchase homes every year, often with cash or a foreign-national mortgage.</p>' +
          '<h2>Financing</h2>' +
          '<p>Foreign-national loans usually require 25–40% down, proof of income, and reserves. Some lenders accept international credit reports.</p>' +
          '<h2>Taxes</h2>' +
          '<p>FIRPTA withholding may apply when a foreign owner sells. Work with a tax professional familiar with cross-border ownership.</p>' +
          '<h2>Buying remotely</h2>' +
          '<p>Video tours, e-signatures, and remote notarization make it possible to purchase without being in the U.S. for every step.</p>' +
          '<p>Planning a longer-term move? Sean partners with Worldwide Path for immigration planning resources.</p>',
        coverImagePath: unsplash('1416331108676-a22ccb276e35'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-22T08:00:00Z'),
        sortOrder: 10,
      },
      {
        title: 'Best Neighborhoods for Vietnamese Families in Orange County',
        slug: 'best-neighborhoods-for-vietnamese-families-in-orange-county',
        categoryId: categoryIdBySlug.get('relocation'),
        excerpt:
          'From Little Saigon to Irvine\'s top school districts — communities where Vietnamese-American families feel at home.',
        content:
          '<p>Orange County is home to the largest Vietnamese-American community in the country. Here are areas families most often ask about.</p>' +
          '<h2>Westminster &amp; Garden Grove</h2>' +
          '<p>The heart of Little Saigon — restaurants, markets, temples, and community events, with relatively affordable single-family homes.</p>' +
          '<h2>Fountain Valley &amp; Huntington Beach</h2>' +
          '<p>Quiet suburban streets, strong schools, and quick access to Little Saigon and the beach.</p>' +
          '<h2>Irvine &amp; Tustin</h2>' +
          '<p>Popular with families prioritizing top-rated schools and newer homes.</p>' +
          '<p>Sean serves clients in English and Vietnamese — call or text to talk through which community fits your family.</p>',
        coverImagePath: unsplash('1592595896551-12b371d546d5'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-08-05T08:00:00Z'),
        sortOrder: 11,
      },
      {
        title: 'Choosing a School District When You Move to California',
        slug: 'choosing-a-school-district-when-you-move-to-california',
        categoryId: categoryIdBySlug.get('relocation'),
        excerpt:
          'How school boundaries affect home values, and how to research districts in Orange County and the Bay Area.',
        content:
          '<p>For many relocating families, schools drive the entire home search. In California, your address determines your assigned public school.</p>' +
          '<h2>How to research</h2>' +
          '<ul><li>Confirm boundaries directly with the district — listing descriptions can be outdated.</li><li>Visit schools and talk with parents in the neighborhood.</li><li>Look at program offerings, not just test scores.</li></ul>' +
          '<h2>Home values</h2>' +
          '<p>Homes in top districts like Irvine Unified, Palo Alto Unified, and Cupertino Union typically hold value well and resell quickly.</p>',
        coverImagePath: unsplash('1502672260266-1c1ef2d93688'),
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-06-24T08:00:00Z'),
        sortOrder: 12,
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
