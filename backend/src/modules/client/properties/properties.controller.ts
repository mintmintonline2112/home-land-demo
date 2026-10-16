/**
 * API công khai nhà đăng bán (/api/client/properties): tìm + lọc + chia trang, điểm ghim bản đồ, thẻ nhỏ theo id, chi tiết theo slug,
 * danh sách slug cho sitemap; mọi kết quả có cache theo namespace properties.
 * Dùng bởi: frontend-next/src/app/(site)/_lib/properties.ts (trang /properties, bản đồ, Featured Homes, trang chi tiết, sitemap).
 * Lưu ý: tham số tìm kiếm đọc qua parsePropertySearch (modules/admin/properties/property-search.ts); nhà ẩn (isActive = 0)
 * không bao giờ lộ ra. Route cố định (map, slugs, id/:id, slug/:slug) phải khai trước nếu sau này thêm route động.
 */
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { Property } from 'src/modules/admin/properties/entities/property.entity';
import {
  PropertiesService,
  type MapPointResult,
  type PropertyPage,
} from 'src/modules/admin/properties/properties.service';
import { parsePropertySearch } from 'src/modules/admin/properties/property-search';

@Controller('client/properties')
export class ClientPropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  search(@Query() query: Record<string, unknown>): Promise<PropertyPage> {
    const search = parsePropertySearch(query);
    return this.cache.wrap(CACHE_NS.properties, `search:${JSON.stringify(search)}`, () =>
      this.propertiesService.searchActive(search),
    );
  }

  @Public()
  @Get('map')
  findMapPoints(@Query() query: Record<string, unknown>): Promise<MapPointResult> {
    const search = parsePropertySearch(query);
    return this.cache.wrap(CACHE_NS.properties, `map:${JSON.stringify(search)}`, () =>
      this.propertiesService.findMapPoints(search),
    );
  }

  @Public()
  @Get('slugs')
  findSlugs(): Promise<Array<Pick<Property, 'slug' | 'updatedAt'>>> {
    return this.cache.wrap(CACHE_NS.properties, 'slugs', () => this.propertiesService.findActiveSlugs());
  }

  @Public()
  @Get('id/:id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Property | null> {
    return this.cache.wrap(CACHE_NS.properties, `id:${id}`, () => this.propertiesService.findActiveById(id));
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<Property | null> {
    return this.cache.wrap(CACHE_NS.properties, `slug:${slug}`, () =>
      this.propertiesService.findActiveBySlug(slug),
    );
  }
}
