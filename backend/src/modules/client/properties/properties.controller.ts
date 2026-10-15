/**
 * API công khai nhà đăng bán (/api/client/properties): toàn bộ nhà đang hiện, và chi tiết theo slug; có cache.
 * Dùng bởi: frontend-next/src/app/(site)/_lib/properties.ts.
 * Lưu ý: trả cả danh sách (số nhà ít) để website tự lọc / sắp xếp theo ô tìm kiếm; nhà ẩn (isActive = 0) không bao giờ lộ ra.
 */
import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { Property } from 'src/modules/admin/properties/entities/property.entity';
import { PropertiesService } from 'src/modules/admin/properties/properties.service';

@Controller('client/properties')
export class ClientPropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  findAll(): Promise<Property[]> {
    return this.cache.wrap(CACHE_NS.properties, 'list', () =>
      this.propertiesService.findActive(),
    );
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<Property | null> {
    return this.cache.wrap(CACHE_NS.properties, `slug:${slug}`, () =>
      this.propertiesService.findActiveBySlug(slug),
    );
  }
}
