/**
 * Module nhà đăng bán cho admin; xuất PropertiesService cho API công khai và seed dùng lại.
 * Dùng bởi: admin.module.ts, modules/client/properties/properties.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/property.entity';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';
import { PropertyGeocoderService } from './property-geocoder.service';
import { PropertyCrawlRun } from './crawl/property-crawl-run.entity';
import { PropertyCrawlItem } from './crawl/property-crawl-item.entity';
import { PropertyCrawlController } from './crawl/property-crawl.controller';
import { PropertyCrawlService } from './crawl/property-crawl.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property, PropertyCrawlRun, PropertyCrawlItem])],
  controllers: [PropertyCrawlController, PropertiesController],
  providers: [PropertiesService, PropertyGeocoderService, PropertyCrawlService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
