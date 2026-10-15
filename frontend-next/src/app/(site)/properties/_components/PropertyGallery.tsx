"use client";

/**
 * Bộ ảnh của trang chi tiết nhà: ảnh lớn + hàng ảnh nhỏ bên dưới, bấm ảnh nhỏ để đổi ảnh lớn.
 * Dùng bởi: app/(site)/properties/[slug]/page.tsx.
 * Lưu ý: ảnh nhỏ dùng bản thu nhỏ của Unsplash (đổi w=1400 thành w=400) để nhẹ; ảnh upload thường không có tham số đó nên giữ nguyên.
 */
import { useState } from "react";
import type { PropertyImage } from "@/types/property";
import { cn } from "@/utils/cn";

const toThumbnail = (src: string) => src.replace("w=1400", "w=400");

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];
  if (!activeImage) return null;

  return (
    <div>
      <div className="aspect-[16/9] overflow-hidden bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeImage.src} alt={`${title} — ${activeImage.alt}`} className="h-full w-full object-cover" fetchPriority="high" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${image.alt.toLowerCase()} photo`}
              aria-pressed={index === activeIndex}
              className={cn(
                "aspect-[3/2] overflow-hidden border-2 transition-[border-color,opacity] duration-200 ease-brand",
                index === activeIndex ? "border-navy-800" : "border-transparent opacity-75 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={toThumbnail(image.src)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
