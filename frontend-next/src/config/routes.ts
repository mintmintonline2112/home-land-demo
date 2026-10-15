/**
 * Bảng đường dẫn của frontend (adminRoutes, siteRoutes) — nguồn duy nhất cho <Link>, router.push, redirect, sidebar; không hardcode URL nơi khác.
 * Dùng bởi: hầu hết trang và component của app/(site) và app/admin, robots.ts, sitemap.ts.
 * Lưu ý: URL thật do tên thư mục trong src/app quyết định; đổi một segment thì đổi ở đây VÀ đổi tên thư mục tương ứng.
 */
import { createCrudRoutes, joinPath, withHash, withQuery } from '@/utils/route';

export const ADMIN_BASE = '/admin';

const adminPath = (segment: string) => joinPath(ADMIN_BASE, segment);
const adminCrudRoutes = (segment: string) => createCrudRoutes(ADMIN_BASE, segment);

export const adminRoutes = {
  root: ADMIN_BASE,
  login: adminPath('login'),
  dashboard: adminPath('dashboard'),

  blogPosts: adminCrudRoutes('blog-posts'),
  blogCategories: adminCrudRoutes('blog-categories'),
  pages: adminCrudRoutes('pages'),
  pageSections: adminCrudRoutes('page-sections'),
  menus: adminCrudRoutes('menus'),
  library: adminPath('library'),
  properties: adminCrudRoutes('properties'),

  contacts: adminPath('contacts'),
  contactPage: adminPath('contact-page'),

  staffs: adminCrudRoutes('staffs'),
  roles: adminCrudRoutes('roles'),
  permissions: adminPath('permissions'),
  settings: adminPath('settings'),
} as const;

const HOME = '/';
const PROPERTIES = '/properties';
const ABOUT = '/about';
const NEWS = '/news';
const CONTACT = '/contact';

export const siteRoutes = {
  home: HOME,
  homeSection: (anchor: string) => withHash(HOME, anchor),

  properties: PROPERTIES,
  propertiesFiltered: (params: Record<string, string | number | null | undefined>) => withQuery(PROPERTIES, params),
  property: (slug: string) => joinPath(PROPERTIES, slug),

  about: ABOUT,

  news: NEWS,
  newsCategory: (slug: string) => withQuery(NEWS, { category: slug }),
  newsFiltered: (params: Record<string, string | number | null | undefined>) => withQuery(NEWS, params),
  newsPost: (slug: string) => joinPath(NEWS, slug),

  contact: CONTACT,
  contactTopic: (topic: string) => withQuery(CONTACT, { topic }),

  page: (slug: string) => joinPath(slug),
} as const;
