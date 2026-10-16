/**
 * Trang tìm nhà (/properties) kiểu Zillow: thanh lọc + bản đồ + danh sách (PropertySearch), rồi các section đang bật của trang "properties"
 * trong CMS (nếu có).
 * Dùng bởi: Next.js App Router (route /properties, nhận ?keyword=&area=&type=&price=&beds=&sort=&page=&bounds=); ô tìm ở hero, menu Areas,
 * Footer gửi tới đây.
 * Lưu ý: server render sẵn trang kết quả đầu tiên theo URL (có HTML cho SEO), sau đó PropertySearch tự gọi API khi người dùng lọc / kéo bản đồ.
 * Tiêu đề / SEO lấy từ trang CMS "properties", API lỗi thì dùng bản dự phòng.
 */
import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { getCmsPage } from "@/app/(site)/_lib/cms";
import { getFallbackPage } from "@/app/(site)/_lib/fallback";
import { filtersFromSearchParams, searchProperties } from "@/app/(site)/_lib/properties";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { PropertySearch } from "./_components/PropertySearch";

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

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = filtersFromSearchParams(await searchParams);
  const [cmsPage, initialResult] = await Promise.all([getCmsPage("properties"), searchProperties(filters)]);
  const page = cmsPage ?? getFallbackPage("properties");

  return (
    <>
      <PropertySearch title={page.title} initialFilters={filters} initialResult={initialResult} />
      <PageSections page={page} />
    </>
  );
}
