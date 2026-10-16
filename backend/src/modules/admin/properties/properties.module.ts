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

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertyGeocoderService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
