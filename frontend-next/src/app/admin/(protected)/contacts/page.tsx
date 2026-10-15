/**
 * Trang /admin/contacts: danh sách liên hệ khách gửi từ form website.
 * Dùng bởi: Next.js App Router (route /admin/contacts).
 */

import { ContactList } from '@/app/admin/(protected)/contacts/_components/ContactList';

export default function AdminContactsPage() {
  return <ContactList />;
}
