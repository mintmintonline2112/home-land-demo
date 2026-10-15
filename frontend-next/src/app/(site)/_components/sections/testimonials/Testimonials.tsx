/**
 * Section `testimonials`: lưới thẻ cảm nhận khách hàng — dấu ngoặc kép, lời trích in nghiêng, gạch ngang, tên và mô tả ngắn người nói.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{text (lời trích), title (tên), label (VD "Buyers · Irvine, CA")}], background.
 */
import { CARD } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  Shell,
  anchorIdOf,
  itemsOf,
  toneOf,
  type SectionProps,
} from "../_shared";

export function Testimonials({ section, index = 0 }: SectionProps) {
  const rows = itemsOf(section, "items").filter((row) => row.text);
  const id = anchorIdOf(section, "testimonials");

  if (rows.length === 0) return null;

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <Head section={section} />
      <ul data-stagger="80" className="reveal reveal-group grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => (
          <li key={row.title ?? i} className={cn(CARD, "flex flex-col p-8")}>
            <span aria-hidden="true" className="mb-4 block text-[3.5rem] leading-[0.6] font-extrabold text-line">
              &ldquo;
            </span>
            <blockquote className="m-0 mb-7 flex-1 text-base leading-relaxed text-ink-soft italic">
              &ldquo;{row.text}&rdquo;
            </blockquote>
            <div className="border-t border-line pt-5">
              {row.title ? <p className="mb-1 text-base font-bold text-navy-900">{row.title}</p> : null}
              {row.label ? <p className="m-0 text-xs text-ink-faint">{row.label}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
