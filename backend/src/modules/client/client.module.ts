/**
 * Gom các module API công khai cho website: trang, bài blog / danh mục, gửi liên hệ.
 * Dùng bởi: src/app.module.ts.
 */
import { Module } from '@nestjs/common';
import { ContactModule } from '../admin/contact/contact.module';
import { ClientBlogPostsModule } from './blog-posts/blog-posts.module';
import { ClientPagesModule } from './pages/pages.module';

@Module({
  imports: [
    ContactModule,
    ClientBlogPostsModule,
    ClientPagesModule,
  ],
})
export class ClientModule {}
