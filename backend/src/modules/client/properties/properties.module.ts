/**
 * Module API nhà đăng bán công khai, dùng lại PropertiesService của khu admin.
 * Dùng bởi: modules/client/client.module.ts.
 */
import { Module } from '@nestjs/common';
import { PropertiesModule } from 'src/modules/admin/properties/properties.module';
import { ClientPropertiesController } from './properties.controller';

@Module({
  imports: [PropertiesModule],
  controllers: [ClientPropertiesController],
})
export class ClientPropertiesModule {}
