/**
 * Kiểu cấu hình trang Liên hệ (site_settings key `contactPage`, quản trị tại /admin/contact-page) và hàm định dạng hiển thị.
 * Dùng bởi: settings/site-settings.ts, ContactPageScreen.tsx, SettingsScreen.tsx, settings.service.ts.
 * Lưu ý: mọi trường đều tùy chọn, thiếu thì trang dùng mặc định trong code; bản dịch tiếng Việt nằm ngay trong từng nhóm dưới key `vi`.
 */
import type { Lang } from "@/config/i18n";
import type { SocialLinks } from "@/settings/site-settings";

export type ContactInterest = {
  value: string;
  vi?: string;
};

export type ContactPageConfig = {
  hero?: {
    eyebrow?: string;
    title?: string;
    lead?: string;
    vi?: { eyebrow?: string; title?: string; lead?: string };
  };
  social?: SocialLinks;
  company?: {
    name?: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
    mapUrl?: string;
    vi?: { name?: string; location?: string; address?: string };
  };
  form?: {
    enabled?: boolean;
    kicker?: string;
    title?: string;
    interests?: ContactInterest[];
    note?: string;
    vi?: { kicker?: string; title?: string; note?: string };
  };
};

export const DEFAULT_INTERESTS: ContactInterest[] = [
  { value: "Request a quotation", vi: "Yêu cầu báo giá" },
  { value: "Distribution partnership", vi: "Hợp tác phân phối" },
  { value: "Logistics & documentation", vi: "Vận chuyển & chứng từ" },
  { value: "Product specifications", vi: "Thông số sản phẩm" },
  { value: "General inquiry", vi: "Yêu cầu khác" },
];

export function pickLocalizedText<T extends Record<string, unknown>>(
  group: (T & { vi?: Partial<T> }) | undefined,
  key: keyof T & string,
  lang: Lang,
): string {
  const translatedValue = lang === "vi" ? group?.vi?.[key] : undefined;
  const value = (typeof translatedValue === "string" && translatedValue.trim()) || group?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export function interestLabelOf(item: ContactInterest, lang: Lang): string {
  return (lang === "vi" && item.vi?.trim()) || item.value;
}

export function toPhoneDigits(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function toTelHref(phone: string): string {
  return `tel:${toPhoneDigits(phone)}`;
}

export function formatPhone(phone: string): string {
  const trimmed = phone.trim();
  return /^\d{10}$/.test(trimmed) ? `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7)}` : trimmed;
}

export function toDisplayUrl(url: string): string {
  return url
    .replace(/^https?:\/\/(www\.)?/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}
