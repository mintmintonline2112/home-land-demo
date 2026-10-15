/**
 * Section `profile`: giới thiệu một người (môi giới) — ảnh chân dung có khung lồng bên trái; eyebrow, tên, chức danh, đoạn giới thiệu,
 * danh sách điểm nổi bật 2 cột có dấu tick và 2 nút bên phải.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading (tên), subheading (eyebrow), content (giới thiệu, rich-text), metadata.role, image, imageAlt, highlights (danh sách chuỗi),
 * ctaLabel/ctaHref (nút đặc), cta2Label/cta2Href (nút viền), background.
 */
import { PHOTO_FRAME } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  Icon,
  RichIntro,
  Shell,
  anchorIdOf,
  resolveImage,
  textListOf,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";

export function Profile({ section, index = 0 }: SectionProps) {
  const image = textOf(section, "image");
  const role = textOf(section, "role");
  const highlights = textListOf(section, "highlights");
  const id = anchorIdOf(section, "profile");

  if (!section?.heading) return null;

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <div className="grid items-center gap-[clamp(2rem,5vw,3.5rem)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {image ? (
          <figure
            className={cn(
              PHOTO_FRAME,
              "reveal aspect-[4/5] after:pointer-events-none after:absolute after:inset-3.5 after:border after:border-light/70 after:content-['']",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImage(image)} alt={textOf(section, "imageAlt") ?? section.heading} loading="lazy" />
          </figure>
        ) : null}
        <div className="reveal [&_h2]:mb-3">
          <Head section={section} align="left" intro={false} />
          {role ? <p className="mb-6 text-sm font-bold tracking-md text-ink-faint uppercase">{role}</p> : null}
          <RichIntro
            html={section.content}
            className="mb-7 text-base leading-relaxed text-ink-soft [&_p:last-child]:mb-0"
          />
          {highlights.length > 0 ? (
            <ul className="mb-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-3 text-sm font-semibold text-navy-900">
                  <Icon name="check" className="h-4 w-4 text-navy-700" />
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Cta label={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} className="btn btn-primary" />
            <Cta label={textOf(section, "cta2Label")} href={textOf(section, "cta2Href")} className="btn btn-ghost-dark" />
          </div>
        </div>
      </div>
    </Shell>
  );
}
