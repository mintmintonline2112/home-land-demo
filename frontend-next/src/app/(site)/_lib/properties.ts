/**
 * Nguồn dữ liệu nhà đăng bán cho site public: lấy danh sách / một nhà / nhà nổi bật / nhà cùng vùng, lọc theo ô tìm kiếm, sắp xếp.
 * Dùng bởi: sections/property-grid, trang /properties, /properties/[slug], src/app/sitemap.ts.
 * Lưu ý: tạm đọc src/content/demo-properties.json (nhà mẫu của bản demo). Khi backend có module Properties chỉ cần đổi
 * getProperties / getProperty sang apiFetch("client/properties…"), phần lọc giữ nguyên. Định dạng giá / địa chỉ ở property-format.ts.
 */
import demoJson from "@/content/demo-properties.json";
import { KEYWORD_ALIASES } from "@/config/property-search";
import type { Property, PropertyQuery, PropertySort } from "@/types/property";

const DEMO_PROPERTIES = (demoJson as unknown as { properties: Property[] }).properties;

export async function getProperties(): Promise<Property[]> {
  return DEMO_PROPERTIES;
}

export async function getProperty(slug: string): Promise<Property | null> {
  return DEMO_PROPERTIES.find((property) => property.slug === slug) ?? null;
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  return DEMO_PROPERTIES.filter((property) => property.featured).slice(0, limit);
}

export async function getRelatedProperties(property: Property, limit = 3): Promise<Property[]> {
  return DEMO_PROPERTIES.filter(
    (candidate) => candidate.slug !== property.slug && candidate.region === property.region,
  ).slice(0, limit);
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
