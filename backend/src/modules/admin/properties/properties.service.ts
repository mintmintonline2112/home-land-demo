/**
 * Lưu nhà đăng bán (tự sinh slug không trùng, tự lấy toạ độ từ địa chỉ khi chưa có) và đọc nhà đang hiện cho website:
 * tìm + lọc + chia trang, điểm ghim bản đồ, thẻ nhỏ theo id, chi tiết theo slug, danh sách slug cho sitemap.
 * Dùng bởi: properties.controller.ts (admin), modules/client/properties (API công khai), database/seeding (property.seed.ts).
 * Lưu ý: website chỉ thấy nhà isActive = 1. Lọc chạy trong SQL (đủ cho hàng chục nghìn nhà); điểm bản đồ trả tối đa MAP_POINT_LIMIT,
 * vượt thì `truncated = true` để website xin lại theo khung bản đồ đang xem. Sửa địa chỉ mà không gửi toạ độ thì toạ độ được tính lại;
 * geocoding không tìm thấy địa chỉ thì dùng tâm thành phố (cityCenterOf) — admin nhập toạ độ tay nếu cần chính xác.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, EntityManager, Repository, SelectQueryBuilder } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { Property } from './entities/property.entity';
import { cityCenterOf } from './california-places';
import { PropertyGeocoderService, type GeocodableAddress } from './property-geocoder.service';
import type { PropertySearch, PropertySort } from './property-search';

export type MapPoint = { id: number; latitude: number; longitude: number; price: number };

export type MapPointResult = { total: number; truncated: boolean; points: MapPoint[] };

export type PropertyPage = {
  data: Property[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

const MAP_POINT_LIMIT = 5000;

const SITEMAP_SLUG_LIMIT = 45000;

const LOCATION_FIELDS = ['address', 'city', 'state', 'zip'] as const;

const SORT_ORDER: Record<PropertySort, Array<[string, 'ASC' | 'DESC']>> = {
  newest: [['property.listedAt', 'DESC'], ['property.id', 'DESC']],
  'price-asc': [['property.price', 'ASC'], ['property.id', 'ASC']],
  'price-desc': [['property.price', 'DESC'], ['property.id', 'DESC']],
  'area-desc': [['property.sqft', 'DESC'], ['property.id', 'DESC']],
  manual: [['property.sortOrder', 'ASC'], ['property.listedAt', 'DESC'], ['property.id', 'DESC']],
};

const hasCoordinates = (data: DeepPartial<Property>) =>
  typeof data.latitude === 'number' && typeof data.longitude === 'number';

@Injectable()
export class PropertiesService extends BaseService<Property, number> {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    private readonly geocoder: PropertyGeocoderService,
  ) {
    super(propertyRepo);
  }

  override async create(data: DeepPartial<Property>): Promise<Property> {
    const slug = await generateUniqueSlug(this.propertyRepo, data.slug || data.title);
    const coordinates = hasCoordinates(data) ? null : await this.locate(data);
    return super.create({ ...data, ...(coordinates ?? {}), slug });
  }

  override async update(
    id: number,
    data: DeepPartial<Property>,
    manager?: EntityManager,
  ): Promise<Property> {
    const existing = await this.propertyRepo.findOne({ where: { id } });
    if (data.slug !== undefined) {
      const slugSource = data.slug || data.title || existing?.title || '';
      data = {
        ...data,
        slug: await generateUniqueSlug(this.propertyRepo, slugSource, { excludeId: id }),
      };
    }
    if (existing && !hasCoordinates(data)) {
      const isLocationChanged = LOCATION_FIELDS.some(
        (field) => data[field] !== undefined && data[field] !== existing[field],
      );
      const isMissingCoordinates = existing.latitude === null || existing.longitude === null;
      const shouldGeocode = isLocationChanged || isMissingCoordinates || data.latitude === null;
      if (shouldGeocode) {
        const coordinates = await this.locate({ ...existing, ...data } as GeocodableAddress);
        data = { ...data, ...(coordinates ?? (isLocationChanged ? { latitude: null, longitude: null } : {})) };
      }
    }
    return super.update(id, data, manager);
  }

  private async locate(location: GeocodableAddress) {
    return (await this.geocoder.geocode(location)) ?? cityCenterOf(location.city);
  }

  private buildActiveQuery(search: PropertySearch): SelectQueryBuilder<Property> {
    const query = this.propertyRepo
      .createQueryBuilder('property')
      .where('property.isActive = :isActive', { isActive: true });

    if (search.places.length > 0) {
      query.andWhere(
        new Brackets((placeQuery) =>
          placeQuery
            .where('property.city IN (:...places)', { places: search.places })
            .orWhere('property.neighborhood IN (:...places)', { places: search.places }),
        ),
      );
    }
    if (search.keyword) {
      const pattern = `%${search.keyword.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;
      query.andWhere(
        new Brackets((keywordQuery) =>
          ['title', 'address', 'city', 'neighborhood', 'zip', 'typeLabel', 'listingId'].forEach((field, i) =>
            i === 0
              ? keywordQuery.where(`property.${field} LIKE :pattern`, { pattern })
              : keywordQuery.orWhere(`property.${field} LIKE :pattern`, { pattern }),
          ),
        ),
      );
    }
    if (search.type) query.andWhere('property.type = :type', { type: search.type });
    if (search.region) query.andWhere('property.region = :region', { region: search.region });
    if (search.minPrice) query.andWhere('property.price >= :minPrice', { minPrice: search.minPrice });
    if (search.maxPrice) query.andWhere('property.price <= :maxPrice', { maxPrice: search.maxPrice });
    if (search.minBeds) query.andWhere('property.beds >= :minBeds', { minBeds: search.minBeds });
    if (search.isFeatured) query.andWhere('property.isFeatured = :isFeatured', { isFeatured: true });
    if (search.excludeSlug) query.andWhere('property.slug != :excludeSlug', { excludeSlug: search.excludeSlug });
    if (search.bounds) {
      query
        .andWhere('property.latitude BETWEEN :south AND :north', search.bounds)
        .andWhere('property.longitude BETWEEN :west AND :east', search.bounds);
    }
    return query;
  }

  async searchActive(search: PropertySearch): Promise<PropertyPage> {
    const query = this.buildActiveQuery(search);
    SORT_ORDER[search.sort].forEach(([column, direction], i) =>
      i === 0 ? query.orderBy(column, direction) : query.addOrderBy(column, direction),
    );
    const [data, total] = await query
      .skip((search.page - 1) * search.limit)
      .take(search.limit)
      .getManyAndCount();
    return {
      data,
      meta: { total, page: search.page, limit: search.limit, totalPages: Math.max(1, Math.ceil(total / search.limit)) },
    };
  }

  async findMapPoints(search: PropertySearch): Promise<MapPointResult> {
    const query = this.buildActiveQuery(search)
      .andWhere('property.latitude IS NOT NULL')
      .andWhere('property.longitude IS NOT NULL');
    const total = await query.getCount();
    const rows = await query
      .select(['property.id', 'property.latitude', 'property.longitude', 'property.price'])
      .orderBy('property.price', 'DESC')
      .limit(MAP_POINT_LIMIT)
      .getMany();
    return {
      total,
      truncated: total > rows.length,
      points: rows.map((row) => ({
        id: row.id,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        price: row.price,
      })),
    };
  }

  findActiveById(id: number): Promise<Property | null> {
    return this.propertyRepo.findOne({ where: { id, isActive: true } });
  }

  findActiveBySlug(slug: string): Promise<Property | null> {
    return this.propertyRepo.findOne({ where: { slug, isActive: true } });
  }

  findActiveSlugs(): Promise<Array<Pick<Property, 'slug' | 'updatedAt'>>> {
    return this.propertyRepo.find({
      where: { isActive: true },
      select: ['slug', 'updatedAt'],
      order: { listedAt: 'DESC' },
      take: SITEMAP_SLUG_LIMIT,
    });
  }
}
