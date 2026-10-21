/**
 * Thẻ nhà thu gọn nổi trên bản đồ khi bấm một ghim giá: ảnh (+ nhãn Demo), giá, phòng ngủ / tắm / diện tích, tên, địa điểm, nút đóng.
 * Dùng bởi: properties/_components/PropertySearch.tsx.
 * Lưu ý: property null nghĩa là đang tải thẻ (hiện khung chờ); bấm cả thẻ thì mở trang chi tiết nhà.
 */
import Link from "next/link";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { DemoBadge } from "@/app/(site)/_components/ui";
import { formatArea, formatLocation, formatPrice } from "@/app/(site)/_lib/property-format";
import { siteRoutes } from "@/config/routes";
import type { Property } from "@/types/property";

export function MapPreviewCard({ property, onClose }: { property: Property | null; onClose: () => void }) {
  return (
    <div className="absolute bottom-4 left-4 z-10 w-[min(22rem,calc(100%-2rem))] border border-line bg-paper shadow-float">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center border-0 bg-paper/90 text-navy-900 hover:bg-cream"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      {property ? (
        <Link href={siteRoutes.property(property.slug)} className="flex text-inherit hover:text-inherit">
          <div className="relative w-32 shrink-0 bg-cream">
            {property.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={property.images[0].src.replace("w=1400", "w=400")}
                alt={property.images[0].alt}
                className="h-full w-full object-cover"
              />
            ) : null}
            <DemoBadge className="absolute top-2 left-2" />
          </div>
          <div className="min-w-0 flex-1 p-3.5 pr-9">
            <p className="m-0 text-lg font-extrabold text-navy-900">{formatPrice(property.price)}</p>
            <p className="m-0 mb-1.5 text-xs text-ink-soft">
              {property.beds} bd · {property.baths} ba · {formatArea(property.sqft)}
            </p>
            <p className="m-0 truncate text-sm font-bold text-navy-900">{property.title}</p>
            <p className="m-0 flex items-center gap-1 truncate text-xs text-ink-faint">
              <Icon name="pin" className="h-3 w-3" />
              {formatLocation(property)}
            </p>
          </div>
        </Link>
      ) : (
        <div className="h-28 animate-pulse bg-cream" aria-label="Loading" />
      )}
    </div>
  );
}
