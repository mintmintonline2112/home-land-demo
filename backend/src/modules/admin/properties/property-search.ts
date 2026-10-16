/**
 * Đọc tham số tìm nhà từ query string của API công khai (từ khoá, khu vực, loại, khoảng giá, phòng ngủ, giá tối đa, khung bản đồ,
 * sắp xếp, trang) thành bộ lọc có kiểu, kèm bảng tên vùng gọi tắt (Orange County, Bay Area, Silicon Valley) cho ô từ khoá.
 * Dùng bởi: properties.service.ts (searchActive, findMapPoints), modules/client/properties/properties.controller.ts.
 * Lưu ý: area là danh sách thành phố / khu phố nối bằng "|" do frontend gửi (frontend-next/src/config/property-search.ts);
 * price là khoảng tính bằng nghìn USD ("800-1200", "2000+"); bounds là "nam,tây,bắc,đông" theo độ. Giá trị sai thì bỏ qua, không báo lỗi.
 */
import { PROPERTY_REGIONS, PROPERTY_TYPES } from './entities/property.entity';

export const PROPERTY_SORTS = ['newest', 'price-asc', 'price-desc', 'area-desc', 'manual'] as const;
export type PropertySort = (typeof PROPERTY_SORTS)[number];

export type MapBounds = { south: number; west: number; north: number; east: number };

export type PropertySearch = {
  places: string[];
  keyword?: string;
  type?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  bounds?: MapBounds;
  isFeatured?: boolean;
  excludeSlug?: string;
  sort: PropertySort;
  page: number;
  limit: number;
};

const ORANGE_COUNTY_PLACES = [
  'Irvine',
  'Newport Beach',
  'Tustin',
  'Villa Park',
  'Anaheim Hills',
  'Orange',
  'Garden Grove',
  'Westminster',
  'Costa Mesa',
  'Huntington Beach',
  'Fountain Valley',
];

const SILICON_VALLEY_PLACES = ['San Jose', 'Palo Alto', 'Mountain View', 'Sunnyvale', 'Cupertino', 'Santa Clara'];

const BAY_AREA_PLACES = ['San Francisco', 'Oakland', 'Berkeley', 'Fremont', ...SILICON_VALLEY_PLACES];

export const KEYWORD_PLACE_ALIASES: Record<string, string[]> = {
  'orange county': ORANGE_COUNTY_PLACES,
  'greater orange county': ORANGE_COUNTY_PLACES,
  'bay area': BAY_AREA_PLACES,
  'silicon valley': SILICON_VALLEY_PLACES,
};

const MAX_LIMIT = 48;

const textOf = (value: unknown): string | undefined => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
};

const positiveNumberOf = (value: unknown): number | undefined => {
  const parsed = Number(textOf(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export function parseMapBounds(value: unknown): MapBounds | undefined {
  const parts = textOf(value)?.split(',').map(Number);
  if (!parts || parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return undefined;
  const [south, west, north, east] = parts;
  if (south >= north || west >= east || Math.abs(south) > 90 || Math.abs(north) > 90) return undefined;
  return { south, west, north, east };
}

function parsePriceRange(value: unknown): { minPrice?: number; maxPrice?: number } {
  const range = textOf(value);
  if (!range) return {};
  const [minText, maxText] = range.replace('+', '-').split('-');
  const min = Number(minText);
  const max = Number(maxText);
  return {
    minPrice: Number.isFinite(min) && min > 0 ? min * 1000 : undefined,
    maxPrice: maxText && Number.isFinite(max) && max > 0 ? max * 1000 : undefined,
  };
}

export function parsePropertySearch(query: Record<string, unknown>): PropertySearch {
  const keyword = textOf(query.keyword);
  const aliasPlaces = keyword ? KEYWORD_PLACE_ALIASES[keyword.toLowerCase()] : undefined;
  const areaPlaces = (textOf(query.area) ?? '')
    .split('|')
    .map((place) => place.trim())
    .filter(Boolean);
  const type = textOf(query.type);
  const region = textOf(query.region);
  const sort = textOf(query.sort);
  const priceRange = parsePriceRange(query.price);
  const maxPriceLimit = positiveNumberOf(query.maxPrice);

  return {
    places: [...areaPlaces, ...(aliasPlaces ?? [])],
    keyword: aliasPlaces ? undefined : keyword,
    type: type && (PROPERTY_TYPES as readonly string[]).includes(type) ? type : undefined,
    region: region && (PROPERTY_REGIONS as readonly string[]).includes(region) ? region : undefined,
    minPrice: priceRange.minPrice,
    maxPrice:
      priceRange.maxPrice && maxPriceLimit
        ? Math.min(priceRange.maxPrice, maxPriceLimit)
        : (priceRange.maxPrice ?? maxPriceLimit),
    minBeds: positiveNumberOf(query.beds),
    bounds: parseMapBounds(query.bounds),
    isFeatured: textOf(query.featured) === '1' ? true : undefined,
    excludeSlug: textOf(query.exclude),
    sort: sort && (PROPERTY_SORTS as readonly string[]).includes(sort) ? (sort as PropertySort) : 'newest',
    page: Math.max(1, Math.floor(positiveNumberOf(query.page) ?? 1)),
    limit: Math.min(MAX_LIMIT, Math.floor(positiveNumberOf(query.limit) ?? 12)),
  };
}
