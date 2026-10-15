/**
 * Nguồn dữ liệu nhà đăng bán cho site public: lấy danh sách / một nhà / nhà nổi bật / nhà cùng vùng từ API, lọc theo ô tìm kiếm, sắp xếp.
 * Dùng bởi: sections/property-grid, trang /properties, /properties/[slug], src/app/sitemap.ts.
 * Lưu ý: API `client/properties` trả toàn bộ nhà đang hiện (ít nhà nên lọc ngay tại đây), cache 60 giây theo tag "properties"
 * (backend báo revalidate khi admin sửa). API lỗi thì trả rỗng — không hiện nhà mẫu để tránh đăng nhà đã bán.
 * toProperty đổi dữ liệu API (description là văn bản, ảnh có thể là uploads/...) sang kiểu Property của giao diện.
 */
import { ApiError, apiFetch } from "@/api/api-fetch";
import { KEYWORD_ALIASES } from "@/config/property-search";
import type { Property, PropertyQuery, PropertySort } from "@/types/property";
import { toMediaUrl } from "./cms";

const PROPERTIES_REVALIDATE_SECONDS = 60;

const PROPERTIES_REQUEST_INIT = {
  next: { revalidate: PROPERTIES_REVALIDATE_SECONDS, tags: ["properties"] },
};

type ApiProperty = Omit<Property, "description" | "featured" | "images" | "amenities" | "listedAt"> & {
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

export async function getProperties(): Promise<Property[]> {
  try {
    const items = await apiFetch<ApiProperty[]>("client/properties", PROPERTIES_REQUEST_INIT);
    return (items ?? []).map(toProperty);
  } catch {
    return [];
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
  return (await getProperties()).filter((property) => property.featured).slice(0, limit);
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  return (await getProperties())
    .filter((candidate) => candidate.slug !== property.slug && candidate.region === property.region)
    .slice(0, limit);
}

const normalize = (text: string) => text.trim().toLowerCase();

const placeNamesOf = (property: Property) =>
  [property.city, property.neighborhood ?? ""].map(normalize).filter(Boolean);

function matchesPlaces(property: Property, pipeList: string): boolean {
  const places = placeNamesOf(property);
  return pipeList
    .split("|")
    .map(normalize)
    .filter(Boolean)
    .some((name) => places.some((place) => place.includes(name) || name.includes(place)));
}

function matchesKeyword(property: Property, keyword: string): boolean {
  const term = normalize(keyword);
  if (!term) return true;
  const alias = KEYWORD_ALIASES[term];
  if (alias) return matchesPlaces(property, alias);
  const haystack = [
    property.title,
    property.address,
    property.city,
    property.neighborhood ?? "",
    property.zip,
    property.typeLabel,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

function matchesPriceRange(price: number, range: string): boolean {
  const [minText, maxText] = range.replace("+", "-").split("-");
  const min = Number(minText) * 1000;
  const max = maxText ? Number(maxText) * 1000 : Number.POSITIVE_INFINITY;
  return price >= min && price < max;
}

export function filterProperties(properties: Property[], query: PropertyQuery): Property[] {
  return properties.filter(
    (property) =>
      matchesKeyword(property, query.keyword ?? "") &&
      (!query.area || matchesPlaces(property, query.area)) &&
      (!query.type || property.type === query.type) &&
      (!query.price || matchesPriceRange(property.price, query.price)) &&
      (!query.beds || property.beds >= query.beds) &&
      (!query.maxPrice || property.price <= query.maxPrice),
  );
}

export function sortProperties(properties: Property[], sort: PropertySort = "newest"): Property[] {
  const sorted = [...properties];
  if (sort === "price-asc") return sorted.sort((left, right) => left.price - right.price);
  if (sort === "price-desc") return sorted.sort((left, right) => right.price - left.price);
  if (sort === "area-desc") return sorted.sort((left, right) => right.sqft - left.sqft);
  return sorted.sort((left, right) => right.listedAt.localeCompare(left.listedAt));
}
