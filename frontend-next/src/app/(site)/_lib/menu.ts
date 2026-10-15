/**
 * Lấy menu public từ CMS (bảng menu_items, quản lý tại /admin/menus).
 * Dùng bởi: app/(site)/layout.tsx (truyền vào Header).
 * Lưu ý: lỗi API hoặc menu rỗng thì dùng menu tĩnh SITE_MENU_ITEMS (site-menu.ts).
 */
import { apiFetch } from "@/api/api-fetch";
import { SITE_MENU_ITEMS, type SiteMenuItem } from "./site-menu";

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
