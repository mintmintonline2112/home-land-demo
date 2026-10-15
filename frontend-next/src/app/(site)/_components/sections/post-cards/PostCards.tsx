/**
 * Section `post-cards`: 3 bài blog mới nhất dạng thẻ (ảnh, ngày đăng, tiêu đề, tóm tắt, link đọc tiếp) + nút xem tất cả tuỳ chọn.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.limit (mặc định 3), moreLabel (chữ link trên thẻ), ctaLabel, ctaHref, background.
 * Bài lấy từ API blog (getBlogPosts); API lỗi hoặc chưa có bài thì ẩn cả section.
 */
import Link from "next/link";
import { CARD, CARD_HOVER, PHOTO_FRAME, PHOTO_ZOOM } from "@/app/(site)/_components/ui";
import { getBlogPosts, toMediaUrl } from "@/app/(site)/_lib/cms";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";
import {
  Head,
  Icon,
  Note,
  Shell,
  anchorIdOf,
  metaOf,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";

const DEFAULT_LIMIT = 3;

const formatPostDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : null;

export async function PostCards({ section, index = 0 }: SectionProps) {
  const limit = Number(metaOf<number | string>(section, "limit")) || DEFAULT_LIMIT;
  const result = await getBlogPosts({ limit });
  const posts = result?.data ?? [];
  const moreLabel = textOf(section, "moreLabel");
  const id = anchorIdOf(section, "post-cards");

  if (posts.length === 0) return null;

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <Head section={section} />
      <ul data-stagger="80" className="reveal reveal-group grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const href = siteRoutes.newsPost(post.slug);
          const cover = toMediaUrl(post.coverImagePath);
          const date = formatPostDate(post.publishedAt);
          return (
            <li key={post.id}>
              <article className={cn(CARD, CARD_HOVER, "flex h-full flex-col")}>
                {cover ? (
                  <Link href={href} tabIndex={-1} aria-hidden="true" className={cn(PHOTO_FRAME, PHOTO_ZOOM, "block aspect-[8/5]")}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt="" loading="lazy" />
                  </Link>
                ) : null}
                <div className="flex flex-1 flex-col px-5.5 pt-5 pb-6">
                  {date ? (
                    <span className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-ink-faint">
                      <Icon name="calendar" className="h-3.5 w-3.5" />
                      {date}
                    </span>
                  ) : null}
                  <h3 className="mb-3 text-lg leading-snug font-bold text-navy-900">
                    <Link href={href} className="text-inherit hover:text-navy-600">
                      {post.title}
                    </Link>
                  </h3>
                  {post.excerpt ? <p className="mb-5 text-sm leading-relaxed text-ink-faint">{post.excerpt}</p> : null}
                  {moreLabel ? (
                    <Link href={href} className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-navy-900 hover:text-navy-600">
                      {moreLabel}
                      <Icon name="arrowRight" />
                    </Link>
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
      <Note cta={textOf(section, "ctaLabel")} href={textOf(section, "ctaHref") ?? siteRoutes.news} />
    </Shell>
  );
}
