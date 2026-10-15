/**
 * Trang /admin/menus/create: form tạo mục menu mới.
 * Dùng bởi: Next.js App Router; nút "Thêm" ở MenuItemList.
 */

import { MenuItemForm } from '@/app/admin/(protected)/menus/_components/MenuItemForm';

export default function AdminMenuCreatePage() {
  return <MenuItemForm />;
}
