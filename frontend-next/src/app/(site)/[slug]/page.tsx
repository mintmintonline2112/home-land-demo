/**
 * Trang CMS tự do (/<slug>, VD /about): mọi Page admin tạo ngoài các trang chuẩn — dải tiêu đề navy (eyebrow, tiêu đề, lead, ảnh nền nếu có)
 * + breadcrumb, rồi từng section qua SectionRenderer.
 * Dùng bởi: Next.js App Router (route động /[slug]).
 * Lưu ý: slug của trang chuẩn (RESERVED_SLUGS) trả 404, riêng "home" chuyển về "/". API lỗi thì dùng bản dự phòng nếu slug có trong
 * cms-fallback.json (VD about).
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { PageHero, SECTION, SECTION_NOTE } from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import { getCmsPage, toHeroImageUrl } from "@/app/(site)/_lib/cms";
import { findFallbackPage } from "@/app/(site)/_lib/fallback";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

const RESERVED_SLUGS = new Set(["home", "properties", "news", "contact"]);

async function loadPage(slug: string) {
  return (await getCmsPage(slug)) ?? findFallbackPage(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug)) return {};
  const page = await loadPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false } };
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.page(page.slug),
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

export default async function CmsGenericPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug === "home") redirect("/");
  if (RESERVED_SLUGS.has(slug)) notFound();

  const page = await loadPage(slug);
  if (!page) notFound();

  const hasSections = (page.sections ?? []).some((section) => section.isActive !== false);

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        crumbs={[{ label: page.title }]}
        image={toHeroImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />

      <PageSections page={page} />

      {hasSections ? null : (
        <section className={SECTION}>
          <div className="site-container">
            <p className={cn(SECTION_NOTE, "reveal")}>This page has no content yet — add sections in the CMS.</p>
          </div>
        </section>
      )}
    </>
  );
}
