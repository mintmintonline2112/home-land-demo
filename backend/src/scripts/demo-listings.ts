/**
 * Tạo (hoặc xoá) nhà GIẢ hàng loạt trên database dev để demo bản đồ + danh sách nhà với dữ liệu lớn — mặc định 500 nhà rải khắp
 * Orange County và Bay Area, có toạ độ, giá, ảnh, mô tả; mọi nhà giả có slug "demo-…" và mã tin "DEMO-…".
 * Dùng bởi: `npm run demo:listings` (tạo, `-- --count=2000` để đổi số lượng), `npm run demo:listings -- --remove` (xoá sạch nhà giả).
 * Lưu ý: TỪ CHỐI chạy khi NODE_ENV=production — nhà giả không bao giờ được lên website thật. Dữ liệu sinh theo hạt giống cố định
 * nên chạy lại cho cùng kết quả; lần chạy sau xoá nhà giả cũ rồi tạo lại. Ghi thẳng database nên cache API tự hết sau ~2 phút.
 */
import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { CALIFORNIA_PLACES, coordinatesOf } from '../modules/admin/properties/california-places';
import {
  Property,
  type PropertyImage,
  type PropertyType,
} from '../modules/admin/properties/entities/property.entity';

const DEFAULT_COUNT = 500;
const DEMO_SLUG_PREFIX = 'demo-';
const DEMO_LISTING_PREFIX = 'DEMO-';
const RANDOM_SEED = 20261016;

const unsplash = (photoId: string) => `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1400&q=80`;

const EXTERIOR_PHOTOS: Record<PropertyType, string[]> = {
  house: [
    '1430285561322-7808604715df',
    '1475855581690-80accde3ae2b',
    '1523217582562-09d0def993a6',
    '1558036117-15d82a90b9b1',
    '1572120360610-d971b9d7767c',
    '1576941089067-2de3c901e126',
    '1583608205776-bfd35f0d9f83',
    '1592595896551-12b371d546d5',
    '1600047509807-ba8f99d2cdde',
    '1605276374104-dee2a0ed3cd6',
    '1564013799919-ab600027ffc6',
    '1568605114967-8130f3a36994',
    '1600585154340-be6161a56a0c',
  ],
  condo: [
    '1460317442991-0ec209397118',
    '1512915922686-57c11dde9b6b',
    '1574362848149-11496d93a7c7',
    '1580041065738-e72023775cdc',
    '1560448204-e02f11c3d0e2',
  ],
  townhouse: [
    '1494526585095-c41746248156',
    '1567496898669-ee935f5f647a',
    '1600047509358-9dc75507daeb',
    '1600607687939-ce8a6c25118c',
  ],
  luxury: [
    '1416331108676-a22ccb276e35',
    '1505843513577-22bb7d21e455',
    '1513584684374-8bab748fbf90',
    '1580587771525-78b9dba3b914',
    '1582268611958-ebfd161ef9cf',
    '1602343168117-bb8ffe3e2e9f',
    '1600585154363-67eb9e2e2099',
    '1613490493576-7fde63acd811',
    '1600596542815-ffad4c1539a9',
  ],
};

const INTERIOR_PHOTOS: Array<[string, string]> = [
  ['1484154218962-a197022b5858', 'Kitchen'],
  ['1493809842364-78817add7ffb', 'Living room'],
  ['1501183638710-841dd1904471', 'Living room with fireplace'],
  ['1502672260266-1c1ef2d93688', 'Family room'],
  ['1505691938895-1758d7feb511', 'Living room'],
  ['1522708323590-d24dbb6b0267', 'Open kitchen'],
  ['1556912173-3bb406ef7e77', "Chef's kitchen"],
  ['1560185007-cde436f6a4d0', 'Dining room'],
  ['1584622650111-993a426fbf0a', 'Primary bathroom'],
  ['1600607687644-c7171b42498f', 'Primary bedroom'],
  ['1600566753086-00f18fb6b3ea', 'Living room'],
  ['1600585154526-990dced4db0d', 'Primary bedroom'],
];

