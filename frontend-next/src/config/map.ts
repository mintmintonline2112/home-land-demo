/**
 * Cấu hình bản đồ MapLibre của site: link style nền (mặc định OpenFreeMap, miễn phí, không cần key), khung nhìn California ban đầu,
 * font chữ trên bản đồ và màu ghim / cụm theo màu thương hiệu.
 * Dùng bởi: properties/_components/PropertyMap.tsx (bản đồ tìm nhà), properties/_components/LocationMap.tsx (bản đồ trang chi tiết).
 * Lưu ý: đổi nhà cung cấp bản đồ (MapTiler, Stadia, tự host…) bằng biến NEXT_PUBLIC_MAP_STYLE_URL, cần build lại frontend.
 * Màu ở đây là mã cố định (MapLibre không đọc được biến CSS) — đổi màu thương hiệu trong Admin thì sửa tay MAP_COLORS cho khớp.
 * MAP_FONT phải có trong style đang dùng (OpenFreeMap có Noto Sans Regular / Bold / Italic).
 */
export const MAP_STYLE_URL =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron";

export const CALIFORNIA_BOUNDS: [[number, number], [number, number]] = [
  [-124.6, 32.4],
  [-114.1, 42.1],
];

export const MAP_FONT = ["Noto Sans Bold"];

export const MAP_COLORS = {
  pin: "#14335C",
  pinActive: "#C0392B",
  pinBorder: "#FFFFFF",
  cluster: "#0E2A4E",
  clusterBorder: "rgba(255, 255, 255, 0.9)",
} as const;
