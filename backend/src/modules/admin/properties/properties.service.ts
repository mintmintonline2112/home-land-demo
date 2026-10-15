/**
 * Lưu nhà đăng bán, tự sinh slug không trùng khi tạo và khi sửa slug; đọc danh sách / chi tiết đang hiện cho website.
 * Dùng bởi: properties.controller.ts (admin), modules/client/properties (API công khai), database/seeding (property.seed.ts).
 * Lưu ý: website chỉ thấy nhà isActive = 1; thứ tự công khai là sortOrder tăng dần rồi ngày đăng mới nhất.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { Property } from './entities/property.entity';

@Injectable()
export class PropertiesService extends BaseService<Property, number> {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {
    super(propertyRepo);
  }

  override async create(data: DeepPartial<Property>): Promise<Property> {
    const slug = await generateUniqueSlug(
      this.propertyRepo,
      data.slug || data.title,
    );
    return super.create({ ...data, slug });
  }

  override async update(
    id: number,
    data: DeepPartial<Property>,
    manager?: EntityManager,
  ): Promise<Property> {
    if (data.slug !== undefined) {
      const existing = await this.propertyRepo.findOne({ where: { id } });
      const slugSource = data.slug || data.title || existing?.title || '';
      data = {
        ...data,
        slug: await generateUniqueSlug(this.propertyRepo, slugSource, {
          excludeId: id,
        }),
      };
    }
    return super.update(id, data, manager);
  }

  findActive(): Promise<Property[]> {
    return this.propertyRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', listedAt: 'DESC', id: 'DESC' },
    });
  }

  findActiveBySlug(slug: string): Promise<Property | null> {
    return this.propertyRepo.findOne({ where: { slug, isActive: true } });
  }
}
