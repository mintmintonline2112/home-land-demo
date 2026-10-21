/**
 * Lưu bản xem trước listing tách khỏi bảng nhà công khai, duy nhất theo lượt crawl và mã Zillow.
 * Dùng bởi: property-crawl.service.ts để phân trang, chọn nhập và theo dõi bản ghi đã nhập.
 */
import { Column, Entity, Index } from 'typeorm';
import type { DeepPartial } from 'typeorm';
import { BaseEntity } from 'src/common/base/base.entity';
import type { Property } from '../entities/property.entity';

@Entity('property_crawl_items')
@Index('UQ_crawl_item_run_key', ['runId', 'sourceKey'], { unique: true })
export class PropertyCrawlItem extends BaseEntity {
  @Column({ type: 'int', unsigned: true })
  runId: number;

  @Column({ type: 'varchar', length: 80 })
  sourceKey: string;

  @Column({ type: 'varchar', length: 2048 })
  sourceUrl: string;

  @Column({ type: 'json' })
  data: DeepPartial<Property>;

  @Column({ type: 'datetime' })
  fetchedAt: Date;

  @Column({ type: 'int', unsigned: true, nullable: true })
  propertyId: number | null;
}
