/**
 * Kiểm tra dữ liệu sửa nhà đăng bán: mọi field của bản tạo, đều tùy chọn.
 * Dùng bởi: properties.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
