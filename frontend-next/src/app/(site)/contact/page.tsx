/**
 * Trang Contact (/contact): dải tiêu đề navy + breadcrumb, rồi các section đang bật của trang "contact" trong CMS (thường là section contact).
 * Dùng bởi: Next.js App Router (route /contact).
 * Lưu ý: tiêu đề lấy từ Admin → Trang Liên hệ (hero.title), ô trống thì lấy của trang CMS; API lỗi thì dùng bản dự phòng (_lib/fallback.ts).
 * Form đọc ?topic= (buy / sell / valuation) để chọn sẵn chủ đề.
 */
import type { Metadata } from "next";
import { PageSections } from "@/app/(site)/_components/SectionRenderer";
import { PageHero } from "@/app/(site)/_components/ui";
import { getCmsPage, toHeroImageUrl } from "@/app/(site)/_lib/cms";
import { getFallbackPage } from "@/app/(site)/_lib/fallback";
import { getSiteSettings } from "@/settings/site-settings";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getCmsPage("contact")) ?? getFallbackPage("contact");
  return buildPageMetadata({
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? page.lead,
    path: siteRoutes.contact,
    image: page.ogImagePath,
    canonical: page.canonicalUrl,
  });
}

export default async function ContactPage() {
  const [cmsPage, settings] = await Promise.all([getCmsPage("contact"), getSiteSettings()]);
  const page = cmsPage ?? getFallbackPage("contact");
  const hero = settings.contactPage?.hero ?? {};

  return (
    <>
      <PageHero
        title={hero.title?.trim() || page.title}
        lead={hero.lead?.trim() || page.lead}
        crumbs={[{ label: "Contact" }]}
        image={toHeroImageUrl(page.heroImagePath)}
        imagePosition={page.heroImagePosition}
      />

      <PageSections page={page} />
    </>
  );
}
