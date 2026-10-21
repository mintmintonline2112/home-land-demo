/**
 * Lấy menu public từ CMS (bảng menu_items, quản lý tại /admin/menus) và dữ liệu menu thả xuống "Blogs" (danh mục + bài mới nhất).
 * Dùng bởi: app/(site)/layout.tsx (truyền vào Header).
 * Lưu ý: lỗi API hoặc menu rỗng thì dùng menu tĩnh SITE_MENU_ITEMS (site-menu.ts). getBlogMenu chỉ giữ vài trường cần cho menu
 * (BLOG_MENU_POST_LIMIT bài mới nhất) để HTML mỗi trang không phình; lỗi API thì trả rỗng, menu Blogs vẫn hiện các tab có sẵn.
 */
import { apiFetch } from "@/api/api-fetch";
import type { BlogMenuData } from "@/app/(site)/_components/layout/BlogMenuPanel";
import { getBlogCategories, getBlogPosts, toMediaUrl } from "./cms";
import { SITE_MENU_ITEMS, type SiteMenuItem } from "./site-menu";

const BLOG_MENU_POST_LIMIT = 24;

type ApiMenuItem = {
  id: number;
  label: string;
  href: string;
  showSubmenu?: boolean;
  children?: { id: number; label: string; href: string }[];
};

export async function getSiteMenu(): Promise<SiteMenuItem[]> {
  try {
    const items = await apiFetch<ApiMenuItem[]>("client/menu", {
      next: { revalidate: 60, tags: ["menu"] },
    });
    if (!items?.length) return SITE_MENU_ITEMS;

    return items.map((item) => ({
      key: String(item.id),
      label: item.label,
      href: item.href,
      showSubmenu: item.showSubmenu !== false,
      children: item.children?.length
        ? item.children.map((child) => ({
            label: child.label,
            href: child.href,
          }))
        : undefined,
    }));
  } catch {
    return SITE_MENU_ITEMS;
  }
}

export async function getBlogMenu(): Promise<BlogMenuData> {
  const [categories, posts] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ limit: BLOG_MENU_POST_LIMIT }),
  ]);
  return {
    categories: categories
      .filter((category) => category.isActive !== false && !category.parentId)
      .map((category) => ({ slug: category.slug, name: category.name })),
    posts: (posts?.data ?? []).map((post) => ({
      slug: post.slug,
      title: post.title,
      coverUrl: toMediaUrl(post.coverImagePath),
      publishedAt: post.publishedAt,
      categorySlug: post.category?.slug ?? null,
    })),
  };
}
