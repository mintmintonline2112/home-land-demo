/**
 * Cấu hình Next.js: strict mode, URL có dấu "/" cuối, tắt tối ưu ảnh của next/image, thư mục build đổi được qua NEXT_DIST_DIR.
 * Dùng bởi: `next dev` / `next build` / `next start`; deploy.sh đặt NEXT_DIST_DIR=.next-blue / .next-green khi build và khi pm2 chạy.
 * Lưu ý: build và start phải cùng NEXT_DIST_DIR (Next ghi distDir vào manifest). Không đặt thì dùng .next như mặc định.
 * Thêm thư mục build mới thì khai cả trong tsconfig.json → include (kẻo next build tự sửa tsconfig trên VPS, git pull lần sau bị vướng).
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
