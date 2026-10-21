/**
 * Kiểm tra phân loại lỗi và lịch retry: không lặp trang chặn, tôn trọng Retry-After và giới hạn backoff.
 * Dùng bởi: npm test -- crawl-failure --runInBand, không cần mạng hoặc database.
 */
import { classifyCrawlFailure, CrawlFailure, parseRetryAfter, retryDelayMs } from './crawl-failure';

describe('Crawl retry policy', () => {
  test('thử lại lỗi kết nối nhưng không coi lỗi cấu trúc là lỗi tạm thời', () => {
    expect(classifyCrawlFailure({ code: 'ECONNRESET' }).retryable).toBe(true);
    expect(classifyCrawlFailure({ code: 'ER_LOCK_DEADLOCK' }).retryable).toBe(true);
    expect(classifyCrawlFailure(new Error('Thiếu JSON')).retryable).toBe(false);
    const blocked = new CrawlFailure('HTTP_429', 'Chặn', false, true, 120000);
    expect(classifyCrawlFailure(blocked)).toBe(blocked);
  });

  test('backoff tăng dần và không chạy sớm hơn Retry-After', () => {
    expect([1, 2, 3].map((attempt) => retryDelayMs(attempt))).toEqual([5000, 15000, 45000]);
    expect(retryDelayMs(1, 120000)).toBe(120000);
    expect(retryDelayMs(100)).toBe(60000);
  });

  test('đọc Retry-After dạng giây hoặc ngày HTTP và chặn giá trị bất hợp lệ', () => {
    const now = Date.UTC(2026, 9, 16);
    expect(parseRetryAfter('120')).toBe(120000);
    expect(parseRetryAfter(new Date(now + 60000).toUTCString(), now)).toBe(60000);
    expect(parseRetryAfter(new Date(now - 60000).toUTCString(), now)).toBe(0);
    expect(parseRetryAfter('invalid')).toBe(0);
    expect(parseRetryAfter('999999999')).toBe(86400000);
  });
});
