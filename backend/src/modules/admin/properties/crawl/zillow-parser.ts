/**
 * Đọc listing và phân trang từ JSON nhúng trong HTML Zillow, chỉ nhận nhà đang bán tại California.
 * Dùng bởi: property-crawl.service.ts và kiểm tra parser.
 * Lưu ý: không dùng Zestimate làm giá bán, không tạo dữ liệu thiếu; mỗi kết quả giữ URL nguồn và thời điểm thu thập.
 */
import type { DeepPartial } from 'typeorm';
import type { Property } from '../entities/property.entity';
import { CALIFORNIA_PLACES } from '../california-places';

type JsonObject = Record<string, unknown>;
export type CrawledListing = { sourceKey: string; sourceUrl: string; data: DeepPartial<Property> };
export type CrawlPage = { listings: CrawledListing[]; nextUrl: string | null; total: number | null; skipped: number; limitedBySource: boolean };

const objectOf = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};
const textOf = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
const numberOf = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[$,]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

export function validateZillowUrl(input: string): string {
  const url = new URL(input);
  if (url.protocol !== 'https:' || !['www.zillow.com', 'zillow.com'].includes(url.hostname) || url.port || url.username || url.password) {
    throw new Error('Chỉ nhận URL HTTPS của zillow.com.');
  }
  url.hostname = 'www.zillow.com';
  url.hash = '';
  return url.href;
}

function imageUrlsOf(row: JsonObject): string[] {
  const urls: unknown[] = [row.imgSrc];
  if (Array.isArray(row.carouselPhotos)) {
    for (const photo of row.carouselPhotos) urls.push(objectOf(photo).url);
  }
  const carousel = objectOf(row.carouselPhotosComposable);
  const base = textOf(carousel.baseUrl);
  if (base && Array.isArray(carousel.photoData)) {
    for (const photo of carousel.photoData) {
      const key = textOf(objectOf(photo).photoKey);
      if (/^[a-f0-9]+$/i.test(key)) urls.push(base.replace('{photoKey}', key));
    }
  }
  return [...new Set(urls.filter((value): value is string => {
    if (typeof value !== 'string') return false;
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'photos.zillowstatic.com';
    } catch { return false; }
  }))].slice(0, 40);
}

function listingOf(value: unknown, pageUrl: string): CrawledListing | null {
  const row = objectOf(value);
  const home = objectOf(objectOf(row.hdpData).homeInfo);
  const key = String(row.zpid ?? home.zpid ?? '');
  const status = textOf(home.homeStatus || row.statusType);
  const state = textOf(row.addressState || home.state);
  const price = numberOf(row.unformattedPrice ?? home.price);
  const city = textOf(row.addressCity || home.city);
  const address = textOf(row.addressStreet || home.streetAddress);
  if (!/^\d+$/.test(key) || state !== 'CA' || !['FOR_SALE', 'COMING_SOON'].includes(status) || !price || !Number.isInteger(price) || price > 4294967295 || !city || !address || row.shouldShowZestimateAsPrice) return null;
  const rawUrl = textOf(row.detailUrl);
  if (!rawUrl) return null;
  let sourceUrl: string;
  try { sourceUrl = validateZillowUrl(new URL(rawUrl, pageUrl).href); } catch { return null; }
  if (!sourceUrl.includes(`/${key}_zpid/`)) return null;
  const homeType = textOf(home.homeType);
  const type = homeType === 'CONDO' ? 'condo' : homeType === 'TOWNHOUSE' ? 'townhouse' : homeType === 'SINGLE_FAMILY' ? 'house' : null;
  if (!type) return null;
  const latitude = numberOf(objectOf(row.latLong).latitude ?? home.latitude);
  const longitude = numberOf(objectOf(row.latLong).longitude ?? home.longitude);
  const data: DeepPartial<Property> = {
    title: `${address}, ${city}`.slice(0, 255), address: address.slice(0, 255), city: city.slice(0, 120), state: 'CA',
    zip: textOf(row.addressZipcode || home.zipcode).slice(0, 10) || null,
    price, type, typeLabel: { house: 'Single-Family Home', condo: 'Condominium', townhouse: 'Townhouse' }[type],
    region: CALIFORNIA_PLACES[city]?.region ?? 'california', status: status === 'COMING_SOON' ? 'Coming Soon' : 'For Sale',
    source: 'zillow', sourceKey: key, sourceUrl, sourceBroker: textOf(row.brokerName).slice(0, 255) || null,
  };
  if (latitude !== undefined && longitude !== undefined && latitude >= 32 && latitude <= 42.1 && longitude >= -124.6 && longitude <= -114) {
    data.latitude = latitude; data.longitude = longitude;
  }
  for (const [field, raw] of [['beds', row.beds ?? home.bedrooms], ['baths', row.baths ?? home.bathrooms], ['sqft', row.area ?? home.livingArea]] as const) {
    const number = numberOf(raw);
    const max = field === 'sqft' ? 4294967295 : 255;
    if (number !== undefined && number >= 0 && number <= max && (field === 'baths' || Number.isInteger(number))) data[field] = number;
  }
  const urls = imageUrlsOf(row);
  if (urls.length) data.images = urls.map((src) => ({ src, alt: data.title }));
  if (numberOf(home.lotAreaValue) !== undefined && textOf(home.lotAreaUnit)) data.lotSize = `${home.lotAreaValue} ${home.lotAreaUnit}`.slice(0, 40);
  return { sourceKey: key, sourceUrl, data };
}

export function parseZillowPage(html: string, pageUrl: string): CrawlPage {
  let root: JsonObject | undefined;
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bid\s*=\s*["']__NEXT_DATA__["']/i.test(match[1])) continue;
    try { root = objectOf(JSON.parse(match[2])); } catch { throw new Error('JSON Zillow không hợp lệ; chưa nhập dữ liệu.'); }
  }
  if (!root) throw new Error('Không tìm thấy dữ liệu Zillow trong HTML. Nguồn có thể đang chặn hoặc đã đổi cấu trúc.');
  const state = objectOf(objectOf(objectOf(root.props).pageProps).searchPageState);
  const category = objectOf(state.cat1);
  const results = objectOf(category.searchResults);
  if (!Array.isArray(results.listResults)) throw new Error('Không tìm thấy danh sách listing; cần cập nhật parser Zillow.');
  const listings = new Map<string, CrawledListing>();
  let skipped = 0;
  for (const row of results.listResults) {
    const listing = listingOf(row, pageUrl);
    if (listing) listings.set(listing.sourceKey, listing); else skipped++;
  }
  const list = objectOf(category.searchList);
  const pagination = objectOf(list.pagination);
  const rawNext = textOf(pagination.nextUrl);
  let nextUrl: string | null = null;
  if (rawNext) nextUrl = validateZillowUrl(new URL(rawNext, pageUrl).href);
  const total = numberOf(list.totalResultCount ?? list.totalSearchResults ?? results.totalResultCount) ?? null;
  const totalPages = numberOf(list.totalPages);
  const perPage = numberOf(list.resultsPerPage);
  const limitedBySource = total !== null && totalPages !== undefined && perPage !== undefined && total > totalPages * perPage;
  return { listings: [...listings.values()], nextUrl, total, skipped, limitedBySource };
}
