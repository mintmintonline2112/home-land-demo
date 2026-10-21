/**
 * Khung chung của site public: metadata mặc định, header (menu CMS), nội dung, footer, hiệu ứng, chặn sao chép.
 * Dùng bởi: Next.js App Router (bọc mọi trang trong app/(site)).
 * Lưu ý: font, logo, màu thương hiệu, favicon, SEO, hạn chế sao chép đều đọc từ Admin → Cài đặt; ô trống thì
 * giữ mặc định. Logo /images/... là file tĩnh, ảnh Thư viện (/uploads/...) đi qua toMediaUrl. Site không khai noindex.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/app/(site)/_components/layout/Footer";
import { Header } from "@/app/(site)/_components/layout/Header";
import { CopyGuard } from "@/app/(site)/_components/layout/CopyGuard";
import { SiteEffects } from "@/app/(site)/_components/layout/SiteEffects";
import { buildBrandColorsCss } from "@/settings/brand-colors";
import { toMediaUrl } from "@/app/(site)/_lib/cms";
import { getBlogMenu, getSiteMenu } from "@/app/(site)/_lib/menu";
import {
  faviconHrefOf,
  FONT_STACKS,
  getSiteSettings,
  resolveContact,
} from "@/settings/site-settings";
import {
  DEFAULT_OG_IMAGE,
  resolveSiteSeo,
  SITE_LOCALE,
} from "@/app/(site)/_lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const image = settings.ogImageUrl ?? settings.heroImageUrl ?? DEFAULT_OG_IMAGE;
  const site = resolveSiteSeo(settings);
  return {
    title: { default: site.title, template: `%s — ${site.name}` },
    icons: { icon: faviconHrefOf(settings) },
    description: site.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: SITE_LOCALE,
      title: site.title,
      description: site.description,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [menu, settings, blogMenu] = await Promise.all([getSiteMenu(), getSiteSettings(), getBlogMenu()]);

  const fontStack = settings.fontFamily ? FONT_STACKS[settings.fontFamily] : undefined;

  const logoUrlOf = (path?: string | null) =>
    !path ? null : path.startsWith("/images/") ? path : toMediaUrl(path);
  const brand = {
    logoUrl: logoUrlOf(settings.logoUrl),
    logoHeight: settings.logoHeight ?? null,
    brandName: settings.brandName ?? null,
  };
  const footerBrand = settings.footerLogoUrl
    ? { ...brand, logoUrl: logoUrlOf(settings.footerLogoUrl), logoHeight: settings.footerLogoHeight ?? null }
    : brand;

  const contact = resolveContact(settings);

  const brandCss = buildBrandColorsCss(settings.brandColors);

  return (
    <>
      {fontStack ? (
        <style>{`:root { --font-main: ${fontStack}; }`}</style>
      ) : null}
      {brandCss ? <style>{brandCss}</style> : null}
      {settings.copyProtection !== false ? <CopyGuard /> : null}
      <SiteEffects />
      <Header menu={menu} brand={brand} blogMenu={blogMenu} />
      <main id="main">{children}</main>
      <Footer
        brand={footerBrand}
        contact={contact}
        footerText={settings.footerText ?? null}
        social={settings.socialLinks}
      />
    </>
  );
}
