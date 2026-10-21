/**
 * Kiểm tra số trang và URL bắt đầu cho đường dẫn Zillow, kể cả URL có bộ lọc searchQueryState.
 * Dùng bởi: npm test -- zillow --runInBand; không cần mạng hoặc database.
 */
import { withZillowPageNumber, zillowPageNumber } from './zillow-pagination';

describe('Zillow page checkpoint', () => {
  test('đặt trang 6 và đổi trang có sẵn mà không lặp hậu tố', () => {
    expect(withZillowPageNumber('https://www.zillow.com/ca/', 6)).toBe('https://www.zillow.com/ca/6_p/');
    expect(withZillowPageNumber('https://www.zillow.com/ca/2_p/', 6)).toBe('https://www.zillow.com/ca/6_p/');
    expect(withZillowPageNumber('https://www.zillow.com/ca/6_p/', 1)).toBe('https://www.zillow.com/ca/');
    expect(zillowPageNumber('https://www.zillow.com/ca/6_p/')).toBe(6);
    expect(zillowPageNumber('https://www.zillow.com/ca/')).toBe(1);
  });

  test('giữ bộ lọc và cập nhật cả trang trong searchQueryState', () => {
    const query = { filterState: { beds: { min: 3 } }, pagination: { currentPage: 2 } };
    const input = `https://www.zillow.com/ca/2_p/?searchQueryState=${encodeURIComponent(JSON.stringify(query))}`;
    const url = new URL(withZillowPageNumber(input, 6));
    const result = JSON.parse(url.searchParams.get('searchQueryState')!);
    expect(result.filterState).toEqual(query.filterState);
    expect(result.pagination.currentPage).toBe(6);
    expect(zillowPageNumber(url.href)).toBe(6);
  });

  test('từ chối trang và bộ lọc không hợp lệ', () => {
    expect(() => withZillowPageNumber('https://www.zillow.com/ca/', 0)).toThrow();
    expect(() => withZillowPageNumber('https://www.zillow.com/ca/', 1.5)).toThrow();
    expect(() => withZillowPageNumber('https://www.zillow.com/ca/?searchQueryState=invalid', 6)).toThrow();
    expect(() => withZillowPageNumber('https://www.zillow.com/ca/?searchQueryState=null', 6)).toThrow();
  });
});
