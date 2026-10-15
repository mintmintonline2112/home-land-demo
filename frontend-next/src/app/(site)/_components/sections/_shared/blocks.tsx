/**
 * Khối dựng sẵn cho mọi section: khung (Shell), đầu khối (Head), đoạn intro, ghi chú + nút (Note, Cta).
 * Dùng bởi: mọi section qua _shared/index.ts (và sections/_template).
 * Lưu ý: Shell là <section> duy nhất của một section; Head lo quy tắc ẩn eyebrow toàn site, align="left" không bọc div
 * (cột chứa phải mang `reveal`). `.reveal` / `.reveal-group` thuộc layer effects (thắng class Tailwind): đừng đặt
 * opacity / transform / transition lên chính phần tử đó. Cta không có link thì trỏ về trang Liên hệ.
 */
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";
import {
  Eyebrow,
  SECTION,
  SECTION_DARK,
  SECTION_FLOW,
  SECTION_NOTE,
  SECTION_TINT,
} from "@/app/(site)/_components/ui";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import type { PageSection } from "@/types/cms";
import { toInlineHtml, shouldShowEyebrow, textOf, type SectionTone } from "./data";

const INTRO_TEXT = "max-w-160 text-base text-ink-faint [&_p:last-child]:mb-0";

export function RichIntro({
  html,
  className = INTRO_TEXT,
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html?.trim()) return null;
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}

export function InlineNote({
  text,
  className,
  style,
}: {
  text: string | undefined;
  className: string;
  style?: CSSProperties;
}) {
  if (!text) return null;
  return (
    <p
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: toInlineHtml(text) }}
    />
  );
}

export function Head({
  section,
  light = false,
  intro = true,
  align = "center",
  level = 2,
  className,
}: {
  section?: PageSection | null;
  light?: boolean;
  intro?: boolean;
  align?: "center" | "left";
  level?: 1 | 2;
  className?: string;
}) {
  if (!section?.heading && !section?.subheading && !(intro && section?.content))
    return null;
  const isCentered = align === "center";
  const Heading = level === 1 ? "h1" : "h2";
  const accent = textOf(section, "headingAccent");
  const accentStart =
    accent && section?.heading ? section.heading.lastIndexOf(accent) : -1;
  const Wrapper = isCentered ? "div" : Fragment;
  const wrapperProps = isCentered
    ? {
        className: cn(
          "reveal mx-auto mb-[clamp(2.5rem,5vw,3.5rem)] max-w-216 text-center",
          className,
        ),
      }
    : {};
  return (
    <Wrapper {...wrapperProps}>
      {section?.subheading ? (
        <Eyebrow
          gold={light}
          center={isCentered}
          heading
          show={shouldShowEyebrow(section)}
        >
          {section.subheading}
        </Eyebrow>
      ) : null}
      {section?.heading ? (
        <Heading
          className={cn(
            level === 1 ? "text-h1" : "text-h3",
            light && "text-light",
          )}
        >
          {accentStart >= 0 && accent ? (
            <>
              {section.heading.slice(0, accentStart)}
              <span className="text-gold-400">{accent}</span>
              {section.heading.slice(accentStart + accent.length)}
            </>
          ) : (
            section.heading
          )}
        </Heading>
      ) : null}
      {intro ? (
        <RichIntro
          html={section?.content}
          className={cn(INTRO_TEXT, isCentered && "mx-auto", light && "text-light-soft")}
        />
      ) : null}
    </Wrapper>
  );
}

export function Shell({
  id,
  tone = "plain",
  flow,
  backdrop,
  bleed,
  className,
  containerClassName,
  children,
}: {
  id: string;
  tone?: SectionTone;
  flow?: boolean;
  backdrop?: ReactNode;
  bleed?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        SECTION,
        tone === "dark" && SECTION_DARK,
        tone === "tint" && SECTION_TINT,
        flow && SECTION_FLOW,
        backdrop && "relative isolate overflow-hidden",
        className,
      )}
      id={id}
    >
      {backdrop}
      {bleed ? (
        children
      ) : (
        <div className={cn("site-container", containerClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}

export function Cta({
  label,
  href,
  className = "btn btn-ghost-dark",
  style,
  children,
  trailing,
}: {
  label: string | undefined;
  href: string | undefined;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  trailing?: ReactNode;
}) {
  if (!label) return null;
  return (
    <a href={href || siteRoutes.contact} className={className} style={style}>
      {children}
      {label}
      {trailing}
    </a>
  );
}

export function Note({
  text,
  cta,
  href,
  light = false,
  className,
}: {
  text?: string;
  cta?: string;
  href?: string;
  light?: boolean;
  className?: string;
}) {
  if (!text && !cta) return null;
  return (
    <p
      className={cn(
        SECTION_NOTE,
        "reveal",
        light && "text-light-soft",
        className,
      )}
    >
      {text ? (
        <span dangerouslySetInnerHTML={{ __html: toInlineHtml(text) }} />
      ) : null}
      {text && cta ? <br /> : null}
      <Cta
        label={cta}
        href={href}
        className={light ? "btn btn-light" : "btn btn-ghost-dark"}
        style={light ? undefined : { marginTop: "1rem" }}
      />
    </p>
  );
}
