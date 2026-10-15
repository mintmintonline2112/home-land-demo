/**
 * Trang /admin/menus: danh sách mục menu điều hướng của website.
 * Dùng bởi: Next.js App Router (route /admin/menus).
 */

import { MenuItemList } from '@/app/admin/(protected)/menus/_components/MenuItemList';

export default function AdminMenusPage() {
  return <MenuItemList />;
}
