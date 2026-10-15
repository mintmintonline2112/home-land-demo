/**
 * Bản dự phòng của các trang chuẩn (home, about, properties, contact) khi API CMS lỗi hoặc trang bị gỡ khỏi CMS.
 * Dùng bởi: app/(site)/page.tsx, [slug]/page.tsx, properties/page.tsx, contact/page.tsx.
 * Lưu ý: src/content/cms-fallback.json sinh từ seed backend (`cd backend && npm run content:export`);
 * không sửa tay file JSON, sửa page.seed.ts rồi chạy lại lệnh. Slug không có trong file thì trả null.
 */
import fallbackJson from "@/content/cms-fallback.json";
import type { CmsPage } from "@/types/cms";

const FALLBACK_PAGES = fallbackJson as unknown as Record<string, CmsPage>;

export function findFallbackPage(slug: string): CmsPage | null {
  return FALLBACK_PAGES[slug] ?? null;
}

export function getFallbackPage(slug: "home" | "properties" | "contact"): CmsPage {
  return FALLBACK_PAGES[slug];
}
