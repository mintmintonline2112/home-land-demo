/**
 * Render một page-section bằng component trong registry (sections/index.ts), và danh sách section của một trang.
 * Dùng bởi: app/(site)/page.tsx, products/page.tsx, contact/page.tsx, [slug]/page.tsx.
 * Lưu ý: loại component đọc từ metadata._component, thiếu thì theo sectionKey; tên cũ (LEGACY_COMPONENTS) tự gắn
 * layout + đổi key dữ liệu cũ khi section chưa có. Không khớp registry thì dùng GenericBlock. Chỉ render section đang bật.
 */
import { GenericBlock, SECTION_COMPONENTS, resolveComponent } from "@/app/(site)/_components/sections";
import type { CmsPage, PageSection } from "@/types/cms";

export function componentTypeOf(section: PageSection): string {
  const metadata = (section.metadata ?? {}) as Record<string, unknown>;
  return typeof metadata._component === "string" && metadata._component ? metadata._component : section.sectionKey;
}

export function SectionRenderer({ section, index }: { section: PageSection; index: number }) {
  const resolved = resolveComponent(componentTypeOf(section));
  const Component = resolved ? SECTION_COMPONENTS[resolved.component] : undefined;
  if (!resolved || !Component) return <GenericBlock section={section} index={index} />;

  const metadata = { ...((section.metadata ?? {}) as Record<string, unknown>) };
  let hasChanged = false;
  if (resolved.layout && typeof metadata.layout !== "string") {
    metadata.layout = resolved.layout;
    hasChanged = true;
  }
  for (const [legacyKey, currentKey] of Object.entries(resolved.keys ?? {})) {
    if (metadata[currentKey] === undefined && metadata[legacyKey] !== undefined) {
      metadata[currentKey] = metadata[legacyKey];
      hasChanged = true;
    }
  }

  return <Component section={hasChanged ? { ...section, metadata } : section} index={index} />;
}

export function PageSections({ page }: { page: CmsPage }) {
  const sections = (page.sections ?? [])
    .filter((section) => section.isActive !== false)
    .sort((left, right) => left.sortOrder - right.sortOrder);

  return (
    <>
      {sections.map((section, index) => (
        <SectionRenderer key={section.id} section={section} index={index} />
      ))}
    </>
  );
}
