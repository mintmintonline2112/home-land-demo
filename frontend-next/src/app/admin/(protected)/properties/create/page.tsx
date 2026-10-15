/**
 * Trang /admin/properties/create: form đăng nhà mới.
 * Dùng bởi: Next.js App Router; nút "Đăng nhà mới" ở PropertyList.
 */

import { PropertyForm } from '@/app/admin/(protected)/properties/_components/PropertyForm';

export default function AdminPropertyCreatePage() {
  return <PropertyForm />;
}
