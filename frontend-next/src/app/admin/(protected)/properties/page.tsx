/**
 * Trang /admin/properties: danh sách nhà đăng bán.
 * Dùng bởi: Next.js App Router (route /admin/properties).
 */

import { PropertyList } from '@/app/admin/(protected)/properties/_components/PropertyList';

export default function AdminPropertiesPage() {
  return <PropertyList />;
}
