/**
 * Font serif nghiêng Playfair Display (next/font/google) dùng làm chữ nhấn trong tiêu đề lớn, cạnh font chính Montserrat.
 * Dùng bởi: app/(site)/home-valuation/page.tsx.
 * Lưu ý: next/font tải font lúc build và tự host, chỉ trang nào import file này mới nạp font; giữ ít weight để nhẹ trang.
 */
import { Playfair_Display } from "next/font/google";

export const accentSerif = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500"],
  display: "swap",
});
