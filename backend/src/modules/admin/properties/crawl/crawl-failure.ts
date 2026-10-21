/**
 * Phân loại lỗi nguồn / mạng và tính thời gian thử lại có giới hạn cho worker crawl.
 * Dùng bởi: zillow-download.ts, property-crawl.service.ts và kiểm thử; không tự thử lại trang xác minh.
 */
import axios from 'axios';

export class CrawlFailure extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly blocked = false,
    public readonly retryAfterMs = 0,
  ) { super(message); this.name = 'CrawlFailure'; }
}

export const MAX_PAGE_RETRIES = 3;
export const BLOCKED_FAILURE_CODES = ['HTTP_401', 'HTTP_403', 'HTTP_405', 'HTTP_429', 'HUMAN_VERIFICATION'];

export function retryDelayMs(attempt: number, retryAfterMs = 0): number {
  return Math.max(Math.min(5000 * 3 ** Math.max(0, attempt - 1), 60000), retryAfterMs);
}

export function parseRetryAfter(value: unknown, now = Date.now()): number {
  if (typeof value !== 'string' && typeof value !== 'number') return 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 86400000);
  const date = Date.parse(String(value));
  return Number.isFinite(date) ? Math.min(Math.max(0, date - now), 86400000) : 0;
}

export function classifyCrawlFailure(error: unknown): CrawlFailure {
  if (error instanceof CrawlFailure) return error;
  if (axios.isCancel(error)) return new CrawlFailure('CANCELLED', 'Yêu cầu đã được hủy.');
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  if (['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED', 'ERR_NETWORK', 'ER_LOCK_DEADLOCK', 'ER_LOCK_WAIT_TIMEOUT'].includes(code)) {
    return new CrawlFailure(code, 'Kết nối tạm thời bị gián đoạn; sẽ thử lại từ cùng mốc.', true);
  }
  return new CrawlFailure('SOURCE_FORMAT', error instanceof Error ? error.message : 'Không thể đọc dữ liệu nguồn.');
}
