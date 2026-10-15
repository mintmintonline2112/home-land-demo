/**
 * API CRUD nhà đăng bán cho admin (/admin/properties): danh sách tìm theo tên / thành phố / mã tin, lọc theo loại, vùng, nổi bật, hiện; ghi xong thì xoá cache nhà.
 * Dùng bởi: frontend-next app/admin/(protected)/properties/_lib/property.service.ts.
 * Lưu ý: quyền sinh theo entity PROPERTY (PROPERTY_LIST, PROPERTY_CREATE…) — controller phải có trong permission.seed.ts.
 */
import {
  Controller,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertiesService } from './properties.service';

@ApiTags('Admin - Properties')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'PROPERTY')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.properties])
@Controller('admin/properties')
export class PropertiesController extends BaseController<
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  number
> {
  constructor(private readonly propertiesService: PropertiesService) {
    super(propertiesService, 'Property');
  }

  protected override getSearchFields(): (keyof Property)[] {
    return ['title', 'city', 'listingId'];
  }

  protected override getFilterableFields(): (keyof Property)[] {
    return ['type', 'region', 'isFeatured', 'isActive'];
  }
}
