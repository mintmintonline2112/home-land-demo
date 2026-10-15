/**
 * Lựa chọn của ô tìm nhà: khu vực (chia nhóm Nam / Bắc California), loại nhà, khoảng giá, số phòng ngủ, cách sắp xếp, nhãn vùng.
 * Dùng bởi: hero (bố cục search), trang /properties (bộ lọc), app/(site)/_lib/properties.ts.
 * Lưu ý: value của khu vực có thể là nhiều thành phố nối bằng "|" (VD Bay Area); _lib/properties.ts so khớp từng tên với thành phố / khu phố của nhà.
 * Giá trong PRICE_RANGES tính bằng nghìn USD ("800-1200" = $800k — $1.2M, "2000+" = trên $2M).
 */
import type { PropertyRegion, PropertySort } from "@/types/property";

export type SearchOption = { value: string; label: string };

export type SearchOptionGroup = { label: string; options: SearchOption[] };

const ORANGE_COUNTY_CITIES = [
  "Irvine",
  "Newport Beach",
  "Tustin",
  "Villa Park",
  "Anaheim Hills",
  "Orange",
  "Garden Grove",
  "Westminster",
];

export const AREA_GROUPS: SearchOptionGroup[] = [
  {
    label: "Southern California",
    options: [
      { value: "Irvine", label: "Irvine" },
      { value: "Newport Beach", label: "Newport Beach" },
      { value: "Tustin", label: "Tustin & North Tustin" },
      { value: "Villa Park", label: "Villa Park" },
      { value: "Anaheim Hills", label: "Anaheim Hills" },
      { value: "Orange", label: "Orange" },
      { value: "Garden Grove", label: "Garden Grove" },
      { value: "Westminster", label: "Westminster (Little Saigon)" },
      { value: ORANGE_COUNTY_CITIES.join("|"), label: "Greater Orange County" },
    ],
  },
  {
    label: "Northern California",
    options: [
      { value: "San Francisco", label: "San Francisco" },
      { value: "San Jose", label: "San Jose" },
      { value: "San Jose|Palo Alto|Mountain View|Sunnyvale", label: "Silicon Valley" },
      { value: "San Francisco|San Jose|Oakland|Berkeley", label: "Bay Area" },
    ],
  },
];

export const KEYWORD_ALIASES: Record<string, string> = {
  "silicon valley": "San Jose|Palo Alto|Mountain View|Sunnyvale",
  "bay area": "San Francisco|San Jose|Oakland|Berkeley",
  "orange county": ORANGE_COUNTY_CITIES.join("|"),
};

export const PROPERTY_TYPES: SearchOption[] = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "luxury", label: "Luxury Estate" },
];

export const PRICE_RANGES: SearchOption[] = [
  { value: "0-800", label: "Under $800k" },
  { value: "800-1200", label: "$800k — $1.2M" },
  { value: "1200-2000", label: "$1.2M — $2M" },
  { value: "2000+", label: "Over $2M" },
];

export const BED_OPTIONS: SearchOption[] = [1, 2, 3, 4, 5].map((beds) => ({
  value: String(beds),
  label: `${beds}+`,
}));

export const MAX_PRICE_RANGE = { min: 500_000, max: 3_000_000, step: 50_000 } as const;

export const SORT_OPTIONS: Array<{ value: PropertySort; label: string }> = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "area-desc", label: "Largest First" },
];

export const REGION_LABELS: Record<PropertyRegion, string> = {
  "orange-county": "Orange County",
  "bay-area": "Bay Area",
};
