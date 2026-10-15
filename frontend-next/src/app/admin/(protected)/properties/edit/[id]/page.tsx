/**
 * Trang /admin/properties/edit/[id]: form sửa nhà đăng bán, id không hợp lệ thì trả 404.
 * Dùng bởi: Next.js App Router; nút sửa ở PropertyList.
 */

import { notFound } from 'next/navigation';
import { PropertyForm } from '@/app/admin/(protected)/properties/_components/PropertyForm';

export default async function AdminPropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();
  return <PropertyForm id={numericId} />;
}
