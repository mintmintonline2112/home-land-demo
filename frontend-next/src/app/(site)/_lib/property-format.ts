/**
 * Định dạng hiển thị của nhà đăng bán: giá đầy đủ / rút gọn, diện tích, địa điểm ngắn, địa chỉ đầy đủ.
 * Dùng bởi: property/PropertyCard.tsx, trang /properties, /properties/[slug], bộ lọc giá.
 * Lưu ý: tách khỏi properties.ts để component client dùng được mà không kéo theo code gọi API phía server.
 */
import type { Property } from "@/types/property";

export const formatPrice = (price: number) =>
  `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const formatShortPrice = (price: number) =>
  price >= 1_000_000 ? `$${(price / 1_000_000).toFixed(1)}M` : `$${Math.round(price / 1000)}k`;

export const formatArea = (sqft: number) => `${sqft.toLocaleString("en-US")} sqft`;

export const formatLocation = (property: Property) =>
  [property.neighborhood, property.city, property.state].filter(Boolean).join(", ");

export const formatFullAddress = (property: Property) =>
  [property.address, property.neighborhood, property.city, [property.state, property.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
