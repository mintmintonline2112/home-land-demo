/**
 * Ngôn ngữ của site: gốc tiếng Anh (`en`), bản dịch phụ `vi` lưu ở cột translations phía backend, truy vấn qua `?lang=vi`.
 * Dùng bởi: settings/site-settings.ts, settings/contact-page.ts.
 * Lưu ý: site public hiện chỉ render tiếng Anh; file chỉ giữ type / helper tối thiểu.
 */
export const LANGS = ["en", "vi"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const HTML_LANG: Record<Lang, string> = { en: "en", vi: "vi" };
export const INTL_LOCALE: Record<Lang, string> = { en: "en-US", vi: "vi-VN" };

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "vi";
}
