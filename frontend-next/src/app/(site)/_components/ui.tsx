/**
 * Mảnh giao diện dùng chung toàn site: chuỗi class Tailwind đặt tên (SECTION_*, PHOTO_FRAME, CARD…) + Eyebrow, PageHero, CtaBand, DemoBadge.
 * Dùng bởi: các page.tsx trong app/(site), sections/_shared/blocks.tsx và nhiều section, property-card.tsx, sections/_template.
 * Lưu ý: class móc `photo-frame`, `section-flow`, `eyebrow` không mang style riêng, là điểm bám cho effects.css / SiteEffects.tsx.
 * HIDE_HEADING_EYEBROWS = false: thiết kế homeland hiện eyebrow trên mọi tiêu đề; đổi thành true thì chỉ section tick "Hiện eyebrow" mới hiện.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { SHOW_DEMO_LABELS } from "@/config/demo";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export const SECTION = "py-(--section-pad)";

export const SECTION_TINT = "bg-cream";

export const SECTION_DARK = "bg-navy-900 text-light";

export const SECTION_FLOW =
  "section-flow [.section-flow+&]:pt-0 has-[+.section-flow]:pb-[calc(var(--section-pad)/2)]";

export const SECTION_NOTE = "mx-auto mt-12 mb-0 max-w-160 text-center text-sm text-ink-faint";

export const CARD = "border border-line bg-paper transition-[box-shadow,transform] duration-300 ease-brand";

export const CARD_HOVER = "hover:-translate-y-1 hover:shadow-lift";

export const PHOTO_FRAME =
  "photo-frame relative m-0 overflow-hidden bg-cream [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-brand";

export const PHOTO_ZOOM = "hover:[&_img]:scale-105";

export const SECTION_PHOTO = "mb-[clamp(2rem,4vw,3rem)] aspect-21/9";

export const ICON_TILE =
  "inline-flex h-16 w-16 shrink-0 items-center justify-center bg-cream text-navy-800 [&>svg]:h-7 [&>svg]:w-7";

const HIDE_HEADING_EYEBROWS = false;

export function Eyebrow({
  children,
  gold = false,
  center = false,
  heading = false,
  show = false,
  className,
}: {
  children: ReactNode;
  gold?: boolean;
  center?: boolean;
  heading?: boolean;
  show?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "eyebrow m-0 mb-4 text-xs font-bold tracking-lg uppercase",
        gold ? "text-light/85" : "text-navy-700",
        center && "text-center",
        heading && HIDE_HEADING_EYEBROWS && !show && "hidden",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  if (!SHOW_DEMO_LABELS) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center bg-danger px-2 py-1 text-2xs leading-none font-bold tracking-sm text-light uppercase",
        className,
      )}
    >
      Demo
    </span>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-light/70">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true" className="text-light/40">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="text-light hover:text-light/80">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  image,
  imagePosition,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  image?: string | null;
  imagePosition?: string | null;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-light">
      {image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="absolute inset-0 -z-2 h-full w-full object-cover"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
          <div aria-hidden="true" className="absolute inset-0 -z-1 bg-navy-900/80" />
        </>
      ) : null}
      <div className="site-container py-[clamp(3.5rem,6vw,4.75rem)]">
        {eyebrow ? (
          <Eyebrow gold heading className="reveal">
            {eyebrow}
          </Eyebrow>
        ) : null}
        {title ? (
          <h1 data-headline className="reveal mb-4 text-h1 text-light">
            {title}
          </h1>
        ) : null}
        {lead ? <p className="reveal mb-5 max-w-160 text-lg text-light/80">{lead}</p> : null}
        {crumbs ? (
          <div className="reveal">
            <Breadcrumbs items={[{ label: "Home", href: siteRoutes.home }, ...crumbs]} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CtaBand({
  title,
  text,
  children,
}: {
  title: ReactNode;
  text?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={SECTION}>
      <div className="site-container">
        <div className="reveal flex flex-wrap items-center justify-between gap-8 bg-[linear-gradient(120deg,var(--navy-900)_0%,var(--navy-800)_100%)] px-[clamp(1.75rem,5vw,3rem)] py-[clamp(2.25rem,5vw,3.5rem)] text-light">
          <div className="max-w-144 min-w-64 flex-1">
            <h2 className="mb-3 text-h4 text-light">{title}</h2>
            {text ? <p className="m-0 text-base text-light/80">{text}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
