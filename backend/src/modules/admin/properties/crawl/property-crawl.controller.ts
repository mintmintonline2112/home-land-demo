/**
 * API quản trị crawl Zillow: tạo / dừng lượt, xem tiến độ, xem trước và nhập listing đã chọn.
 * Dùng bởi: admin/property-crawl; dùng quyền PROPERTY hiện có để không cần cấp thêm quyền ngoài quản lý nhà.
 */
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { PropertyCrawlService } from './property-crawl.service';
import { ImportCrawledPropertiesDto, ResumePropertyCrawlDto, StartPropertyCrawlDto } from './dto/crawl-request.dto';

@ApiTags('Admin - Property Crawl')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@Controller('admin/property-crawl')
export class PropertyCrawlController {
  constructor(private readonly crawl: PropertyCrawlService) {}

  @Get()
  @SetMetadata('permissions', ['PROPERTY_LIST'])
  list() { return this.crawl.listRuns(); }

  @Post()
  @SetMetadata('permissions', ['PROPERTY_LIST', 'PROPERTY_CREATE'])
  start(@Body() input: StartPropertyCrawlDto) { return this.crawl.start(input); }

  @Get(':id/selection')
  @SetMetadata('permissions', ['PROPERTY_LIST', 'PROPERTY_CREATE', 'PROPERTY_UPDATE'])
  selection(@Param('id', ParseIntPipe) id: number) { return this.crawl.selectUnimportedItems(id); }

  @Get(':id/items')
  @SetMetadata('permissions', ['PROPERTY_LIST'])
  items(@Param('id', ParseIntPipe) id: number, @Query('page') page?: string) {
    const parsed = Number(page ?? 1);
    return this.crawl.listItems(id, Number.isInteger(parsed) && parsed > 0 && parsed < 100000 ? parsed : 1);
  }

  @Post(':id/cancel')
  @SetMetadata('permissions', ['PROPERTY_CREATE'])
  cancel(@Param('id', ParseIntPipe) id: number) { return this.crawl.cancel(id); }

  @Post(':id/resume')
  @SetMetadata('permissions', ['PROPERTY_LIST', 'PROPERTY_CREATE'])
  resume(@Param('id', ParseIntPipe) id: number, @Body() input: ResumePropertyCrawlDto) {
    return this.crawl.resume(id, input);
  }

  @Post(':id/import')
  @SetMetadata('permissions', ['PROPERTY_CREATE', 'PROPERTY_UPDATE'])
  import(@Param('id', ParseIntPipe) id: number, @Body() input: ImportCrawledPropertiesDto) {
    return this.crawl.importItems(id, input);
  }
}
