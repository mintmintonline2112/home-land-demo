/**
 * Gọi API CRUD nhà đăng bán (/admin/properties) và kiểu dữ liệu Property cho admin; nhãn loại nhà / vùng dùng chung cho list + form.
 * Dùng bởi: PropertyForm.tsx, PropertyList.tsx.
 * Lưu ý: mã loại nhà / vùng phải khớp backend (property.entity.ts) và site (src/config/property-search.ts).
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';

export const PROPERTY_QUERY_KEY = ['admin', 'properties'] as const;

export type PropertyImage = { src: string; alt: string };

export interface Property {
  id: number;
  title: string;
  slug: string;
  listingId: string | null;
  status: string;
  type: string;
  typeLabel: string | null;
  region: string;
  neighborhood: string | null;
  city: string;
  state: string;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: string | null;
  garage: number;
  stories: number;
  yearBuilt: number | null;
  facing: string | null;
  hoa: string | null;
  isFeatured: boolean;
  isActive: boolean;
  listedAt: string | null;
  description: string | null;
  amenities: string[] | null;
  images: PropertyImage[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sortOrder: number;
  createdAt: string;
}

export const PROPERTY_TYPE_OPTIONS = [
  { label: 'House', value: 'house' },
  { label: 'Condo', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Luxury Estate', value: 'luxury' },
];

export const PROPERTY_REGION_OPTIONS = [
  { label: 'Orange County', value: 'orange-county' },
  { label: 'Bay Area', value: 'bay-area' },
];

export const PROPERTY_STATUS_OPTIONS = [
  { label: 'For Sale', value: 'For Sale' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Sold', value: 'Sold' },
  { label: 'Coming Soon', value: 'Coming Soon' },
];

export const labelOf = (options: Array<{ label: string; value: string }>, value: string) =>
  options.find((option) => option.value === value)?.label ?? value;

export const formatUsd = (price: number) => `$${Number(price).toLocaleString('en-US')}`;

export const propertyService = createCrudService<Property>('admin/properties', [
  { sortOrder: 'ASC' },
  { listedAt: 'DESC' },
]);
