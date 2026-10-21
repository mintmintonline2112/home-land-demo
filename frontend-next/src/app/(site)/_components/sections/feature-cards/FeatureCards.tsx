/**
 * Section `feature-cards`: các mục icon + tiêu đề + mô tả (VD lý do chọn Sean, kinh nghiệm, mạng lưới đối tác), ba bố cục:
 * `cards` (lưới thẻ viền mảnh căn giữa), `split` (tiêu đề bên trái, lưới 2 cột đánh số có vạch trên bên phải), `rows` (một khung
 * chia ô bằng đường kẻ mảnh, chữ canh trái).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.layout, metadata.items [{title, text, icon}], note, ctaLabel, ctaHref, background.
 * Icon theo tên trong _shared/icons.tsx, trống thì xoay vòng; `cards` / `rows`: 4 mục thì 4 cột, số khác thì 3 cột.
 */
import { CARD } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  IconBadge,
  Note,
  Shell,
  anchorIdOf,
  formatOrdinal,
  iconFor,
  itemsOf,
  layoutOf,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["cards", "split", "rows"] as const;

type FeatureRow = ReturnType<typeof itemsOf>[number];

function CardsBody({ rows }: { rows: FeatureRow[] }) {
  return (
    <ul
      data-stagger="80"
      className={cn("reveal reveal-group grid gap-7 sm:grid-cols-2", rows.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}
    >
      {rows.map((row, i) => (
        <li key={row.title ?? i} className={cn(CARD, "px-7 py-9 text-center")}>
          <IconBadge className="mb-6">{iconFor(row.icon, i)}</IconBadge>
          {row.title ? <h3 className="mb-3 text-lg font-bold text-navy-900">{row.title}</h3> : null}
          {row.text ? <p className="m-0 text-sm leading-relaxed text-ink-faint">{row.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function SplitBody({ rows }: { rows: FeatureRow[] }) {
  return (
    <ul data-stagger="80" className="reveal reveal-group grid gap-x-10 gap-y-12 sm:grid-cols-2">
      {rows.map((row, i) => (
        <li key={row.title ?? i} className="border-t-2 border-navy-800 pt-6">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm font-bold tracking-md text-navy-700">{formatOrdinal(i)}</span>
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-navy-800" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {iconFor(row.icon, i)}
            </svg>
          </div>
          {row.title ? <h3 className="mb-3 text-xl font-bold text-navy-900">{row.title}</h3> : null}
          {row.text ? <p className="m-0 text-base leading-relaxed text-ink-soft">{row.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function RowsBody({ rows }: { rows: FeatureRow[] }) {
  return (
    <ul
      data-stagger="80"
      className={cn(
        "reveal reveal-group grid gap-px border border-line bg-line shadow-soft sm:grid-cols-2",
        rows.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      {rows.map((row, i) => (
        <li
          key={row.title ?? i}
          className="bg-paper p-[clamp(1.75rem,3vw,2.25rem)]"
        >
          <span className="mb-6 grid h-12 w-12 place-items-center bg-navy-800 text-light">
            <svg viewBox="0 0 24 24" className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {iconFor(row.icon, i)}
            </svg>
          </span>
          {row.title ? <h3 className="mb-2.5 text-lg font-bold text-navy-900">{row.title}</h3> : null}
          {row.text ? <p className="m-0 text-sm leading-relaxed text-ink-soft">{row.text}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function FeatureCards({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "cards");
  const rows = itemsOf(section, "items");
  const id = anchorIdOf(section, "feature-cards");

  if (rows.length === 0 && !section?.heading) return null;

  const note = <Note text={textOf(section, "note")} cta={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} />;

  if (layout === "split") {
    return (
      <Shell id={id} tone={toneOf(section, index)}>
        <div className="grid gap-x-[clamp(3rem,7vw,6rem)] gap-y-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="reveal lg:sticky lg:top-32 lg:self-start">
            <Head section={section} align="left" />
          </div>
          <SplitBody rows={rows} />
        </div>
        {note}
      </Shell>
    );
  }

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <Head section={section} />
      {layout === "rows" ? <RowsBody rows={rows} /> : <CardsBody rows={rows} />}
      {note}
    </Shell>
  );
}
