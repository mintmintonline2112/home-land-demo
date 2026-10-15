"use client";

/**
 * Phần tương tác của contact: đọc ?topic= trên URL để chọn sẵn chủ đề trong form tư vấn rồi hiện ContactForm.
 * Dùng bởi: contact/Contact.tsx (bọc trong Suspense vì useSearchParams).
 * Lưu ý: topic khớp theo value (VD "sell", "valuation" từ menu); không khớp thì chọn chủ đề đầu tiên.
 */
import { useSearchParams } from "next/navigation";
import { ContactForm } from "@/app/(site)/_components/forms";

export type ContactTopic = { label: string; value: string };

export function ContactPanel({
  topics,
  messagePlaceholder,
  submitLabel,
}: {
  topics: ContactTopic[];
  messagePlaceholder?: string;
  submitLabel?: string;
}) {
  const searchParams = useSearchParams();
  const requestedTopic = searchParams.get("topic");
  const defaultTopic = topics.find((topic) => topic.value === requestedTopic)?.label;

  return (
    <ContactForm
      topics={topics.map((topic) => topic.label)}
      defaultTopic={defaultTopic}
      messagePlaceholder={messagePlaceholder}
      submitLabel={submitLabel}
    />
  );
}
