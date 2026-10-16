/**
 * Nguồn dữ liệu nhà đăng bán cho site public (gọi API backend, chạy được cả phía server lẫn trình duyệt): tìm + lọc + chia trang,
 * điểm ghim bản đồ, thẻ nhỏ theo id, chi tiết theo slug, nhà nổi bật, nhà cùng vùng, slug cho sitemap; đọc / ghi bộ lọc trên URL.
 * Dùng bởi: trang /properties (PropertySearch.tsx, PropertyMap.tsx), /properties/[slug], sections/property-grid, src/app/sitemap.ts.
 * Lưu ý: lọc chạy ở backend (client/properties) nên chịu được dữ liệu lớn; phía server cache 60 giây theo tag "properties".
 * API lỗi thì trả rỗng — không hiện nhà mẫu để tránh đăng nhà đã bán. toProperty đổi dữ liệu API sang kiểu Property của giao diện.
 */
import { ApiError, apiFetch } from "@/api/api-fetch";
import type {
  MapPointResult,
  Property,
  PropertyFilters,
  PropertyPage,
} from "@/types/property";
import { toMediaUrl } from "./cms";

export const PROPERTIES_PER_PAGE = 12;

const PROPERTIES_REVALIDATE_SECONDS = 60;

const PROPERTIES_REQUEST_INIT = {
  next: { revalidate: PROPERTIES_REVALIDATE_SECONDS, tags: ["properties"] },
};

const FILTER_TEXT_KEYS = ["keyword", "area", "type", "price", "beds", "sort", "bounds"] as const;

const EMPTY_PAGE: PropertyPage = {
  data: [],
  meta: { total: 0, page: 1, limit: PROPERTIES_PER_PAGE, totalPages: 1 },
};

type ApiProperty = Omit<
  Property,
  "description" | "featured" | "images" | "amenities" | "listedAt" | "neighborhood" | "typeLabel" | "listingId"
> & {
  description: string | null;
  isFeatured: boolean;
  amenities: string[] | null;
  images: Array<{ src: string; alt?: string }> | null;
  listedAt: string | null;
  neighborhood: string | null;
  typeLabel: string | null;
  listingId: string | null;
};

function toProperty(item: ApiProperty): Property {
  return {
    ...item,
    neighborhood: item.neighborhood ?? undefined,
    typeLabel: item.typeLabel ?? "",
    listingId: item.listingId ?? "",
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    featured: Boolean(item.isFeatured),
    listedAt: item.listedAt ?? "",
    description: (item.description ?? "")
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
    amenities: item.amenities ?? [],
    images: (item.images ?? [])
      .filter((image) => image.src)
      .map((image) => ({ src: toMediaUrl(image.src) ?? image.src, alt: image.alt ?? "" })),
  };
}

type SearchParamSource = Record<string, string | string[] | undefined> | URLSearchParams;

export function filtersFromSearchParams(source: SearchParamSource): PropertyFilters {
  const valueOf = (key: string) => {
    const raw = source instanceof URLSearchParams ? source.get(key) : source[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return value?.trim() || undefined;
  };
  const filters: PropertyFilters = {};
  for (const key of FILTER_TEXT_KEYS) {
    const value = valueOf(key);
    if (value) filters[key] = value;
  }
  const page = Number.parseInt(valueOf("page") ?? "", 10);
  if (page > 1) filters.page = page;
  return filters;
}

export function toPropertyQueryString(filters: PropertyFilters, extra: Record<string, string | number> = {}): string {
  const params = new URLSearchParams();
  for (const key of FILTER_TEXT_KEYS) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  for (const [key, value] of Object.entries(extra)) params.set(key, String(value));
  return params.toString();
}

export async function searchProperties(
  filters: PropertyFilters,
  limit = PROPERTIES_PER_PAGE,
): Promise<PropertyPage> {
  try {
    const result = await apiFetch<{ data: ApiProperty[]; meta: PropertyPage["meta"] }>(
      `client/properties?${toPropertyQueryString(filters, { limit })}`,
      PROPERTIES_REQUEST_INIT,
    );
    return { data: (result?.data ?? []).map(toProperty), meta: result?.meta ?? EMPTY_PAGE.meta };
  } catch {
    return EMPTY_PAGE;
  }
}

export async function getPropertyMapPoints(filters: PropertyFilters): Promise<MapPointResult> {
  try {
    return await apiFetch<MapPointResult>(
      `client/properties/map?${toPropertyQueryString({ ...filters, page: undefined, sort: undefined })}`,
      PROPERTIES_REQUEST_INIT,
    );
  } catch {
    return { total: 0, truncated: false, points: [] };
  }
}

export async function getPropertyCard(id: number): Promise<Property | null> {
  try {
    const item = await apiFetch<ApiProperty | null>(`client/properties/id/${id}`, PROPERTIES_REQUEST_INIT);
    return item ? toProperty(item) : null;
  } catch {
    return null;
  }
}

export async function getProperty(slug: string): Promise<Property | null> {
  try {
    const item = await apiFetch<ApiProperty | null>(
      `client/properties/slug/${encodeURIComponent(slug)}`,
      PROPERTIES_REQUEST_INIT,
    );
    return item ? toProperty(item) : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    return null;
  }
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  try {
    const result = await apiFetch<{ data: ApiProperty[] }>(
      `client/properties?featured=1&sort=manual&limit=${limit}`,
      PROPERTIES_REQUEST_INIT,
    );
    return (result?.data ?? []).map(toProperty);
  } catch {
    return [];
  }
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  try {
    const query = new URLSearchParams({ region: property.region, exclude: property.slug, limit: String(limit) });
    const result = await apiFetch<{ data: ApiProperty[] }>(`client/properties?${query.toString()}`, PROPERTIES_REQUEST_INIT);
    return (result?.data ?? []).map(toProperty);
  } catch {
    return [];
  }
}

export async function getPropertySlugs(): Promise<Array<{ slug: string; updatedAt: string }>> {
  try {
    return (await apiFetch<Array<{ slug: string; updatedAt: string }>>("client/properties/slugs", PROPERTIES_REQUEST_INIT)) ?? [];
  } catch {
    return [];
  }
}
