/**
 * Trang tìm nhà (/properties): dải tiêu đề navy + breadcrumb, cột bộ lọc bên trái, đếm kết quả + sắp xếp + lưới thẻ nhà bên phải,
 * rồi các section đang bật của trang "properties" trong CMS (nếu có).
 * Dùng bởi: Next.js App Router (route /properties, nhận ?keyword=&area=&type=&price=&beds=&maxPrice=&sort=); ô tìm ở hero gửi tới đây.
 * Lưu ý: lọc chạy phía server trên danh sách từ _lib/properties.ts; tiêu đề / SEO lấy từ trang CMS "properties", API lỗi thì dùng bản dự phòng.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PropertyCard } from "@/app/(site)/_components/property/PropertyCard";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { PageHero, SECTION } from "@/app/(site)/_components/ui";
import { getCmsPage, toHeroImageUrl } from "@/app/(site)/_lib/cms";
import { getFallbackPage } from "@/app/(site)/_lib/fallback";
import { filterProperties, getProperties, sortProperties } from "@/app/(site)/_lib/properties";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { SORT_OPTIONS } from "@/config/property-search";
import { siteRoutes } from "@/config/routes";
import type { PropertySort } from "@/types/property";
import { PropertyFilters, type PropertyFilterValues } from "./_components/PropertyFilters";
import { SortSelect } from "./_components/SortSelect";

type PropertySearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstValueOf = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

const isPropertySort = (value: string | undefined): value is PropertySort =>
  SORT_OPTIONS.some((option) => option.value === value);

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("properties")) ?? getFallbackPage("properties");
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.properties,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

export default async function PropertiesPage({ searchParams }: { searchParams: PropertySearchParams }) {
  const params = await searchParams;
  const values: PropertyFilterValues = {
    keyword: firstValueOf(params.keyword),
    area: firstValueOf(params.area),
    type: firstValueOf(params.type),
    price: firstValueOf(params.price),
    beds: firstValueOf(params.beds),
    maxPrice: firstValueOf(params.maxPrice),
    sort: firstValueOf(params.sort),
  };
  const sort = isPropertySort(values.sort) ? values.sort : "newest";

  const [cmsPage, allProperties] = await Promise.all([getCmsPage("properties"), getProperties()]);
  const page = cmsPage ?? getFallbackPage("properties");
  const properties = sortProperties(
    filterProperties(allProperties, {
      keyword: values.keyword,
      area: values.area,
      type: values.type,
      price: values.price,
      beds: Number(values.beds) || undefined,
      maxPrice: Number(values.maxPrice) || undefined,
    }),
    sort,
  );

  return (
    <>
      <PageHero
        title={page.title}
        lead={page.lead}
        crumbs={[{ label: page.title }]}
        image={toHeroImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />

      <section className={SECTION}>
        <div className="site-container grid items-start gap-9 lg:grid-cols-[18.75rem_minmax(0,1fr)]">
          <PropertyFilters key={JSON.stringify(values)} values={values} />

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="m-0 text-sm text-ink-faint">
                Showing <strong className="text-navy-900">{properties.length}</strong>{" "}
                {properties.length === 1 ? "home" : "homes"}
              </p>
              <Suspense fallback={null}>
                <SortSelect value={sort} />
              </Suspense>
            </div>

            {properties.length > 0 ? (
              <div data-stagger="70" className="reveal reveal-group grid gap-7 md:grid-cols-2">
                {properties.map((property) => (
                  <div key={property.slug}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-line bg-cream px-6 py-14 text-center">
                <h2 className="mb-2 text-xl font-bold text-navy-900">No homes match your filters</h2>
                <p className="mb-6 text-sm text-ink-faint">Try a different area or price range — or ask Sean about off-market listings.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href={siteRoutes.properties} className="btn btn-ghost-dark">
                    Reset Filters
                  </Link>
                  <Link href={siteRoutes.contactTopic("buy")} className="btn btn-primary">
                    Talk to Sean
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <PageSections page={page} />
    </>
  );
}
