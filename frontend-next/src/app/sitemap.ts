/**
 * Sinh /sitemap.xml: trang tĩnh + từng nhà đăng bán + danh mục tin + toàn bộ bài viết đã đăng (lấy qua mọi trang phân trang của API), cache 1 giờ.
 * Dùng bởi: Next.js App Router (metadata route).
 * Lưu ý: API lỗi / tắt lúc build thì vẫn sinh sitemap chỉ gồm trang tĩnh; ngày hỏng thì dùng thời điểm hiện tại.
 */
import type { MetadataRoute } from "next";
import { getBlogCategories, getBlogPosts } from "@/app/(site)/_lib/cms";
import { getPropertySlugs } from "@/app/(site)/_lib/properties";
import { toAbsoluteUrl } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";

export const revalidate = 3600;

const POSTS_PER_REQUEST = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: toAbsoluteUrl(siteRoutes.home), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: toAbsoluteUrl(siteRoutes.properties), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: toAbsoluteUrl(siteRoutes.about), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: toAbsoluteUrl(siteRoutes.news), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: toAbsoluteUrl(siteRoutes.homeValuation), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: toAbsoluteUrl(siteRoutes.contact), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  let categories: Awaited<ReturnType<typeof getBlogCategories>> = [];
  let posts: Awaited<ReturnType<typeof fetchAllPosts>> = [];
  try {
    [categories, posts] = await Promise.all([getBlogCategories(), fetchAllPosts()]);
  } catch {
    categories = [];
    posts = [];
  }

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((category) => category.isActive !== false)
    .map((category) => ({
      url: toAbsoluteUrl(siteRoutes.newsCategory(category.slug)),
      lastModified: toValidDate(category.updatedAt, now),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: toAbsoluteUrl(siteRoutes.newsPost(post.slug)),
    lastModified: toValidDate(post.updatedAt ?? post.publishedAt, now),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const propertyEntries: MetadataRoute.Sitemap = (await getPropertySlugs()).map((property) => ({
    url: toAbsoluteUrl(siteRoutes.property(property.slug)),
    lastModified: toValidDate(property.updatedAt, now),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...propertyEntries, ...categoryEntries, ...postEntries];
}

function toValidDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function fetchAllPosts() {
  const firstPage = await getBlogPosts({ page: 1, limit: POSTS_PER_REQUEST });
  if (!firstPage) return [];
  const laterPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.meta.totalPages - 1) }, (_, i) =>
      getBlogPosts({ page: i + 2, limit: POSTS_PER_REQUEST }),
    ),
  );
  return [firstPage, ...laterPages].flatMap((page) => page?.data ?? []);
}
