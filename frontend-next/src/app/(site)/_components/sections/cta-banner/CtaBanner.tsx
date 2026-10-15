/**
 * Section `cta-banner`: băng kêu gọi nền navy chuyển màu, tiêu đề + mô tả bên trái, nút sáng bên phải (VD "Thinking of selling your home?").
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, content, metadata.ctaLabel, ctaHref. Băng đứng sau một section khác nên bỏ đệm trên (pt-0) để không hở gấp đôi.
 * lint-sections-ignore R2: tiêu đề nằm trong băng navy căn trái cạnh nút, không phải đầu khối căn giữa của Head.
 */
import {
  Cta,
  Icon,
  RichIntro,
  Shell,
  anchorIdOf,
  textOf,
  type SectionProps,
} from "../_shared";

export function CtaBanner({ section }: SectionProps) {
  const id = anchorIdOf(section, "cta-banner");

  if (!section?.heading) return null;

  return (
    <Shell id={id} className="pt-0">
      <div className="reveal flex flex-wrap items-center justify-between gap-8 bg-[linear-gradient(120deg,var(--navy-900)_0%,var(--navy-700)_100%)] px-[clamp(1.75rem,5vw,3rem)] py-[clamp(2.25rem,5vw,3.5rem)] text-light">
        <div className="max-w-144 min-w-64 flex-1">
          <h2 className="mb-3 text-h4 text-light">{section.heading}</h2>
          <RichIntro html={section.content} className="text-base text-light/80 [&_p:last-child]:mb-0" />
        </div>
        <Cta
          label={textOf(section, "ctaLabel")}
          href={textOf(section, "ctaHref")}
          className="btn btn-light"
          trailing={<Icon name="arrowRight" />}
        />
      </div>
    </Shell>
  );
}
