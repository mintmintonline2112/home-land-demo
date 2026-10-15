/**
 * Registry section: key (kebab-case) = tên thư mục = `metadata._component` = key bảng section_definitions → component; kèm bảng tên cũ LEGACY_COMPONENTS.
 * Dùng bởi: _components/SectionRenderer.tsx; scripts/new-section.mjs và scripts/lint-sections.mjs đọc / sửa file này.
 * Lưu ý: new-section.mjs chèn bằng regex vào khối import, SECTION_COMPONENTS và `export {…}` — giữ đúng định dạng đó.
 * Thêm component = 1 dòng ở đây + 1 entry trong backend section-definition.seed.ts (+ hình trong admin ComponentPicker.tsx).
 * LEGACY_COMPONENTS để trống: database homeland tạo mới, chưa có section nào dùng tên cũ.
 */
import type { ComponentType } from "react";
import type { SectionProps } from "./_shared";

import { Contact } from "./contact/Contact";
import { CtaBanner } from "./cta-banner/CtaBanner";
import { FeatureCards } from "./feature-cards/FeatureCards";
import { Hero } from "./hero/Hero";
import { MediaCards } from "./media-cards/MediaCards";
import { PostCards } from "./post-cards/PostCards";
import { Profile } from "./profile/Profile";
import { PropertyGrid } from "./property-grid/PropertyGrid";
import { Stats } from "./stats/Stats";
import { Testimonials } from "./testimonials/Testimonials";

export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  hero: Hero,
  stats: Stats,
  "property-grid": PropertyGrid,
  "media-cards": MediaCards,
  "feature-cards": FeatureCards,
  "cta-banner": CtaBanner,
  profile: Profile,
  testimonials: Testimonials,
  "post-cards": PostCards,
  contact: Contact,
};

export type LegacyEntry = {
  component: string;
  layout?: string;
  keys?: Record<string, string>;
};

export const LEGACY_COMPONENTS: Record<string, LegacyEntry> = {};

export function resolveComponent(key: string): LegacyEntry | null {
  if (SECTION_COMPONENTS[key]) return { component: key };
  return LEGACY_COMPONENTS[key] ?? null;
}

export {
  Contact,
  CtaBanner,
  FeatureCards,
  Hero,
  MediaCards,
  PostCards,
  Profile,
  PropertyGrid,
  Stats,
  Testimonials,
};
export { GenericBlock } from "./generic-block/GenericBlock";
export type { SectionProps } from "./_shared";
