/**
 * Module trang tổng quan admin.
 * Dùng bởi: admin.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogCategory } from '../blog-categories/entities/blog-category.entity';
import { BlogPost } from '../blog-posts/entities/blog-post.entity';
import { ContactEntity } from '../contact/entities/contact.entity';
import { PageSection } from '../pages/entities/page-section.entity';
import { Page } from '../pages/entities/page.entity';
import { Staff } from '../staffs/staff.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPost,
      BlogCategory,
      Page,
      PageSection,
      ContactEntity,
      Staff,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
