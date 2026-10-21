/**
 * Tải HTML Zillow có giới hạn dung lượng, timeout, chuyển hướng và nhận diện trang xác minh dù HTTP 200.
 * Dùng bởi: property-crawl.service.ts; mọi chuyển hướng đều kiểm tra lại host, hỗ trợ hủy request bằng AbortSignal.
 */
import axios from 'axios';
import { CrawlFailure, parseRetryAfter } from './crawl-failure';
import { validateZillowUrl } from './zillow-parser';

export async function downloadZillowHtml(input: string, signal?: AbortSignal): Promise<string> {
  let url = validateZillowUrl(input);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const response = await axios.get<string>(url, {
      signal, timeout: 15000, maxRedirects: 0, responseType: 'text', maxContentLength: 8 * 1024 * 1024,
      headers: { Accept: 'text/html', 'User-Agent': 'node' }, validateStatus: () => true,
    });
    if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
      url = validateZillowUrl(new URL(String(response.headers.location), url).href);
      continue;
    }
    const retryAfter = parseRetryAfter(response.headers['retry-after']);
    if ([401, 403, 405, 429].includes(response.status)) {
      throw new CrawlFailure(`HTTP_${response.status}`, `Nguồn chặn yêu cầu (HTTP ${response.status}). Đã giữ mốc trang.`, false, true, Math.max(retryAfter, 60000));
    }
    if ([408, 425, 500, 502, 503, 504].includes(response.status)) {
      throw new CrawlFailure(`HTTP_${response.status}`, `Nguồn tạm thời lỗi HTTP ${response.status}.`, true, false, retryAfter);
    }
    if (response.status !== 200) throw new CrawlFailure(`HTTP_${response.status}`, `Nguồn trả HTTP ${response.status}.`);
    if (!String(response.headers['content-type']).includes('text/html')) throw new CrawlFailure('CONTENT_TYPE', 'Nguồn không trả HTML.');
    const html = response.data;
    if (/<title[^>]*>\s*(?:human verification|access denied|just a moment|robot check)/i.test(html)
      || /press\s*(?:&amp;|&)\s*hold\s+to\s+confirm/i.test(html)
      || /<(?:div|iframe)\b[^>]*\bid\s*=\s*["']px-captcha["']/i.test(html)) {
      throw new CrawlFailure('HUMAN_VERIFICATION', 'Nguồn yêu cầu xác minh người dùng. Đã tạm dừng và giữ mốc trang.', false, true, 60000);
    }
    return html;
  }
  throw new CrawlFailure('REDIRECT_LIMIT', 'Nguồn chuyển hướng quá nhiều lần.');
}
