/**
 * Kiểm tra HTTP worker nhận trang xác minh 200, giới hạn truy cập, lỗi nguồn và chuyển hướng ra host lạ.
 * Dùng bởi: npm test -- zillow-download --runInBand, mọi HTTP request được mô phỏng.
 */
import axios from 'axios';
import { downloadZillowHtml } from './zillow-download';

describe('Zillow HTTP download', () => {
  afterEach(() => jest.restoreAllMocks());

  test.each(['<title>Human Verification</title>', '<div id="px-captcha"></div>', 'Press &amp; Hold to confirm you are a human'])('dừng khi trang xác minh trả HTTP 200: %s', async (html) => {
    jest.spyOn(axios, 'get').mockResolvedValue({ status: 200, headers: { 'content-type': 'text/html' }, data: html });
    await expect(downloadZillowHtml('https://www.zillow.com/ca/')).rejects.toMatchObject({ code: 'HUMAN_VERIFICATION', blocked: true, retryable: false });
  });

  test('tôn trọng Retry-After khi HTTP 429 và không tự lặp lại trong downloader', async () => {
    const request = jest.spyOn(axios, 'get').mockResolvedValue({ status: 429, headers: { 'retry-after': '120' } });
    await expect(downloadZillowHtml('https://www.zillow.com/ca/')).rejects.toMatchObject({ code: 'HTTP_429', retryAfterMs: 120000, blocked: true });
    expect(request).toHaveBeenCalledTimes(1);
  });

  test('đánh dấu HTTP 503 là lỗi tạm thời', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({ status: 503, headers: {} });
    await expect(downloadZillowHtml('https://www.zillow.com/ca/')).rejects.toMatchObject({ code: 'HTTP_503', retryable: true });
  });

  test('không tải host ngoài whitelist khi bị chuyển hướng', async () => {
    const request = jest.spyOn(axios, 'get').mockResolvedValue({ status: 302, headers: { location: 'https://127.0.0.1/private' } });
    await expect(downloadZillowHtml('https://www.zillow.com/ca/')).rejects.toThrow();
    expect(request).toHaveBeenCalledTimes(1);
  });

  test('giữ AbortSignal, timeout và giới hạn HTML; không chặn chỉ vì script có chữ captcha', async () => {
    const html = '<html><script>const captchaConfig = { enabled: false };</script></html>';
    const request = jest.spyOn(axios, 'get').mockResolvedValue({ status: 200, headers: { 'content-type': 'text/html' }, data: html });
    const controller = new AbortController();
    await expect(downloadZillowHtml('https://www.zillow.com/ca/', controller.signal)).resolves.toBe(html);
    expect(request).toHaveBeenCalledWith('https://www.zillow.com/ca/', expect.objectContaining({ signal: controller.signal, timeout: 15000, maxRedirects: 0, maxContentLength: 8388608 }));
  });
});
