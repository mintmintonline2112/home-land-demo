/**
 * Logo của site: ảnh logo "SEAN TRUONG RE" (biểu tượng toà nhà chữ S + chữ), bản màu cho header nền trắng và bản trắng cho footer nền navy;
 * hoặc ảnh logo admin upload.
 * Dùng bởi: _components/layout/Header.tsx, _components/layout/Footer.tsx.
 * Lưu ý: file logo mặc định ở public/brand/ (tạo từ file gốc trong backend/uploads/brand/). Admin → Cài đặt → Logo có ảnh thì thay logo
 * mặc định ở cả header lẫn footer — ảnh đó phải nhìn rõ trên cả nền trắng và nền navy. Tên thương hiệu (Cài đặt) dùng làm alt.
 */
import Link from "next/link";
import { DEFAULT_BRAND_NAME } from "@/settings/site-settings";
import { siteRoutes } from "@/config/routes";

export type BrandProps = {
  isFooter?: boolean;
  logoUrl?: string | null;
  logoHeight?: number | null;
  brandName?: string | null;
};

const DEFAULT_LOGO = "/brand/sean-truong-re-logo.png";
const DEFAULT_LOGO_LIGHT = "/brand/sean-truong-re-logo-light.png";

export function Brand({ isFooter = false, logoUrl, logoHeight, brandName }: BrandProps) {
  const displayName = brandName?.trim() || DEFAULT_BRAND_NAME;
  const logoSrc = logoUrl || (isFooter ? DEFAULT_LOGO_LIGHT : DEFAULT_LOGO);
  return (
    <Link href={siteRoutes.home} className="inline-flex items-center" aria-label={`${displayName} — home`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="block h-12 w-auto max-w-72 object-contain max-[640px]:h-9.5"
        src={logoSrc}
        alt={displayName}
        style={logoHeight ? { height: logoHeight } : undefined}
      />
    </Link>
  );
}
