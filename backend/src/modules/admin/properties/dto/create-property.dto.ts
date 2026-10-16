/**
 * Kiểm tra dữ liệu gửi lên khi tạo nhà đăng bán (listing).
 * Dùng bởi: properties.controller.ts, dto/update-property.dto.ts.
 * Lưu ý: type / region chỉ nhận mã trong PROPERTY_TYPES / PROPERTY_REGIONS của entity; slug trống thì tự sinh từ title.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  PROPERTY_REGIONS,
  PROPERTY_TYPES,
  type PropertyRegion,
  type PropertyType,
} from '../entities/property.entity';

export class PropertyImageDto {
  @ApiProperty({ example: 'uploads/properties/turtle-rock.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  src: string;

  @ApiPropertyOptional({ example: 'Estate exterior with pool' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt: string;
}

export class CreatePropertyDto {
  @ApiProperty({ example: 'Turtle Rock Estate' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'turtle-rock-estate' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'ST-2026-0812' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  listingId?: string | null;

  @ApiPropertyOptional({ example: 'For Sale' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;

  @ApiProperty({ enum: PROPERTY_TYPES, example: 'luxury' })
  @IsIn(PROPERTY_TYPES)
  type: PropertyType;

  @ApiPropertyOptional({ example: 'Single-Family Estate' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  typeLabel?: string | null;

  @ApiProperty({ enum: PROPERTY_REGIONS, example: 'orange-county' })
  @IsIn(PROPERTY_REGIONS)
  region: PropertyRegion;

  @ApiPropertyOptional({ example: 'Turtle Rock' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string | null;

  @ApiProperty({ example: 'Irvine' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @ApiPropertyOptional({ example: 'CA' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string;

  @ApiPropertyOptional({ example: '92603' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  zip?: string | null;

  @ApiPropertyOptional({ example: '12 Sendero' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string | null;

  @ApiPropertyOptional({ example: 33.6412, description: 'Trống thì tự lấy từ địa chỉ khi lưu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({ example: -117.7997, description: 'Trống thì tự lấy từ địa chỉ khi lưu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number | null;

  @ApiProperty({ example: 1850000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  beds?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(255)
  baths?: number;

  @ApiPropertyOptional({ example: 3800 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sqft?: number;

  @ApiPropertyOptional({ example: '0.30 acres' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  lotSize?: string | null;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  garage?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stories?: number;

  @ApiPropertyOptional({ example: 2018 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1800)
  yearBuilt?: number | null;

  @ApiPropertyOptional({ example: 'Southeast' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  facing?: string | null;

  @ApiPropertyOptional({ example: '$250 / month' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  hoa?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  listedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Các đoạn cách nhau bằng một dòng trống',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: ['Pool & Spa', 'Panoramic Views'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(60)
  @IsString({ each: true })
  amenities?: string[] | null;

  @ApiPropertyOptional({ type: [PropertyImageDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => PropertyImageDto)
  images?: PropertyImageDto[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescription?: string | null;
}
