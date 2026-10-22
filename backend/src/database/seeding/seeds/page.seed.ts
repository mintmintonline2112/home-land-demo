/**
 * Nội dung mặc định của website Sean Truong Real Estate (trang + section) — nguồn nội dung DUY NHẤT, component không có chữ mặc định.
 * Dùng bởi: database/seeding/seeding.service.ts; src/scripts/export-content.ts (`npm run content:export` sinh bản dự phòng cho frontend).
 * Lưu ý: nội dung lấy từ bản demo homeland (thư mục frontend/); ảnh chân dung của Sean nằm trong Thư viện (backend/uploads/team/),
 * các ảnh còn lại tạm dùng link Unsplash của bản demo.
 * sectionKey = id neo trên trang; metadata._component = component trong registry frontend, metadata.layout = bố cục.
 * Chỉ thêm theo slug / sectionKey, không đè chỉnh sửa của admin — chạy lại db:seed an toàn.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';

export type PageDefinition = {
  page: DeepPartial<Page> & { slug: string };
  sections: Array<DeepPartial<PageSection> & { sectionKey: string }>;
};

const unsplash = (photoId: string, width = 800) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;

const SEAN_PHOTO = 'uploads/team/sean-truong.jpg';

const areaHref = (keyword: string) => `/properties?keyword=${encodeURIComponent(keyword)}`;

export const PAGES: PageDefinition[] = [
  {
    page: {
      title: 'Home',
      slug: 'home',
      eyebrow: 'Sean Truong · First Team Real Estate',
      lead: 'Buying or selling in Orange County or the Bay Area — Sean brings 15+ years of local expertise, serving clients in English and Vietnamese.',
      templateKey: 'home',
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      metaTitle: 'Sean Truong | Orange County & Bay Area Real Estate',
      metaDescription:
        'Buy or sell a home in Orange County or the San Francisco Bay Area with Sean Truong, Realtor® at First Team Real Estate — serving clients in English and Vietnamese.',
    },
    sections: [
      {
        sectionKey: 'hero',
        heading: 'Your Trusted Guide to California Real Estate',
        subheading: 'Sean Truong · First Team Real Estate',
        content:
          '<p>Buying or selling in Orange County or the Bay Area — Sean brings 15+ years of local expertise, serving clients in English and Vietnamese.</p>',
        metadata: {
          _component: 'hero',
          layout: 'search',
          image: unsplash('1600596542815-ffad4c1539a9', 1800),
          imageAlt: 'Modern California home with a swimming pool',
          keywordLabel: 'Keyword',
          keywordPlaceholder: 'Community, street, ZIP...',
          areaLabel: 'Area',
          anyAreaLabel: 'All Areas',
          typeLabel: 'Property Type',
          anyTypeLabel: 'All Types',
          priceLabel: 'Price Range',
          anyPriceLabel: 'Any',
          searchLabel: 'Search',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'key-figures',
        metadata: {
          _component: 'stats',
          stats: [
            { value: '15+', label: 'Years of Local Expertise', note: 'Orange County & the Bay Area' },
            { value: '350+', label: 'Families Guided Home', note: 'Buyers, sellers & investors' },
            { value: '2,000+', label: 'Brokerage Network', note: 'FirstTeam® agents across SoCal' },
            { value: '70+', label: 'Countries Worldwide', note: 'LeadingRE® — 500+ member firms' },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'featured',
        heading: 'Featured Homes',
        subheading: 'Featured Listings',
        content: '<p>Hand-picked homes across Orange County and the Bay Area.</p>',
        metadata: {
          _component: 'property-grid',
          limit: '6',
          allLabel: 'All',
          ctaLabel: 'View All Listings',
          ctaHref: '/properties',
          background: 'plain',
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'areas',
        heading: 'Find Your Community',
        subheading: 'Areas We Serve',
        content:
          '<p>From coastal Orange County to the heart of Silicon Valley — explore the neighborhoods Sean knows best.</p>',
        metadata: {
          _component: 'media-cards',
          background: 'tint',
          items: [
            { title: 'Irvine', text: 'Master-planned communities & top schools', image: 'uploads/areas/irvine.jpg', alt: 'Irvine Spectrum office towers', credit: 'Photo: Sewageboy, CC BY 4.0', href: areaHref('Irvine') },
            { title: 'Newport Beach', text: 'Coastal luxury & harbor living', image: 'uploads/areas/newport-beach.jpg', alt: 'Aerial view of Newport Beach, Balboa Peninsula and pier', credit: 'Photo: Don Ramey Logan, CC BY 4.0', href: areaHref('Newport Beach') },
            { title: 'Tustin', text: 'Old Town charm & the historic blimp hangars', image: 'uploads/areas/tustin.jpg', alt: 'Historic blimp hangar in Tustin', credit: 'Photo: Robert A. Estremo, CC BY-SA 2.0', href: areaHref('Tustin') },
            { title: 'Anaheim Hills', text: 'View homes & golf communities', image: 'uploads/areas/anaheim-hills.jpg', alt: 'Sunset over the Anaheim Hills', credit: 'Photo: Jordan Wozniak, CC0', href: areaHref('Anaheim Hills') },
            { title: 'Orange & Villa Park', text: 'Old Towne charm & estate lots', image: 'uploads/areas/orange.jpg', alt: 'Fountain at the Plaza in Old Towne Orange', credit: 'Photo: Jeaniac, CC BY-SA 3.0', href: areaHref('Orange') },
            { title: 'Garden Grove', text: 'Christ Cathedral & family neighborhoods', image: 'uploads/areas/garden-grove.jpg', alt: 'Christ Cathedral campus in Garden Grove', credit: 'Photo: Farragutful, CC BY-SA 4.0', href: areaHref('Garden Grove') },
            { title: 'Westminster (Little Saigon)', text: 'Heart of the Vietnamese-American community', image: 'uploads/areas/westminster.jpg', alt: 'Asian Garden Mall on Bolsa Avenue, Little Saigon', credit: 'Photo: Orange County Archives, CC BY 2.0', href: areaHref('Westminster') },
            { title: 'San Francisco', text: 'Iconic city living', image: unsplash('1501594907352-04cda38ebc29'), alt: 'Golden Gate Bridge, San Francisco', href: areaHref('San Francisco') },
            { title: 'San Jose & Silicon Valley', text: 'Tech-hub neighborhoods', image: 'uploads/areas/san-jose.jpg', alt: 'Downtown San Jose skyline at night', credit: 'Photo: Ben Loomis, CC BY 2.0', href: areaHref('Silicon Valley') },
          ],
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'why-sean',
        heading: 'A Realtor Who Puts You First',
        subheading: 'Why Work With Sean',
        content:
          '<p>Every client gets the same commitment: honest advice, sharp negotiation, and full support from first call to closing.</p>',
        metadata: {
          _component: 'feature-cards',
          background: 'plain',
          items: [
            { title: 'Deep Local Expertise', text: '15+ years living and working in Orange County and the Bay Area — Sean knows every neighborhood\'s story.', icon: 'pin' },
            { title: 'First Team Network', text: 'Backed by one of Southern California\'s leading independent brokerages and its global luxury network — Luxury Portfolio International® and LeadingRE®.', icon: 'shield' },
            { title: 'English & Vietnamese', text: 'Fully bilingual service — contracts, negotiations, and guidance explained clearly in the language you prefer.', icon: 'chat' },
            { title: 'Proven Negotiation', text: 'A track record of winning offers for buyers and top-dollar results for sellers in competitive markets.', icon: 'dollar' },
          ],
        },
        sortOrder: 5,
      },
      {
        sectionKey: 'sell-cta',
        heading: 'Thinking of selling your home?',
        content: '<p>Get a free, no-obligation home valuation and a custom marketing strategy from Sean.</p>',
        metadata: {
          _component: 'cta-banner',
          ctaLabel: 'Get Your Home Valuation',
          ctaHref: '/home-valuation',
        },
        sortOrder: 6,
      },
      {
        sectionKey: 'about-sean',
        heading: 'Sean Truong',
        subheading: 'About Sean',
        content:
          '<p>For over 15 years, Sean has helped families, professionals, and international buyers find their place in California — from first condos in San Jose to estate homes in Newport Beach.</p>' +
          '<p>As a bilingual Vietnamese-American agent, Sean is especially proud to guide Vietnamese families through every step of the American home-buying journey.</p>',
        metadata: {
          _component: 'profile',
          background: 'tint',
          image: SEAN_PHOTO,
          imageAlt: 'Sean Truong, Realtor with First Team Real Estate',
          role: 'Realtor® · First Team Real Estate',
          highlights: ['350+ homes sold', 'Orange County & Bay Area', 'English & Vietnamese', 'Relocation & foreign buyers'],
          ctaLabel: 'More About Sean',
          ctaHref: '/about',
          cta2Label: 'Schedule Consultation',
          cta2Href: '/contact',
        },
        sortOrder: 7,
      },
      {
        sectionKey: 'resources',
        heading: 'Market Updates & Guides',
        subheading: 'Resources',
        content: '<p>Insights to help you buy, sell, and settle in California with confidence.</p>',
        metadata: {
          _component: 'post-cards',
          background: 'plain',
          limit: '3',
          moreLabel: 'Continue',
        },
        sortOrder: 8,
      },
    ],
  },
  {
    page: {
      title: 'Property Search',
      slug: 'properties',
      eyebrow: 'Homes for Sale',
      templateKey: 'properties',
      status: PublishStatus.PUBLISHED,
      sortOrder: 2,
      metaTitle: 'Property Search | Sean Truong Real Estate',
      metaDescription:
        'Search homes for sale across Orange County and the Bay Area with Sean Truong, First Team Real Estate.',
    },
    sections: [],
  },
  {
    page: {
      title: 'About Sean',
      slug: 'about',
      eyebrow: 'Realtor® · First Team Real Estate',
      templateKey: 'about',
      status: PublishStatus.PUBLISHED,
      sortOrder: 3,
      metaTitle: 'About Sean Truong | First Team Real Estate',
      metaDescription:
        'Meet Sean Truong — Realtor® with First Team Real Estate serving Orange County and the Bay Area, in English and Vietnamese.',
    },
    sections: [
      {
        sectionKey: 'profile',
        heading: 'Sean Truong',
        subheading: 'Realtor® · First Team Real Estate',
        content:
          '<p>Sean began his real estate career over 15 years ago with a simple belief: buying a home in America should feel exciting, not overwhelming. Since then, he has guided more than 350 families through successful purchases and sales — from first condos in San Jose to estate homes in Newport Beach and Villa Park.</p>' +
          '<p>As a bilingual Vietnamese-American agent, Sean is especially proud to serve the Vietnamese community, walking clients through every document and decision in the language they\'re most comfortable with. For international buyers, he partners with trusted immigration and financial professionals to make the move to California seamless.</p>',
        metadata: {
          _component: 'profile',
          background: 'plain',
          image: SEAN_PHOTO,
          imageAlt: 'Sean Truong, Realtor with First Team Real Estate',
          role: 'Serving Orange County & the Bay Area',
          highlights: ['350+ homes sold', '15+ years of experience', 'English & Vietnamese', 'Relocation & foreign buyers'],
          ctaLabel: 'Schedule Consultation',
          ctaHref: '/contact',
          cta2Label: 'Browse Listings',
          cta2Href: '/properties',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'background',
        heading: 'Experience You Can Count On',
        subheading: 'Professional Background',
        metadata: {
          _component: 'feature-cards',
          layout: 'split',
          background: 'tint',
          items: [
            { title: 'First Team Real Estate', text: 'A founding member of Luxury Portfolio International® and part of Leading Real Estate Companies of the World® — global reach for every listing.', icon: 'home' },
            { title: 'Licensed & Credentialed', text: 'California-licensed Realtor® in good standing, with continuing education in negotiation, finance, and ethics.', icon: 'shield' },
            { title: 'Market Expertise', text: 'Pricing strategy, off-market opportunities, and data-driven advice across two of America\'s hottest markets.', icon: 'chart' },
            { title: 'Community Roots', text: 'An active member of the Vietnamese-American community in Orange County — your neighbor, not just your agent.', icon: 'users' },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'network',
        heading: 'A Full Team Behind Every Transaction',
        subheading: 'Professional Network',
        content: '<p>Sean connects you with vetted professionals at every step — so nothing falls through the cracks.</p>',
        metadata: {
          _component: 'feature-cards',
          layout: 'rows',
          background: 'plain',
          items: [
            { title: 'Lenders & Financing', text: 'Trusted mortgage partners for conventional, jumbo, and foreign-national loans.', icon: 'dollar' },
            { title: 'Escrow & Title', text: 'Experienced escrow and title officers who keep closings smooth and on schedule.', icon: 'file' },
            { title: 'Inspectors & Contractors', text: 'Reliable inspectors, stagers, and repair pros to protect your investment.', icon: 'wrench' },
            { title: 'Worldwide Path', text: 'For international clients — a strategic immigration resource for planning your move to the U.S.', icon: 'globe' },
          ],
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'move-cta',
        heading: 'Ready to make your move?',
        content: '<p>Schedule a free buyer or seller consultation with Sean — no pressure, just honest advice.</p>',
        metadata: {
          _component: 'cta-banner',
          ctaLabel: 'Schedule Consultation',
          ctaHref: '/contact',
        },
        sortOrder: 4,
      },
    ],
  },
  {
    page: {
      title: 'Market Updates & Guides',
      slug: 'news',
      eyebrow: 'Resources',
      lead: 'Insights to help you buy, sell, and settle in California with confidence.',
      templateKey: 'news',
      status: PublishStatus.PUBLISHED,
      sortOrder: 4,
      metaTitle: 'Market Updates & Guides | Sean Truong Real Estate',
      metaDescription:
        'Orange County and Bay Area market updates, buyer and seller guides, and relocation tips from Sean Truong, First Team Real Estate.',
    },
    sections: [],
  },
  {
    page: {
      title: 'Schedule a Consultation',
      slug: 'contact',
      eyebrow: 'Contact',
      templateKey: 'contact',
      status: PublishStatus.PUBLISHED,
      sortOrder: 5,
      metaTitle: 'Contact | Sean Truong Real Estate',
      metaDescription:
        'Schedule a buyer or seller consultation with Sean Truong, First Team Real Estate — Orange County and Bay Area.',
    },
    sections: [
      {
        sectionKey: 'consultation',
        heading: 'Tell Sean About Your Goals',
        content: '<p>Fill out the form below and Sean will personally get back to you within 24 hours.</p>',
        metadata: {
          _component: 'contact',
          background: 'plain',
          labelOffice: 'Office',
          labelPhone: 'Phone',
          phoneNote: 'Calls & texts welcome — English or Vietnamese',
          labelEmail: 'Email',
          labelHours: 'Availability',
          topics: [
            { label: 'Buyer Consultation', value: 'buy' },
            { label: 'Seller Consultation', value: 'sell' },
            { label: 'Free Home Valuation', value: 'valuation' },
            { label: 'Luxury & Off-Market Homes', value: 'luxury' },
            { label: 'Relocation / Foreign Buyer', value: 'relocation' },
            { label: 'Other', value: 'other' },
          ],
          messagePlaceholder: 'Tell Sean what you\'re looking for — areas, timeline, budget...',
          submitLabel: 'Send Message',
        },
        sortOrder: 1,
      },
    ],
  },
];

@Injectable()
export class PageSeed {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly sectionRepo: Repository<PageSection>,
  ) {}

  async run(): Promise<void> {
    let createdPages = 0;
    let createdSections = 0;
    let mergedSections = 0;

    for (const definition of PAGES) {
      let page = await this.pageRepo.findOne({
        where: { slug: definition.page.slug },
        withDeleted: true,
      });

      if (!page) {
        page = await this.pageRepo.save(this.pageRepo.create(definition.page));
        createdPages++;
      }

      for (const section of definition.sections) {
        const existing = await this.sectionRepo.findOne({
          where: { pageId: page.id, sectionKey: section.sectionKey },
          withDeleted: true,
        });

        if (existing) {
          const seedMetadata = (section.metadata ?? {}) as Record<string, unknown>;
          const currentMetadata = (existing.metadata ?? {}) as Record<string, unknown>;
          const missingKeys = Object.keys(seedMetadata).filter(
            (key) => !(key in currentMetadata),
          );
          if (missingKeys.length > 0) {
            existing.metadata = {
              ...currentMetadata,
              ...Object.fromEntries(
                missingKeys.map((key) => [key, seedMetadata[key]]),
              ),
            };
            await this.sectionRepo.save(existing);
            mergedSections++;
          }
          continue;
        }

        await this.sectionRepo.save(
          this.sectionRepo.create({ ...section, pageId: page.id }),
        );
        createdSections++;
      }
    }

    console.log(
      createdPages + createdSections + mergedSections > 0
        ? `--- [Seed] Pages: created ${createdPages} page(s), ${createdSections} section(s); merged metadata into ${mergedSections} section(s).`
        : '--- [Seed] Pages: nothing missing, skipping.',
    );
  }
}
