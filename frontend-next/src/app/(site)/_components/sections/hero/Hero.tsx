/**
 * Section `hero`: ảnh nền tràn màn hình phủ navy + eyebrow + tiêu đề h1 + đoạn mô tả; bố cục `search` (thêm ô tìm nhà) hoặc `plain` (thêm nút).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.image, imageAlt, imagePosition, ctaLabel/ctaHref, cta2Label/cta2Href và nhãn ô tìm
 * (keywordLabel, keywordPlaceholder, areaLabel, anyAreaLabel, typeLabel, anyTypeLabel, priceLabel, anyPriceLabel, searchLabel).
 * Ô tìm là form GET thuần tới /properties (không cần JS); danh sách khu vực / loại / giá lấy từ config/property-search.ts.
 */
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";
import {
  Cta,
  Head,
  Shell,
  anchorIdOf,
  layoutOf,
  resolveImage,
  textOf,
  type SectionProps,
} from "../_shared";
import { SearchBar } from "./SearchBar";

const LAYOUTS = ["search", "plain"] as const;

export function Hero({ section }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "search");
  const image = textOf(section, "image");
  const id = anchorIdOf(section, "hero");

  if (!section?.heading) return null;

  return (
    <Shell
      id={id}
      tone="dark"
      className="relative isolate flex min-h-[clamp(34rem,72vh,42rem)] items-center py-[clamp(5rem,10vw,8rem)]"
      backdrop={
        image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImage(image)}
              alt={textOf(section, "imageAlt") ?? ""}
              fetchPriority="high"
              className="absolute inset-0 -z-2 h-full w-full object-cover"
              style={{ objectPosition: textOf(section, "imagePosition") ?? "center" }}
            />
            <div aria-hidden="true" className="absolute inset-0 -z-1 bg-navy-900/55" />
          </>
        ) : undefined
      }
    >
      <Head
        section={section}
        level={1}
        light
        className="mb-10 max-w-[46rem] [&_h1]:text-display [&_h1]:font-extrabold [&>div]:text-lg [&>div]:text-light/90"
      />
      {layout === "search" ? (
        <SearchBar
          action={siteRoutes.properties}
          labels={{
            keyword: textOf(section, "keywordLabel"),
            keywordPlaceholder: textOf(section, "keywordPlaceholder"),
            area: textOf(section, "areaLabel"),
            anyArea: textOf(section, "anyAreaLabel"),
            type: textOf(section, "typeLabel"),
            anyType: textOf(section, "anyTypeLabel"),
            price: textOf(section, "priceLabel"),
            anyPrice: textOf(section, "anyPriceLabel"),
            submit: textOf(section, "searchLabel"),
          }}
        />
      ) : (
        <div className={cn("reveal flex flex-wrap justify-center gap-3")}>
          <Cta label={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref")} className="btn btn-light" />
          <Cta label={textOf(section, "cta2Label")} href={textOf(section, "cta2Href")} className="btn btn-ghost" />
        </div>
      )}
    </Shell>
  );
}
