/**
 * Trang News (/news): chip lọc danh mục, bài nổi bật, lưới bài có phân trang, dải CTA hẹn tư vấn.
 * Dùng bởi: Next.js App Router (route /news, nhận ?category=&page=).
 * Lưu ý: tiêu đề / mô tả / ảnh banner lấy từ trang CMS "news" (trống thì dùng NEWS_DEFAULT_TITLE); ngày đăng + số phút đọc theo Admin → Cài đặt.
 * Class `news-card-thumb` / `news-featured-photo` là móc hiệu ứng GSAP của SiteEffects.tsx.
 */
import type { Metadata } from "next";
import Link from "next/link";
import {
  DemoBadge,
  CtaBand,
  PageHero,
  SECTION,
  SECTION_NOTE,
} from "@/app/(site)/_components/ui";
import { cn } from "@/utils/cn";
import {
  getBlogCategories,
  getBlogPosts,
  getCmsPage,
  toHeroImageUrl,
  toMediaUrl,
} from "@/app/(site)/_lib/cms";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import type { BlogPost } from "@/types/cms";
import { siteRoutes } from "@/config/routes";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("news");
  return buildPageMetadata({
    title: page?.metaTitle ?? NEWS_DEFAULT_TITLE,
    description: page?.metaDescription ?? page?.lead,
    path: siteRoutes.news,
    image: page?.ogImagePath,
    canonical: page?.canonicalUrl,
  });
}

const POSTS_PER_PAGE = 7;

const NEWS_DEFAULT_TITLE = "Market Updates & Guides";

const chipClassName = (isActive: boolean) =>
  cn(
    "inline-block border px-5 py-2 font-main text-base font-medium tracking-xs [transition:background-color_200ms_var(--ease),color_200ms_var(--ease),border-color_200ms_var(--ease),transform_200ms_var(--ease)] hover:border-navy-700 hover:bg-navy-700 hover:text-cream hover:[transform:translateY(-2px)]",
    isActive
      ? "border-navy-700 bg-navy-700 text-cream [transform:translateY(-2px)]"
      : "border-line bg-paper text-ink-soft",
  );

const META_ROW =
  "mb-4 flex flex-wrap items-center gap-3 text-xs tracking-md uppercase";