const CITY_PRICE_PER_SQFT: Record<string, number> = {
  Irvine: 780,
  'Newport Beach': 1250,
  Tustin: 640,
  'Villa Park': 620,
  'Anaheim Hills': 520,
  Orange: 560,
  'Garden Grove': 520,
  Westminster: 500,
  'Costa Mesa': 700,
  'Huntington Beach': 760,
  'Fountain Valley': 600,
  'San Francisco': 1050,
  'San Jose': 820,
  'Palo Alto': 1800,
  'Mountain View': 1300,
  Sunnyvale: 1200,
  Cupertino: 1400,
  'Santa Clara': 1000,
  Oakland: 640,
  Berkeley: 900,
  Fremont: 850,
};

const TYPE_PROFILES: Record<PropertyType, { label: string; minSqft: number; maxSqft: number; priceFactor: number; styles: string[] }> = {
  house: {
    label: 'Single-Family Residence',
    minSqft: 1300,
    maxSqft: 3200,
    priceFactor: 1,
    styles: ['Craftsman', 'Ranch Home', 'Family Home', 'Traditional Home', 'Cottage', 'Contemporary Home', 'Pool Home'],
  },
  condo: {
    label: 'Condominium',
    minSqft: 750,
    maxSqft: 1600,
    priceFactor: 0.85,
    styles: ['Condo', 'View Condo', 'Corner Unit', 'Garden Condo', 'Penthouse'],
  },
  townhouse: {
    label: 'Townhouse',
    minSqft: 1200,
    maxSqft: 2200,
    priceFactor: 0.92,
    styles: ['Townhome', 'Modern Townhouse', 'End-Unit Townhome', 'Courtyard Townhome'],
  },
  luxury: {
    label: 'Single-Family Estate',
    minSqft: 3400,
    maxSqft: 6800,
    priceFactor: 1.35,
    styles: ['Estate', 'Modern Retreat', 'Hillside Estate', 'Gated Estate', 'Villa'],
  },
};

const TITLE_PREFIXES = ['Sunny', 'Updated', 'Charming', 'Bright', 'Spacious', 'Elegant', 'Quiet', 'Renovated', 'Classic', 'Modern'];

const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Sycamore', 'Willow', 'Vista', 'Sierra', 'Canyon', 'Harbor', 'Laurel',
  'Magnolia', 'Palm', 'Ridge', 'Meadow', 'Hillcrest', 'Pine', 'Orchard', 'Lakeview', 'Summit', 'Bayview',
];

const STREET_SUFFIXES = ['St', 'Ave', 'Dr', 'Ln', 'Ct', 'Way', 'Pl', 'Cir'];

const FACINGS = ['North', 'South', 'East', 'West', 'Southeast', 'Southwest', 'Northeast', 'Northwest'];

const AMENITIES = [
  'Pool', 'Spa', 'Solar Panels', 'EV Charger', 'Smart Home', 'Remodeled Kitchen', 'Hardwood Floors',
  'Central A/C', 'Fireplace', 'Walk-In Closet', 'Downstairs Bedroom', 'Top-Rated Schools', 'Near Parks',
  'Mountain Views', 'City Lights', 'Large Backyard', 'Community Pool', 'Gated Community', 'In-Unit Laundry', 'No HOA',
];

function createRandom(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const integer = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  const sample = <T>(items: readonly T[], count: number): T[] => {
    const pool = [...items];
    const picked: T[] = [];
    while (picked.length < count && pool.length > 0) picked.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
    return picked;
  };
  return { next, integer, pick, sample };
}

const toSlugPart = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const roundPrice = (price: number) => Math.round(price / 5000) * 5000;

