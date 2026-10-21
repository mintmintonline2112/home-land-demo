/**
 * Kiểm tra giới hạn công việc crawl và danh sách bản xem trước được admin chọn nhập.
 * Dùng bởi: property-crawl.controller.ts; giới hạn áp dụng cả giao diện lẫn gọi API trực tiếp.
 */
import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class StartPropertyCrawlDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(2048, { each: true })
  urls: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  startPage?: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  maxPages: number;

  @IsInt()
  @Min(1)
  @Max(20000)
  maxListings: number;
}

export class ResumePropertyCrawlDto {
  @IsInt()
  @Min(1)
  @Max(1000)
  additionalPages: number;

  @IsInt()
  @Min(1)
  @Max(20000)
  additionalListings: number;
}

export class ImportCrawledPropertiesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  itemIds: number[];

  @IsOptional()
  @IsBoolean()
  publish: boolean = false;
}
