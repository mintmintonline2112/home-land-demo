/**
 * Bảng properties: nhà đăng bán (listing) — tên, slug, địa chỉ, giá, phòng ngủ / tắm, diện tích, thông số, mô tả, tiện ích, bộ ảnh, SEO.
 * Dùng bởi: properties.service.ts, properties.controller.ts, modules/client/properties, database/seeding (property.seed.ts).
 * Lưu ý: description là văn bản thường, các đoạn cách nhau bằng một dòng trống; amenities là mảng chuỗi; images là mảng {src, alt}
 * (src là link https hoặc đường dẫn uploads/... của Thư viện), ảnh đầu tiên là ảnh bìa; type / region khớp frontend config/property-search.ts.
 * Khóa nguồn chống trùng listing crawl; baths hỗ trợ số lẻ. Toạ độ trống thì nhà không hiện trên bản đồ.
 * TypeORM nạp entity theo mẫu tên *.entity.ts, không đổi tên file.
 */
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';

export const PROPERTY_TYPES = [
  'house',
  'condo',
  'townhouse',
  'luxury',
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_REGIONS = ['orange-county', 'bay-area', 'california'] as const;
export type PropertyRegion = (typeof PROPERTY_REGIONS)[number];

export type PropertyImage = { src: string; alt: string };

@Entity('properties')
@Index('IDX_properties_listing', ['isActive', 'sortOrder'])
@Index('IDX_properties_location', ['latitude', 'longitude'])
@Index('UQ_properties_source_key', ['source', 'sourceKey'], { unique: true })
export class Property extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index('UQ_properties_slug', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ name: 'listing_id', type: 'varchar', length: 40, nullable: true })
  listingId: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  source: string | null;

  @Column({ name: 'source_key', type: 'varchar', length: 80, nullable: true })
  sourceKey: string | null;

  @Column({ name: 'source_url', type: 'varchar', length: 2048, nullable: true })
  sourceUrl: string | null;

  @Column({ name: 'source_broker', type: 'varchar', length: 255, nullable: true })
  sourceBroker: string | null;

  @Column({ name: 'last_crawled_at', type: 'datetime', nullable: true })
  lastCrawledAt: Date | null;

  @Column({ type: 'varchar', length: 40, default: 'For Sale' })
  status: string;

  @Index('IDX_properties_type')
  @Column({ type: 'varchar', length: 20 })
  type: PropertyType;

  @Column({ name: 'type_label', type: 'varchar', length: 80, nullable: true })
  typeLabel: string | null;

  @Index('IDX_properties_region')
  @Column({ type: 'varchar', length: 30 })
  region: PropertyRegion;

  @Column({ type: 'varchar', length: 120, nullable: true })
  neighborhood: string | null;

  @Column({ type: 'varchar', length: 120 })
  city: string;

  @Column({ type: 'varchar', length: 2, default: 'CA' })
  state: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zip: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'double', nullable: true })
  latitude: number | null;

  @Column({ type: 'double', nullable: true })
  longitude: number | null;

  @Column({ type: 'int', unsigned: true })
  price: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  beds: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, unsigned: true, default: 0 })
  baths: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  sqft: number;

  @Column({ name: 'lot_size', type: 'varchar', length: 40, nullable: true })
  lotSize: string | null;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  garage: number;

  @Column({ type: 'tinyint', unsigned: true, default: 1 })
  stories: number;

  @Column({
    name: 'year_built',
    type: 'smallint',
    unsigned: true,
    nullable: true,
  })
  yearBuilt: number | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  facing: string | null;

  @Column({ type: 'varchar', length: 60, nullable: true })
  hoa: string | null;

  @Index('IDX_properties_featured')
  @Column({ name: 'is_featured', type: 'tinyint', width: 1, default: 0 })
  isFeatured: boolean;

  @Column({ name: 'is_active', type: 'tinyint', width: 1, default: 1 })
  isActive: boolean;

  @Column({ name: 'listed_at', type: 'date', nullable: true })
  listedAt: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  amenities: string[] | null;

  @Column({ type: 'json', nullable: true })
  images: PropertyImage[] | null;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({
    name: 'meta_description',
    type: 'varchar',
    length: 320,
    nullable: true,
  })
  metaDescription: string | null;
}
