/**
 * Đọc / đặt số trang Zillow trong đường dẫn và searchQueryState, dựng mốc tiếp tục từ hàng đợi đã lưu.
 * Dùng bởi: property-crawl.service.ts và kiểm thử; mốc được tính riêng theo URL, không suy ra từ tổng số trang của nhiều county.
 */
import { validateZillowUrl } from './zillow-parser';

export function zillowPageNumber(input: string): number {
  const url = new URL(validateZillowUrl(input));
  const state = url.searchParams.get('searchQueryState');
  if (state) {
    try {
      const parsed = JSON.parse(state) as { pagination?: { currentPage?: unknown } };
      const page = Number(parsed?.pagination?.currentPage);
      if (Number.isInteger(page) && page > 0) return page;
    } catch {}
  }
  return Number(url.pathname.match(/\/(\d+)_p\/?$/)?.[1] ?? 1);
}

export function withZillowPageNumber(input: string, page: number): string {
  if (!Number.isInteger(page) || page < 1 || page > 1000) throw new Error('Trang bắt đầu phải từ 1 đến 1000.');
  const url = new URL(validateZillowUrl(input));
  url.pathname = url.pathname.replace(/\/\d+_p\/?$/, '/').replace(/\/?$/, '/');
  if (page > 1) url.pathname += `${page}_p/`;
  const state = url.searchParams.get('searchQueryState');
  if (state) {
    const parsed: unknown = JSON.parse(state);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('searchQueryState phải là một object JSON.');
    const query = parsed as Record<string, unknown>;
    query.pagination = { currentPage: page };
    url.searchParams.set('searchQueryState', JSON.stringify(query));
  }
  return url.href;
}
