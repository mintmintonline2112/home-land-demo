/**
 * Thẻ một căn nhà: ảnh + nhãn trạng thái (+ nhãn Demo) + nút yêu thích + giá, tên, địa điểm, dải phòng ngủ / phòng tắm / diện tích.
 * Dùng bởi: sections/property-grid (PropertyTabs.client.tsx), trang /properties, phần "You May Also Like" của /properties/[slug].
 * Lưu ý: chỉ là mảnh hiển thị, nhận dữ liệu Property đã có; không tự gọi API.
 */
import Link from "next/link";
import { CARD, CARD_HOVER, DemoBadge, PHOTO_FRAME, PHOTO_ZOOM } from "@/app/(site)/_components/ui";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { formatArea, formatLocation, formatPrice } from "@/app/(site)/_lib/property-format";
import { siteRoutes } from "@/config/routes";
import type { Property } from "@/types/property";
import { cn } from "@/utils/cn";
import { FavoriteButton } from "./FavoriteButton";

const META_ITEM = "inline-flex items-center gap-1.5";

export function PropertyCard({ property, className }: { property: Property; className?: string }) {
  const href = siteRoutes.property(property.slug);
  const cover = property.images[0];
  return (
    <article className={cn(CARD, CARD_HOVER, "flex h-full flex-col", className)}>
      <div className={cn(PHOTO_FRAME, PHOTO_ZOOM, "aspect-[3/2]")}>
        <Link href={href} tabIndex={-1} aria-hidden="true">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover.src.replace("w=1400", "w=800")} alt={cover.alt} loading="lazy" />
          ) : null}
        </Link>
        <span className="absolute top-3.5 left-3.5 flex items-stretch gap-1.5">
          <span className="bg-navy-800 px-3 py-1.5 text-2xs font-bold tracking-sm text-light uppercase">{property.status}</span>
          <DemoBadge />
        </span>
        <FavoriteButton slug={property.slug} className="absolute top-3.5 right-3.5" />
        <span className="absolute bottom-0 left-3.5 bg-navy-800 px-3.5 py-2 text-lg font-bold text-light">
          {formatPrice(property.price)}
        </span>
      </div>
      <div className="flex-1 px-5 pt-5 pb-4">
        <h3 className="mb-2 text-lg font-bold text-navy-900">
          <Link href={href} className="text-inherit hover:text-navy-600">
            {property.title}
          </Link>
        </h3>
        <p className="m-0 flex items-center gap-1.5 text-sm text-ink-faint">
          <Icon name="pin" className="h-3.5 w-3.5" />
          {formatLocation(property)}
        </p>
      </div>
      <div className="mx-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-line py-4 text-sm font-medium text-ink-soft">
        <span className={META_ITEM}>
          <Icon name="bed" />
          {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
        </span>
        <span className={META_ITEM}>
          <Icon name="bath" />
          {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
        </span>
        <span className={META_ITEM}>
          <Icon name="area" />
          {formatArea(property.sqft)}
        </span>
      </div>
    </article>
  );
}
