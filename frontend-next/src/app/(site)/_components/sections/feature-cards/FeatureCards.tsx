/**
 * Section `feature-cards`: lưới thẻ viền mảnh căn giữa, mỗi thẻ có ô icon vuông + tiêu đề + mô tả (VD lý do chọn Sean, mạng lưới đối tác).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title, text, icon}], note, ctaLabel, ctaHref, background.
 * Icon theo tên trong _shared/icons.tsx, trống thì xoay vòng; 4 thẻ thì 4 cột, số khác thì 3 cột.
 */
import { CARD } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  IconBadge,
  Note,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";

export function FeatureCards({ section, index = 0 }: SectionProps) {
  const rows = itemsOf(section, "items");
  const id = anchorIdOf(section, "feature-cards");

  if (rows.length === 0 && !section?.heading) return null;

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <Head section={section} />
      <ul
        data-stagger="80"
        className={cn(
          "reveal reveal-group grid gap-7 sm:grid-cols-2",
          rows.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {rows.map((row, i) => (
          <li key={row.title ?? i} className={cn(CARD, "px-7 py-9 text-center")}>
            <IconBadge className="mb-6">{iconFor(row.icon, i)}</IconBadge>
            {row.title ? <h3 className="mb-3 text-lg font-bold text-navy-900">{row.title}</h3> : null}
            {row.text ? <p className="m-0 text-sm leading-relaxed text-ink-faint">{row.text}</p> : null}
          </li>
        ))}
      </ul>
      <Note text={textOf(section, "note")} cta={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} />
    </Shell>
  );
}
