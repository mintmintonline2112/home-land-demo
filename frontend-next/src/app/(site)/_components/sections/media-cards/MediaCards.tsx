/**
 * Section `media-cards`: lưới thẻ ảnh 3 cột, mỗi thẻ là một link (ảnh trên, tên + mô tả ngắn dưới, ô mũi tên bên phải).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title, text, image, alt, credit, href}], note, ctaLabel, ctaHref, background.
 * Thẻ không có href thì vẫn hiện nhưng không bấm được và không có mũi tên. credit = dòng ghi nguồn ảnh (tác giả + giấy phép, bắt buộc với
 * ảnh Wikimedia CC BY / CC BY-SA), hiện chữ nhỏ ở góc dưới ảnh.
 */
import { CARD, CARD_HOVER, PHOTO_FRAME, PHOTO_ZOOM } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Head,
  Icon,
  Note,
  Shell,
  anchorIdOf,
  itemsOf,
  resolveImage,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";

function CardBody({ row }: { row: Record<string, string> }) {
  return (
    <>
      {row.image ? (
        <div className={cn(PHOTO_FRAME, PHOTO_ZOOM, "aspect-[8/5]")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolveImage(row.image)} alt={row.alt ?? row.title ?? ""} loading="lazy" />
          {row.credit ? (
            <span className="absolute right-0 bottom-0 max-w-full truncate bg-navy-900/55 px-2 py-0.5 text-[0.6rem] text-light/85">
              {row.credit}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4 px-5.5 py-5">
        <div>
          {row.title ? <h3 className="mb-1 text-lg font-bold text-navy-900">{row.title}</h3> : null}
          {row.text ? <p className="m-0 text-sm text-ink-faint">{row.text}</p> : null}
        </div>
        {row.href ? (
          <span className="grid h-11 w-11 shrink-0 place-items-center bg-cream text-navy-800 transition-colors duration-200 ease-brand group-hover:bg-navy-800 group-hover:text-light">
            <Icon name="chevronRight" />
          </span>
        ) : null}
      </div>
    </>
  );
}

export function MediaCards({ section, index = 0 }: SectionProps) {
  const rows = itemsOf(section, "items");
  const id = anchorIdOf(section, "media-cards");

  if (rows.length === 0 && !section?.heading) return null;

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <Head section={section} />
      <ul data-stagger="80" className="reveal reveal-group grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => (
          <li key={row.title ?? i}>
            {row.href ? (
              <a href={row.href} className={cn(CARD, CARD_HOVER, "group block h-full text-inherit")}>
                <CardBody row={row} />
              </a>
            ) : (
              <div className={cn(CARD, "h-full")}>
                <CardBody row={row} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <Note text={textOf(section, "note")} cta={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} />
    </Shell>
  );
}
