"use client";

/**
 * Menu thả xuống "Blogs" trên header: cột trái là các tab danh mục bài viết (All Posts + từng danh mục), cột phải là 3 bài mới nhất
 * của tab đang chọn (ảnh, ngày, tiêu đề) và link xem tất cả; rê chuột lên tab là đổi bài.
 * Dùng bởi: _components/layout/Header.tsx (mục menu trỏ tới trang blog /news).
 * Lưu ý: danh mục + bài lấy sẵn ở app/(site)/layout.tsx (getBlogMenu) rồi truyền xuống, menu không tự gọi API. Dưới 1100px chỉ hiện
 * danh sách tab dạng link (không có ảnh bài) cho gọn menu mobile.
 */
import Link from "next/link";
import { useState } from "react";
import { DemoBadge } from "@/app/(site)/_components/ui";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export type BlogMenuCategory = { slug: string; name: string };

export type BlogMenuPost = {
  slug: string;
  title: string;
  coverUrl: string | null;
  publishedAt: string | null;
  categorySlug: string | null;
};

export type BlogMenuData = { categories: BlogMenuCategory[]; posts: BlogMenuPost[] };

const ALL_TAB = "";
const POSTS_PER_TAB = 3;

const formatPostDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "";

export function BlogMenuPanel({ data, onNavigate }: { data: BlogMenuData; onNavigate: () => void }) {
  const [activeSlug, setActiveSlug] = useState(ALL_TAB);
  const tabs = [{ slug: ALL_TAB, name: "All Posts" }, ...data.categories];
  const visiblePosts = data.posts
    .filter((post) => activeSlug === ALL_TAB || post.categorySlug === activeSlug)
    .slice(0, POSTS_PER_TAB);
  const activeHref = activeSlug ? siteRoutes.newsCategory(activeSlug) : siteRoutes.news;
  const activeName = tabs.find((tab) => tab.slug === activeSlug)?.name ?? "All Posts";

  return (
    <div className="flex w-176 border border-line bg-paper shadow-float max-[1100px]:block max-[1100px]:w-full max-[1100px]:border-0 max-[1100px]:shadow-none">
      <ul role="tablist" aria-label="Blog categories" className="w-52 shrink-0 border-r border-line bg-cream py-3 max-[1100px]:w-full max-[1100px]:border-0 max-[1100px]:bg-transparent max-[1100px]:py-0">
        {tabs.map((tab) => (
          <li key={tab.slug || "all"}>
            <Link
              href={tab.slug ? siteRoutes.newsCategory(tab.slug) : siteRoutes.news}
              role="tab"
              aria-selected={activeSlug === tab.slug}
              onMouseEnter={() => setActiveSlug(tab.slug)}
              onFocus={() => setActiveSlug(tab.slug)}
              onClick={onNavigate}
              className={cn(
                "flex items-center justify-between px-5 py-2.5 text-sm transition-colors duration-150 ease-brand max-[1100px]:px-3 max-[1100px]:py-2",
                activeSlug === tab.slug
                  ? "bg-paper font-semibold text-navy-900 max-[1100px]:bg-transparent"
                  : "text-ink-soft hover:text-navy-900",
              )}
            >
              {tab.name}
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 max-[1100px]:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      <div role="tabpanel" className="min-w-0 flex-1 p-5 max-[1100px]:hidden">
        {visiblePosts.length > 0 ? (
          <ul className="grid gap-4">
            {visiblePosts.map((post) => (
              <li key={post.slug}>
                <Link href={siteRoutes.newsPost(post.slug)} onClick={onNavigate} className="group flex gap-4 text-inherit">
                  <span className="relative block h-16 w-24 shrink-0 overflow-hidden bg-cream">
                    {post.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.coverUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-brand group-hover:scale-105"
                      />
                    ) : null}
                    <DemoBadge className="absolute top-1 left-1 px-1.5 py-0.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="mb-1 block text-xs text-ink-faint">{formatPostDate(post.publishedAt)}</span>
                    <span className="line-clamp-2 text-sm leading-snug font-bold text-navy-900 group-hover:text-navy-600">
                      {post.title}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-0 py-6 text-sm text-ink-faint">No posts in this category yet.</p>
        )}
        <Link
          href={activeHref}
          onClick={onNavigate}
          className="mt-5 inline-flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-navy-800 hover:text-navy-600"
        >
          View all {activeName === "All Posts" ? "posts" : activeName}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
