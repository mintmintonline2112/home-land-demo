/**
 * Kiểu dữ liệu nhà đăng bán (listing) mà site public hiển thị: thẻ nhà, trang chi tiết, bộ lọc tìm kiếm.
 * Dùng bởi: app/(site)/_lib/properties.ts, sections property-grid, trang properties và properties/[slug].
 * Lưu ý: API backend (client/properties) trả hơi khác (description là văn bản, isFeatured…); _lib/properties.ts (toProperty) đổi sang kiểu này.
 */
export type PropertyType = "house" | "condo" | "townhouse" | "luxury";

export type PropertyRegion = "orange-county" | "bay-area";

export type PropertyImage = { src: string; alt: string };

export type Property = {
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
  zip: string;
  address: string;
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

export type PropertyQuery = {
  keyword?: string;
  area?: string;
  type?: string;
  price?: string;
  beds?: number;
  maxPrice?: number;
  sort?: PropertySort;
};