function buildDemoListing(index: number, random: ReturnType<typeof createRandom>): Partial<Property> {
  const city = random.pick(Object.keys(CALIFORNIA_PLACES));
  const place = CALIFORNIA_PLACES[city];
  const typeRoll = random.next();
  const type: PropertyType = typeRoll < 0.55 ? 'house' : typeRoll < 0.72 ? 'condo' : typeRoll < 0.88 ? 'townhouse' : 'luxury';
  const profile = TYPE_PROFILES[type];
  const sqft = Math.round(random.integer(profile.minSqft, profile.maxSqft) / 10) * 10;
  const beds = Math.max(1, Math.min(7, Math.round(sqft / 620) + random.integer(-1, 1)));
  const baths = Math.max(1, Math.min(beds + 1, beds - random.integer(0, 1)));
  const price = roundPrice(sqft * CITY_PRICE_PER_SQFT[city] * profile.priceFactor * (0.85 + random.next() * 0.35));
  const title = `${random.pick(TITLE_PREFIXES)} ${city} ${random.pick(profile.styles)}`;
  const number = String(index + 1).padStart(4, '0');
  const statusRoll = random.next();
  const listedDaysAgo = random.integer(1, 120);
  const listedAt = new Date(Date.UTC(2026, 9, 15) - listedDaysAgo * 86400000).toISOString().slice(0, 10);
  const exteriorPhoto = random.pick(EXTERIOR_PHOTOS[type]);
  const images: PropertyImage[] = [
    { src: unsplash(exteriorPhoto), alt: `${title} exterior` },
    ...random.sample(INTERIOR_PHOTOS, 4).map(([photoId, alt]) => ({ src: unsplash(photoId), alt })),
  ];
  const coordinates = coordinatesOf(city, `demo-${number}`);
  const amenities = random.sample(AMENITIES, random.integer(4, 7));

  return {
    title,
    slug: `${DEMO_SLUG_PREFIX}${number}-${toSlugPart(title)}`,
    listingId: `${DEMO_LISTING_PREFIX}${number}`,
    status: statusRoll < 0.86 ? 'For Sale' : statusRoll < 0.95 ? 'Pending' : 'Coming Soon',
    type,
    typeLabel: profile.label,
    region: place.region,
    city,
    state: 'CA',
    zip: null,
    address: `${random.integer(100, 9999)} ${random.pick(STREET_NAMES)} ${random.pick(STREET_SUFFIXES)}`,
    latitude: coordinates?.latitude ?? null,
    longitude: coordinates?.longitude ?? null,
    price,
    beds,
    baths,
    sqft,
    lotSize: type === 'condo' ? '—' : `${(random.integer(8, type === 'luxury' ? 90 : 30) / 100).toFixed(2)} acres`,
    garage: type === 'condo' ? 1 : random.integer(2, type === 'luxury' ? 4 : 3),
    stories: type === 'townhouse' ? 3 : random.integer(1, 2),
    yearBuilt: random.integer(1925, 2025),
    facing: random.pick(FACINGS),
    hoa: type === 'house' && random.next() < 0.5 ? 'None' : `$${random.integer(9, 95) * 10} / month`,
    isFeatured: false,
    isActive: true,
    listedAt,
    description:
      `This is a demo listing generated for testing the map and search experience — a ${beds}-bedroom ${profile.label.toLowerCase()} in ${city}, California.\n\n` +
      `It features ${amenities.slice(0, 3).join(', ').toLowerCase()} and about ${sqft.toLocaleString('en-US')} square feet of living space.`,
    amenities,
    images,
    sortOrder: 1000 + index,
  };
}

function readCountArgument(): number {
  const countArgument = process.argv.find((argument) => argument.startsWith('--count='));
  const count = Number(countArgument?.split('=')[1]);
  return Number.isInteger(count) && count > 0 ? Math.min(count, 20000) : DEFAULT_COUNT;
}

async function removeDemoListings(): Promise<number> {
  const result = await AppDataSource.getRepository(Property)
    .createQueryBuilder()
    .delete()
    .where('slug LIKE :prefix', { prefix: `${DEMO_SLUG_PREFIX}%` })
    .andWhere('listing_id LIKE :listingPrefix', { listingPrefix: `${DEMO_LISTING_PREFIX}%` })
    .execute();
  return result.affected ?? 0;
}

async function createDemoListings(count: number): Promise<void> {
  const random = createRandom(RANDOM_SEED);
  const listings = Array.from({ length: count }, (_, index) => buildDemoListing(index, random));
  const repository = AppDataSource.getRepository(Property);
  for (let start = 0; start < listings.length; start += 200) {
    await repository.insert(listings.slice(start, start + 200));
  }
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('demo-listings is disabled when NODE_ENV=production — demo data must never reach the live site.');
  }
  await AppDataSource.initialize();
  try {
    const removedCount = await removeDemoListings();
    console.log(`Removed ${removedCount} existing demo listing(s).`);
    if (process.argv.includes('--remove')) return;
    const count = readCountArgument();
    await createDemoListings(count);
    console.log(`Created ${count} demo listing(s) with slug prefix "${DEMO_SLUG_PREFIX}".`);
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
