/**
 * Trang bài viết (/news/<slug>): đầu bài kiểu báo nền sáng (danh mục, ngày, phút đọc, tiêu đề, tóm tắt), ảnh bìa, nội dung, dải CTA.
 * Dùng bởi: Next.js App Router (route /news/[slug]).
 * Lưu ý: nội dung qua sanitizeRichText trước khi render. COVER_FRAME giữ móc `photo-frame` (hiệu ứng cuộn của
 * SiteEffects.tsx) nhưng không có hiệu ứng rê chuột như PHOTO_FRAME. Phút đọc tính 200 từ / phút, tối thiểu 1.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DemoBadge,
  CtaBand,
  SECTION_NOTE,
  SECTION_PHOTO,
} from "@/app/(site)/_components/ui";
import { getBlogPost, toMediaUrl } from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { sanitizeRichText } from "@/app/(site)/_lib/sanitize";
import { getSiteSettings, POST_TITLE_DEFAULT, resolveContact } from "@/settings/site-settings";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  return buildPageMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    path: siteRoutes.newsPost(post.slug),
    image: post.ogImagePath ?? post.coverImagePath,
    canonical: post.canonicalUrl,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const COVER_FRAME =
  "photo-frame relative m-0 overflow-hidden border border-line bg-paper shadow-soft [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover";

function countReadingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPost(slug),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  const cover = toMediaUrl(post.coverImagePath);
  const titleSize =
    settings.postTitleSize && settings.postTitleSize !== POST_TITLE_DEFAULT
      ? `min(${settings.postTitleSize}px, 8.5vw)`
      : undefined;

  return (
    <>
      <header className="border-b border-line-soft bg-[linear-gradient(180deg,var(--cream-2)_0%,var(--cream)_100%)] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2.5rem,5vw,3.5rem)]">
        <div className="site-container max-w-208 text-center">
          <div className="reveal mb-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs tracking-md text-ink-faint uppercase">
            <DemoBadge />
            {post.category ? (
              <Link
                href={siteRoutes.newsFiltered({
                  category: post.category.slug,
                })}
                className="border border-navy-700 px-3 py-1 font-semibold text-navy-700 no-underline transition-colors duration-200 ease-brand hover:bg-navy-700 hover:text-light"
              >
                {post.category.name}
              </Link>
            ) : null}
            {settings.showPostMeta !== false ? (
              <span className="whitespace-nowrap">
                {post.publishedAt ? (
                  <>
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                    <span aria-hidden="true" className="mx-2">
                      ·
                    </span>
                  </>
                ) : null}
                {countReadingMinutes(post.content)} min read
              </span>
            ) : null}
          </div>

          <h1
            data-headline
            className="reveal m-0 text-h1 text-balance text-navy-900"
            style={titleSize ? { fontSize: titleSize } : undefined}
          >
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="reveal mx-auto mt-6 mb-0 max-w-160 text-xl text-ink-soft">
              {post.excerpt}
            </p>
          ) : null}
          <p className="reveal mt-5 mb-0 text-sm text-ink-faint">
            By {resolveContact(settings).name}
          </p>
        </div>
      </header>

      <section className="pt-[clamp(2.5rem,5vw,3.5rem)] pb-(--section-pad)">
        {cover ? (
          <div className="site-container max-w-5xl">
            <figure
              className={cn(
                COVER_FRAME,
                SECTION_PHOTO,
                "reveal max-[640px]:aspect-video",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover} alt={post.title} fetchPriority="high" />
            </figure>
          </div>
        ) : null}

        <div className="site-container max-w-208">
          <article
            className="post-content reveal"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(post.content) }}
          />

          <p className={cn(SECTION_NOTE, "reveal")}>
            <Link href={siteRoutes.news}>← Back to Market Updates &amp; Guides</Link>
          </p>
        </div>
      </section>

      <CtaBand
        title="Have Questions About Your Next Move?"
        text="Sean is happy to talk through your plans — buying, selling, or relocating to California."
      >
        <Link href={siteRoutes.contact} className="btn btn-light">
          Schedule Consultation
        </Link>
        <Link href={siteRoutes.news} className="btn btn-ghost">
          More Articles
        </Link>
      </CtaBand>
    </>
  );
}
