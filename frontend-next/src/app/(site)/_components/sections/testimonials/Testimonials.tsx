/**
 * Section `testimonials`: cảm nhận khách hàng, hai bố cục: `cards` (lưới thẻ — ngoặc kép, lời trích in nghiêng, tên, mô tả) và
 * `spotlight` (lời trích đầu tiên in lớn bên trái, các lời còn lại xếp dọc bên phải, hợp nền navy).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.layout, metadata.items [{text (lời trích), title (tên), label (VD "Buyers · Irvine, CA")}],
 * background. `spotlight` đổi màu chữ theo nền: nền dark thì chữ sáng.
 */
import { CARD } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  Shell,
  anchorIdOf,
  itemsOf,
  layoutOf,
  toneOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["cards", "spotlight"] as const;

type QuoteRow = ReturnType<typeof itemsOf>[number];

function CardsBody({ rows }: { rows: QuoteRow[] }) {
  return (
    <ul data-stagger="80" className="reveal reveal-group grid gap-7 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row, i) => (
        <li key={row.title ?? i} className={cn(CARD, "flex flex-col p-8")}>
          <span aria-hidden="true" className="mb-4 block text-[3.5rem] leading-[0.6] font-extrabold text-line">
            &ldquo;
          </span>
          <blockquote className="m-0 mb-7 flex-1 text-base leading-relaxed text-ink-soft italic">&ldquo;{row.text}&rdquo;</blockquote>
          <div className="border-t border-line pt-5">
            {row.title ? <p className="mb-1 text-base font-bold text-navy-900">{row.title}</p> : null}
            {row.label ? <p className="m-0 text-xs text-ink-faint">{row.label}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function QuoteAuthor({ row, isLight }: { row: QuoteRow; isLight: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className={cn("h-px w-8", isLight ? "bg-light/40" : "bg-navy-700")} />
      <p className="m-0 text-sm">
        {row.title ? <strong className={cn("font-bold", isLight ? "text-light" : "text-navy-900")}>{row.title}</strong> : null}
        {row.label ? <span className={cn("ml-2", isLight ? "text-light/55" : "text-ink-faint")}>{row.label}</span> : null}
      </p>
    </div>
  );
}

function SpotlightBody({ rows, isLight }: { rows: QuoteRow[]; isLight: boolean }) {
  const [featured, ...others] = rows;
  return (
    <div className="grid gap-x-[clamp(3rem,6vw,5rem)] gap-y-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <figure className="reveal m-0">
        <span
          aria-hidden="true"
          className={cn("mb-2 block font-display text-[7rem] leading-[0.75] font-extrabold", isLight ? "text-light/15" : "text-line")}
        >
          &ldquo;
        </span>
        <blockquote
          className={cn("m-0 mb-8 text-[clamp(1.35rem,2.4vw,1.85rem)] leading-snug font-light", isLight ? "text-light" : "text-navy-900")}
        >
          {featured.text}
        </blockquote>
        <figcaption>
          <QuoteAuthor row={featured} isLight={isLight} />
        </figcaption>
      </figure>
      {others.length > 0 ? (
        <ul data-stagger="90" className="reveal reveal-group grid content-center gap-9">
          {others.map((row, i) => (
            <li key={row.title ?? i} className={cn("border-l-2 pl-6", isLight ? "border-light/25" : "border-navy-700")}>
              <blockquote className={cn("m-0 mb-4 text-base leading-relaxed italic", isLight ? "text-light/85" : "text-ink-soft")}>
                &ldquo;{row.text}&rdquo;
              </blockquote>
              <QuoteAuthor row={row} isLight={isLight} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Testimonials({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "cards");
  const tone = toneOf(section, index);
  const rows = itemsOf(section, "items").filter((row) => row.text);
  const id = anchorIdOf(section, "testimonials");

  if (rows.length === 0) return null;

  return (
    <Shell id={id} tone={tone}>
      <Head section={section} light={tone === "dark"} />
      {layout === "spotlight" ? <SpotlightBody rows={rows} isLight={tone === "dark"} /> : <CardsBody rows={rows} />}
    </Shell>
  );
}
