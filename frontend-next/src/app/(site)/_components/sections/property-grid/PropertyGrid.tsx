/**
 * Section `property-grid`: lưới thẻ nhà đăng bán (3 cột) có hàng tab lọc theo vùng phía trên và nút xem tất cả phía dưới.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.limit (số thẻ, mặc định 6), allLabel (chữ tab "tất cả"; trống thì ẩn hàng tab),
 * ctaLabel, ctaHref, background. Nhà lấy từ _lib/properties.ts (getFeaturedProperties); nhãn tab vùng lấy từ REGION_LABELS.
 */
import { getFeaturedProperties } from "@/app/(site)/_lib/properties";
import { REGION_LABELS } from "@/config/property-search";
import { siteRoutes } from "@/config/routes";
import {
  Cta,
  Head,
  Icon,
  Shell,
  anchorIdOf,
  metaOf,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";
import { PropertyTabs } from "./PropertyTabs.client";

const DEFAULT_LIMIT = 6;

export async function PropertyGrid({ section, index = 0 }: SectionProps) {
  const limit = Number(metaOf<number | string>(section, "limit")) || DEFAULT_LIMIT;
  const properties = await getFeaturedProperties(limit);
  const id = anchorIdOf(section, "property-grid");

  if (properties.length === 0) return null;

  const regions = [...new Set(properties.map((property) => property.region))];
  const allLabel = textOf(section, "allLabel");
  const ctaLabel = textOf(section, "ctaLabel");

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <Head section={section} />
      <PropertyTabs
        properties={properties}
        allLabel={allLabel}
        tabs={allLabel ? regions.map((region) => ({ value: region, label: REGION_LABELS[region] })) : []}
      />
      {ctaLabel ? (
        <div className="reveal mt-12 text-center">
          <Cta
            label={ctaLabel}
            href={textOf(section, "ctaHref") ?? siteRoutes.properties}
            trailing={<Icon name="arrowRight" />}
          />
        </div>
      ) : null}
    </Shell>
  );
}
