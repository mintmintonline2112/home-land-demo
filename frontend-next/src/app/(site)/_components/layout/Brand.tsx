/**
 * Logo + wordmark của site (ô vuông có hình ngôi nhà + chữ "Sean" đậm "Truong" nhạt), hoặc ảnh logo admin upload.
 * Dùng bởi: _components/layout/Header.tsx, _components/layout/Footer.tsx.
 * Lưu ý: Admin → Cài đặt → Logo có ảnh thì thay hẳn hình + chữ mặc định; `isFooter` là bản trên nền navy. Tên thương hiệu nhập ở
 * Cài đặt có từ 2 chữ trở lên thì chữ đầu đậm, phần còn lại nhạt (giống "SeanTruong" của thiết kế).
 */
import Link from "next/link";
import { DEFAULT_BRAND_NAME } from "@/settings/site-settings";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";

export type BrandProps = {
  isFooter?: boolean;
  logoUrl?: string | null;
  logoHeight?: number | null;
  brandName?: string | null;
};

export function BrandMark({ isFooter = false }: { isFooter?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-9.5 w-9.5 shrink-0 place-items-center",
        isFooter ? "bg-light text-navy-900" : "bg-navy-800 text-light",
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    </span>
  );
}

export function Brand({ isFooter = false, logoUrl, logoHeight, brandName }: BrandProps) {
  const displayName = brandName?.trim() || DEFAULT_BRAND_NAME;
  const [firstWord, ...restWords] = displayName.split(/\s+/);
  return (
    <Link href={siteRoutes.home} className="inline-flex items-center gap-2.5" aria-label={`${displayName} — home`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="block h-10.5 w-auto max-w-65 object-contain"
          src={logoUrl}
          alt={displayName}
          style={logoHeight ? { height: logoHeight } : undefined}
        />
      ) : (
        <>
          <BrandMark isFooter={isFooter} />
          <span className={cn("text-xl font-bold tracking-tight", isFooter ? "text-light" : "text-navy-900")}>
            {firstWord}
            {restWords.length > 0 ? (
              <span className={cn("font-medium", isFooter ? "text-light/55" : "text-ink-faint")}>{restWords.join(" ")}</span>
            ) : null}
          </span>
        </>
      )}
    </Link>
  );
}
