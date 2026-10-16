/**
 * Kiểu dữ liệu nhà đăng bán (listing) mà site public hiển thị: thẻ nhà, trang chi tiết, bộ lọc tìm kiếm.
 * Dùng bởi: app/(site)/_lib/properties.ts, sections property-grid, trang properties (danh sách + bản đồ) và properties/[slug].
 * Lưu ý: API backend (client/properties) trả hơi khác (description là văn bản, isFeatured…); _lib/properties.ts (toProperty) đổi sang kiểu này.
 * PropertyFilters là tham số trên URL /properties (bounds = "nam,tây,bắc,đông"); latitude / longitude null thì nhà không có ghim bản đồ.
 */
export type PropertyType = "house" | "condo" | "townhouse" | "luxury";

export type PropertyRegion = "orange-county" | "bay-area";

export type PropertyImage = { src: string; alt: string };

export type Property = {
  id: number;
  slug: string;
  title: string;
  listingId: string;
  status: string;
  type: PropertyType;
  typeLabel: string;
  region: PropertyRegion;
  neighborhood?: string;
  city: string;
  state: string;
  zip: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: string;
  garage: number;
  stories: number;
  yearBuilt: number;
  facing: string;
  hoa: string;
  featured: boolean;
  listedAt: string;
  description: string[];
  amenities: string[];
  images: PropertyImage[];
};

export type PropertySort = "newest" | "price-asc" | "price-desc" | "area-desc";

export type PropertyFilters = {
  keyword?: string;
  area?: string;
  type?: string;
  price?: string;
  beds?: string;
  sort?: string;
  page?: number;
  bounds?: string;
};

export type PropertyPage = {
  data: Property[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type MapPoint = { id: number; latitude: number; longitude: number; price: number };

export type MapPointResult = { total: number; truncated: boolean; points: MapPoint[] };