const CATEGORY_TAG = "border border-current px-3 py-1 font-semibold";

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatReadingTime(post: BlogPost): string {
  const words = post.content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function CoverThumb({ post }: { post: BlogPost }) {
  const src = toMediaUrl(post.coverImagePath);
  if (!src) return null;
  return (
    <div className="news-card-thumb -mx-7 -mt-7 mb-6 aspect-video overflow-hidden border-b border-b-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="block h-full w-full object-cover [transition:transform_400ms_var(--ease)] group-hover:[transform:scale(1.04)] motion-reduce:transition-none"
        src={src}
        alt={post.title}
        loading="lazy"
      />
    </div>
  );
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [cmsPage, settings] = await Promise.all([
    getCmsPage("news"),
    getSiteSettings(),
  ]);
  const showMeta = settings.showPostMeta !== false;
  const authorName = resolveContact(settings).name;
  const categories = (await getBlogCategories()).filter(
    (category) => category.isActive !== false && !category.parentId,
  );
  const activeCategory = params.category
    ? categories.find((category) => category.slug === params.category)
    : undefined;

  const result = await getBlogPosts({
    page: pageNumber,
    limit: POSTS_PER_PAGE,
    categoryId: activeCategory?.id,
  });

  const posts = result?.data ?? [];
  const totalPages = result?.meta.totalPages ?? 1;
  const [featured, ...remainingPosts] =
    pageNumber === 1 && !activeCategory ? posts : [undefined, ...posts];
  const gridPosts = remainingPosts.filter(Boolean) as BlogPost[];

  const buildPageHref = (page: number) =>
    siteRoutes.newsFiltered({
      category: activeCategory?.slug,
      page: page > 1 ? page : undefined,
    });

  return (
    <>
      <PageHero
        title={cmsPage?.title ?? NEWS_DEFAULT_TITLE}
        lead={cmsPage?.lead}
        crumbs={[{ label: cmsPage?.title ?? NEWS_DEFAULT_TITLE }]}
        image={toHeroImageUrl(cmsPage?.heroImagePath)}
        imagePosition={cmsPage?.heroImagePosition}
      />

      <section className={SECTION}>
        <div className="site-container">
          {categories.length > 0 ? (
            <div className="reveal mt-0 mb-4 flex flex-wrap justify-center gap-2">
              <Link href={siteRoutes.news} className={chipClassName(!activeCategory)}>
                All
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={siteRoutes.newsCategory(category.slug)}
                  className={chipClassName(activeCategory?.slug === category.slug)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}

          {featured ? (
            <article className="reveal mb-[clamp(2.5rem,5vw,3.5rem)] grid grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] items-stretch overflow-hidden border border-navy-800 bg-[linear-gradient(170deg,var(--navy-800)_0%,var(--navy-900)_100%)] text-light shadow-lift max-[900px]:grid-cols-1">
              <div className="p-[clamp(2rem,4vw,3rem)]">
                <div className={META_ROW}>
                  <DemoBadge />
                  {featured.category ? (
                    <span className={cn(CATEGORY_TAG, "bg-light text-navy-900")}>
                      {featured.category.name}
                    </span>
                  ) : null}
                  {showMeta ? (
                    <span className="text-light-soft">
                      {formatDate(featured.publishedAt)}
                    </span>
                  ) : null}
                </div>
                <h2 className="text-h3 text-light">
                  <Link
                    href={siteRoutes.newsPost(featured.slug)}
                    className="text-inherit hover:text-light/80"
                  >
                    {featured.title}
                  </Link>
                </h2>
                <p className="text-light-soft">{featured.excerpt}</p>
                <p className="mt-5 border-t border-t-light/20 pt-4 text-sm text-light-soft">
                  {showMeta ? `${formatReadingTime(featured)} · ` : ""}By {authorName}
                </p>
              </div>
              <div className="news-featured-photo relative flex items-center justify-center p-0">
                {toMediaUrl(featured.coverImagePath) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="block h-full min-h-[280px] w-full object-cover"
                    src={toMediaUrl(featured.coverImagePath)!}
                    alt={featured.title}
                  />
                ) : null}
              </div>
            </article>
          ) : null}

          {gridPosts.length > 0 ? (
            <div
              data-stagger="90"
              className="grid grid-cols-3 gap-6 max-[1080px]:grid-cols-2 max-[640px]:grid-cols-1"
            >
              {gridPosts.map((post) => (
                <article
                  className="tilt-card group reveal flex flex-col overflow-hidden border border-line bg-paper px-7 pt-7 pb-6"
                  key={post.id}
                >
                  <Link
                    href={siteRoutes.newsPost(post.slug)}
                    className="flex grow flex-col text-inherit"
                  >
                    <CoverThumb post={post} />
                    <div className={META_ROW}>
                      <DemoBadge />
                      {post.category ? (
                        <span className={cn(CATEGORY_TAG, "text-navy-700")}>
                          {post.category.name}
                        </span>
                      ) : null}
                      {showMeta ? (
                        <span className="text-ink-faint">
                          {formatDate(post.publishedAt)}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-navy-900 transition-[color] duration-200 ease-brand group-hover:text-navy-700">
                      {post.title}
                    </h3>
                    <p className="m-0 grow text-base text-ink-soft">
                      {post.excerpt}
                    </p>
                    {showMeta ? (
                      <p className="m-0 grow border-t border-t-line-soft pt-4 text-base text-ink-soft italic">
                        {formatReadingTime(post)}
                      </p>
                    ) : null}
                  </Link>
                </article>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className={cn(SECTION_NOTE, "reveal")}>
              {result
                ? "No articles published yet — check back soon."
                : "Could not load articles right now — please try again later."}
            </p>
          ) : null}

          {totalPages > 1 ? (
            <nav
              className="reveal mt-[clamp(2rem,4vw,3rem)] flex justify-center gap-2"
              aria-label="Pagination"
            >
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <Link
                    key={page}
                    href={buildPageHref(page)}
                    className={cn(
                      "inline-flex h-[42px] min-w-[42px] items-center justify-center border px-3 font-medium [transition:background-color_200ms_var(--ease),color_200ms_var(--ease),border-color_200ms_var(--ease)] hover:border-navy-700 hover:bg-navy-700 hover:text-cream",
                      page === pageNumber
                        ? "border-navy-700 bg-navy-700 text-cream"
                        : "border-line bg-paper text-ink-soft",
                    )}
                    aria-current={page === pageNumber ? "page" : undefined}
                  >
                    {page}
                  </Link>
                ),
              )}
            </nav>
          ) : null}

        </div>
      </section>

      <CtaBand
        title="Ready to Buy or Sell in California?"
        text="Schedule a free consultation — Sean will walk you through the market, in English or Vietnamese."
      >
        <Link href={siteRoutes.contact} className="btn btn-light">
          Schedule Consultation
        </Link>
        <Link href={siteRoutes.properties} className="btn btn-ghost">
          Browse Listings
        </Link>
      </CtaBand>
    </>
  );
}
