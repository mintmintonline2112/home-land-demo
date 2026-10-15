/**
 * Seed 9 nhà đăng bán mẫu lấy từ bản demo homeland (thư mục frontend/), ảnh tạm là link Unsplash.
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo slug — nhà đã có (kể cả admin đã sửa / xoá mềm) giữ nguyên, nên chạy lại db:seed an toàn.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Property } from 'src/modules/admin/properties/entities/property.entity';

const DEMO_PROPERTIES: DeepPartial<Property>[] = [
  {
    title: 'Turtle Rock Estate',
    slug: 'turtle-rock-estate',
    listingId: 'ST-2026-0812',
    status: 'For Sale',
    type: 'luxury',
    typeLabel: 'Single-Family Estate',
    region: 'orange-county',
    neighborhood: 'Turtle Rock',
    city: 'Irvine',
    state: 'CA',
    zip: '92603',
    address: '12 Sendero',
    price: 1850000,
    beds: 5,
    baths: 4,
    sqft: 3800,
    lotSize: '0.30 acres',
    garage: 3,
    stories: 2,
    yearBuilt: 2018,
    facing: 'Southeast',
    hoa: '$250 / month',
    isFeatured: true,
    isActive: true,
    listedAt: '2026-08-01',
    description:
      "Nestled in Irvine's prestigious Turtle Rock community, this beautifully updated estate offers panoramic hillside views, award-winning schools, and quick access to UC Irvine, fine dining, and the coast. The open-concept design floods every room with California sunshine.\n\nThe main level features a dramatic two-story foyer, a chef's kitchen with a large center island, and a great room that opens to a resort-style backyard with pool, spa, and covered California room. Upstairs, the primary suite offers a spa bath, walk-in closet, and a private view balcony. A main-floor bedroom and full bath complete the layout — perfect for guests or multi-generational living.",
    amenities: [
      'Pool & Spa',
      'Panoramic Views',
      '3-Car Garage',
      'Central A/C & Heating',
      'Main-Floor Bedroom',
      "Chef's Kitchen",
      'Award-Winning Schools',
      'Near UC Irvine',
      'Low HOA',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80',
        alt: 'Estate exterior with pool',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 1,
  },
  {
    title: 'Newport Harbor View Home',
    slug: 'newport-harbor-view-home',
    listingId: 'ST-2026-0815',
    status: 'For Sale',
    type: 'luxury',
    typeLabel: 'Single-Family Residence',
    region: 'orange-county',
    neighborhood: null,
    city: 'Newport Beach',
    state: 'CA',
    zip: '92660',
    address: '2201 Harbor View Dr',
    price: 2400000,
    beds: 4,
    baths: 4,
    sqft: 3200,
    lotSize: '0.18 acres',
    garage: 2,
    stories: 2,
    yearBuilt: 2015,
    facing: 'West',
    hoa: 'None',
    isFeatured: true,
    isActive: true,
    listedAt: '2026-08-05',
    description:
      "A light-filled contemporary home minutes from Newport Harbor, with sweeping water views from the main living level and the primary suite.\n\nWalls of glass open to an entertainer's backyard with pool and outdoor kitchen, while the upper level offers four generous bedrooms.",
    amenities: [
      'Harbor Views',
      'Pool',
      'Outdoor Kitchen',
      'Smart Home',
      'Walk to Beach',
      '2-Car Garage',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
        alt: 'Modern home with pool at dusk',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 2,
  },
  {
    title: 'Anaheim Hills View Home',
    slug: 'anaheim-hills-view-home',
    listingId: 'ST-2026-0818',
    status: 'For Sale',
    type: 'house',
    typeLabel: 'Single-Family Residence',
    region: 'orange-county',
    neighborhood: null,
    city: 'Anaheim Hills',
    state: 'CA',
    zip: '92807',
    address: '5420 E Vista Ridge',
    price: 1150000,
    beds: 4,
    baths: 3,
    sqft: 2600,
    lotSize: '0.22 acres',
    garage: 2,
    stories: 2,
    yearBuilt: 2004,
    facing: 'North',
    hoa: '$120 / month',
    isFeatured: true,
    isActive: true,
    listedAt: '2026-08-08',
    description:
      'A spacious two-story home on a quiet cul-de-sac with city-light views and a sparkling pool.\n\nUpdated kitchen, family room with fireplace, and an upstairs primary suite with a view deck.',
    amenities: [
      'City-Light Views',
      'Pool',
      'Cul-de-Sac',
      'Updated Kitchen',
      'Fireplace',
      'Near Golf Course',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80',
        alt: 'Two-story family home',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 3,
  },
  {
    title: 'Charming Craftsman',
    slug: 'charming-craftsman',
    listingId: 'ST-2026-0802',
    status: 'For Sale',
    type: 'house',
    typeLabel: 'Single-Family Residence',
    region: 'orange-county',
    neighborhood: 'Old Towne',
    city: 'Orange',
    state: 'CA',
    zip: '92866',
    address: '318 E Palmyra Ave',
    price: 875000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    lotSize: '0.16 acres',
    garage: 1,
    stories: 1,
    yearBuilt: 1924,
    facing: 'South',
    hoa: 'None',
    isFeatured: true,
    isActive: true,
    listedAt: '2026-07-20',
    description:
      "A lovingly restored 1920s Craftsman in the heart of Old Towne Orange, steps from the Plaza's cafés and antique shops.\n\nOriginal built-ins and hardwood floors pair with a modern kitchen and a deep backyard with mature trees.",
    amenities: [
      'Historic District',
      'Hardwood Floors',
      'Original Built-Ins',
      'Large Backyard',
      'Walk to Old Towne Plaza',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
        alt: 'Craftsman house with front yard',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 4,
  },
  {
    title: 'Modern Family Home',
    slug: 'modern-family-home',
    listingId: 'ST-2026-0809',
    status: 'For Sale',
    type: 'house',
    typeLabel: 'Single-Family Residence',
    region: 'orange-county',
    neighborhood: null,
    city: 'Tustin',
    state: 'CA',
    zip: '92782',
    address: '14 Lantern Way',
    price: 980000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    lotSize: '0.12 acres',
    garage: 2,
    stories: 2,
    yearBuilt: 2012,
    facing: 'East',
    hoa: '$180 / month',
    isFeatured: false,
    isActive: true,
    listedAt: '2026-07-28',
    description:
      'A move-in ready family home in Tustin Ranch with an open floor plan and a downstairs bedroom.\n\nClose to top-rated schools, parks, and The District shopping center.',
    amenities: [
      'Downstairs Bedroom',
      'Open Floor Plan',
      'Community Pool',
      'Near Top Schools',
      'Solar Panels',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80',
        alt: 'Modern family home exterior',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 5,
  },
  {
    title: 'Garden Grove Starter Home',
    slug: 'garden-grove-starter-home',
    listingId: 'ST-2026-0820',
    status: 'For Sale',
    type: 'house',
    typeLabel: 'Single-Family Residence',
    region: 'orange-county',
    neighborhood: null,
    city: 'Garden Grove',
    state: 'CA',
    zip: '92840',
    address: '11872 Stuart Dr',
    price: 720000,
    beds: 3,
    baths: 2,
    sqft: 1450,
    lotSize: '0.14 acres',
    garage: 2,
    stories: 1,
    yearBuilt: 1962,
    facing: 'West',
    hoa: 'None',
    isFeatured: false,
    isActive: true,
    listedAt: '2026-08-09',
    description:
      'A well-kept single-story home — an ideal first purchase close to Little Saigon, shopping, and freeways.\n\nUpdated bathrooms, a bright living room, and a large yard with room to expand.',
    amenities: [
      'Single Story',
      'Large Yard',
      'Near Little Saigon',
      'Updated Bathrooms',
      'No HOA',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80',
        alt: 'Single-story starter home',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 6,
  },
  {
    title: 'Silicon Valley Townhouse',
    slug: 'silicon-valley-townhouse',
    listingId: 'ST-2026-0791',
    status: 'For Sale',
    type: 'townhouse',
    typeLabel: 'Townhouse',
    region: 'bay-area',
    neighborhood: 'Willow Glen',
    city: 'San Jose',
    state: 'CA',
    zip: '95125',
    address: '1450 Lincoln Ave #3',
    price: 1280000,
    beds: 3,
    baths: 3,
    sqft: 1700,
    lotSize: '—',
    garage: 2,
    stories: 3,
    yearBuilt: 2019,
    facing: 'South',
    hoa: '$420 / month',
    isFeatured: true,
    isActive: true,
    listedAt: '2026-07-10',
    description:
      "A modern three-level townhouse in walkable Willow Glen, close to Lincoln Avenue's restaurants and major tech campuses.\n\nOpen living space with a chef's kitchen, rooftop deck, and an attached two-car garage with EV charger.",
    amenities: [
      'Rooftop Deck',
      'EV Charger',
      'Walkable Neighborhood',
      'Near Tech Campuses',
      'Attached Garage',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
        alt: 'Modern townhouse interior',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 7,
  },
  {
    title: 'Nob Hill Condo',
    slug: 'nob-hill-condo',
    listingId: 'ST-2026-0806',
    status: 'For Sale',
    type: 'condo',
    typeLabel: 'Condominium',
    region: 'bay-area',
    neighborhood: 'Nob Hill',
    city: 'San Francisco',
    state: 'CA',
    zip: '94109',
    address: '1200 California St #8B',
    price: 1050000,
    beds: 2,
    baths: 2,
    sqft: 1100,
    lotSize: '—',
    garage: 1,
    stories: 1,
    yearBuilt: 1965,
    facing: 'East',
    hoa: '$950 / month',
    isFeatured: true,
    isActive: true,
    listedAt: '2026-08-03',
    description:
      'A bright corner condo on iconic Nob Hill with city views, steps from the cable car line and Grace Cathedral.\n\nRemodeled kitchen and baths, in-unit laundry, and a doorman building with deeded parking.',
    amenities: [
      'City Views',
      'Doorman Building',
      'In-Unit Laundry',
      'Deeded Parking',
      'Cable Car Line',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
        alt: 'Bright city condo',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Pool and backyard',
      },
    ],
    sortOrder: 8,
  },
  {
    title: 'Villa Park Estate',
    slug: 'villa-park-estate',
    listingId: 'ST-2026-0814',
    status: 'For Sale',
    type: 'luxury',
    typeLabel: 'Single-Family Estate',
    region: 'orange-county',
    neighborhood: null,
    city: 'Villa Park',
    state: 'CA',
    zip: '92861',
    address: '9 Hidden Ranch Rd',
    price: 1980000,
    beds: 5,
    baths: 5,
    sqft: 4200,
    lotSize: '0.65 acres',
    garage: 3,
    stories: 2,
    yearBuilt: 2009,
    facing: 'West',
    hoa: 'None',
    isFeatured: false,
    isActive: true,
    listedAt: '2026-08-06',
    description:
      'A private gated estate on more than half an acre in coveted Villa Park, with resort-style grounds and a pool.\n\nFormal living and dining rooms, a gourmet kitchen, home office, and a guest suite with its own entrance.',
    amenities: [
      'Gated Estate',
      'Pool',
      'Guest Suite',
      'Home Office',
      'Half-Acre Lot',
      '3-Car Garage',
    ],
    images: [
      {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
        alt: 'Estate home with pool',
      },
      {
        src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Living room',
      },
      {
        src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
        alt: 'Kitchen',
      },
      {
        src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80',
        alt: 'Primary bedroom',
      },
    ],
    sortOrder: 9,
  },
];

@Injectable()
export class PropertySeed {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async run(): Promise<void> {
    let createdCount = 0;
    for (const property of DEMO_PROPERTIES) {
      const existing = await this.propertyRepo.findOne({
        where: { slug: property.slug },
        withDeleted: true,
      });
      if (existing) continue;
      await this.propertyRepo.save(this.propertyRepo.create(property));
      createdCount++;
    }
    console.log(
      createdCount > 0
        ? `--- [Seed] Properties: created ${createdCount} listing(s).`
        : '--- [Seed] Properties: nothing missing, skipping.',
    );
  }
}
