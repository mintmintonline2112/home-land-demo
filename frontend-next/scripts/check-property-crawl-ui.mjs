/**
 * Kiểm tra màn hình crawl bằng Chrome/Edge headless qua CDP: preset county, chọn tin và bố cục desktop/mobile.
 * Dùng bởi: node scripts/check-property-crawl-ui.mjs; cần frontend/API local đang chạy và tài khoản seed hoặc CRAWL_CHECK_EMAIL/PASSWORD.
 * Lưu ý: mặc định chỉ đọc; CRAWL_CHECK_SELECTION=1 dùng API mô phỏng để thử chọn tối đa 50 dòng trên từng trang, không ghi dữ liệu thật.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const browser = [process.env.BROWSER_BIN, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((file) => file && fs.existsSync(file));
if (!browser) throw new Error('Cần Chrome hoặc Edge, có thể cấu hình BROWSER_BIN.');
const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), 'property-crawl-ui-'));
const profile = path.join(artifacts, 'profile');
const child = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
let sequence = 0;
const waiting = new Map();
const errors = [];

async function waitFor(check, label) {
  for (let attempt = 0; attempt < 120; attempt++) {
    if (await check()) return;
    await delay(250);
  }
  throw new Error(`Hết thời gian chờ: ${label}`);
}

function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timeout = setTimeout(() => { waiting.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    waiting.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

function installSelectionFixtures() {
  const originalFetch = window.fetch.bind(window);
  const records = Array.from({ length: 125 }, (_, index) => ({
    id: 10001 + index, sourceKey: String(700000 + index), sourceUrl: `https://www.zillow.com/homedetails/fixture/${700000 + index}_zpid/`,
    data: { title: `Selection test ${index + 1}`, price: 1000000, beds: 3, baths: 2, sqft: 1200, status: 'For Sale', images: [] },
    fetchedAt: new Date().toISOString(), propertyId: index < 5 ? 1000 + index : null,
  }));
  const state = { imports: [], failNextImport: true, selectionRequests: 0 };
  window.__crawlSelectionCheck = state;
  const run = { id: 990001, status: 'completed', pages: 3, found: 125, skipped: 0, maxPages: 3, maxListings: 200,
    pendingUrls: [], visitedUrls: ['https://www.zillow.com/ca/'], messages: [], createdAt: new Date().toISOString(),
    retryCount: 0, failureCount: 0, duplicateCount: 0, nextAttemptAt: null, lastErrorCode: null, lastError: null,
    lastProcessedAt: new Date().toISOString(), coverageLimited: false, lastPageDurationMs: 100,
    checkpoint: { lastUrl: 'https://www.zillow.com/ca/', lastPage: 1, nextUrl: null, nextPage: null } };
  const json = (data, status = 200) => new Response(JSON.stringify({ data, message: status >= 400 ? 'Lỗi lô thử nghiệm' : 'Success' }), { status, headers: { 'Content-Type': 'application/json' } });
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!url.pathname.includes('/admin/property-crawl')) return originalFetch(input, init);
    if (url.pathname.endsWith('/selection')) {
      state.selectionRequests++;
      return json(null, 400);
    }
    if (url.pathname.endsWith('/items')) {
      const page = Number(url.searchParams.get('page') || 1);
      const unimportedTotal = records.filter((item) => !item.propertyId).length;
      return json({ items: records.slice((page - 1) * 50, page * 50), total: records.length, unimportedTotal, importedTotal: records.length - unimportedTotal, page, totalPages: 3 });
    }
    if (url.pathname.endsWith('/import')) {
      const body = JSON.parse(init.body);
      state.imports.push(body);
      if (state.failNextImport) { state.failNextImport = false; return json(null, 503); }
      let created = 0;
      for (const item of records) {
        if (body.itemIds.includes(item.id) && !item.propertyId) { item.propertyId = item.id; created++; }
      }
      return json({ created, updated: 0, skipped: body.itemIds.length - created });
    }
    return json([run]);
  };
}

async function checkPageSelection() {
  const clickButton = (text) => evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes(${JSON.stringify(text)})).click()`);
  const selectedCount = (count) => evaluate(`Array.from(document.querySelectorAll('button')).some(button => button.textContent === 'Nhập ${count} nhà đã chọn' && ${count ? '!button.disabled' : 'button.disabled'})`);
  await evaluate(`document.querySelector('thead input[type=checkbox]').click()`);
  await waitFor(() => selectedCount(45), 'chỉ chọn 45 nhà chưa nhập trong 50 dòng trang đầu');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('tbody input:disabled')).length`), 5);
  assert.equal(await evaluate(`document.querySelector('thead input').checked`), true);
  await evaluate(`document.querySelector('tbody input:not(:disabled)').click()`);
  await waitFor(() => selectedCount(44), 'bỏ chọn một nhà');
  assert.equal(await evaluate(`document.querySelector('thead input').indeterminate`), true);
  await clickButton('Chọn tất cả trên trang này');
  await waitFor(() => selectedCount(45), 'chọn lại trang hiện tại');
  await clickButton('Trang sau');
  await waitFor(() => evaluate(`document.querySelector('tbody strong')?.textContent === 'Selection test 51'`), 'trang xem trước thứ hai');
  assert.equal(await selectedCount(0), true);
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('tbody input')).every(input => !input.checked)`), true);
  await evaluate(`document.querySelector('thead input').click()`);
  await waitFor(() => selectedCount(50), 'chọn trang hiện tại');
  await clickButton('Trang trước');
  await waitFor(() => evaluate(`document.querySelector('tbody strong')?.textContent === 'Selection test 1'`), 'trở lại trang đầu');
  assert.equal(await selectedCount(0), true);
  await clickButton('Trang sau');
  await waitFor(() => evaluate(`document.querySelector('tbody strong')?.textContent === 'Selection test 51'`), 'trở lại trang hai');
  assert.equal(await selectedCount(0), true);
  await clickButton('Chọn tất cả trên trang này');
  await waitFor(() => selectedCount(50), 'chuẩn bị nhập đúng 50 dòng đang hiển thị');
  await clickButton('Nhập 50 nhà đã chọn');
  await waitFor(() => evaluate(`document.body.textContent.includes('Các nhà trên trang này vẫn được chọn để thử lại')`), 'báo nhập thất bại');
  await waitFor(() => selectedCount(50), 'giữ lựa chọn trang hiện tại sau lỗi');
  await clickButton('Nhập 50 nhà đã chọn');
  await waitFor(() => selectedCount(0), 'thử lại trang hiện tại');
  assert.deepEqual(await evaluate('window.__crawlSelectionCheck.imports.map(body => body.itemIds.length)'), [50, 50]);
  assert.equal(await evaluate('window.__crawlSelectionCheck.imports.every(body => body.itemIds.every(id => id >= 10051 && id <= 10100))'), true);
  assert.equal(await evaluate('window.__crawlSelectionCheck.imports.some(body => body.itemIds.some(id => id < 10006))'), false);
  await waitFor(() => evaluate(`document.body.textContent.includes('Các nhà trên trang này đã được nhập')`), 'trang hiện tại đã nhập hết dù trang khác còn nhà');
  assert.equal(await evaluate(`document.querySelector('thead input').disabled`), true);
  await clickButton('Trang sau');
  await waitFor(() => evaluate(`document.querySelector('tbody strong')?.textContent === 'Selection test 101'`), 'trang cuối');
  await clickButton('Chọn tất cả trên trang này');
  await waitFor(() => selectedCount(25), 'chọn 25 dòng trang cuối');
  await clickButton('Bỏ chọn');
  await waitFor(() => selectedCount(0), 'bỏ chọn trang hiện tại');
  assert.equal(await evaluate('window.__crawlSelectionCheck.selectionRequests'), 0);
  assert.equal(await evaluate(`document.body.textContent.includes('Chọn tất cả 120 nhà chưa nhập trong lượt này')`), false);
}

try {
  const portFile = path.join(profile, 'DevToolsActivePort');
  await waitFor(() => fs.existsSync(portFile), 'Chrome');
  const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onmessage = (event) => {
    const message = JSON.parse(String(event.data));
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
    const request = waiting.get(message.id);
    if (request) {
      clearTimeout(request.timeout);
      waiting.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result);
    }
  };
  await command('Page.enable');
  await command('Runtime.enable');
  const base = process.env.CRAWL_CHECK_SITE ?? 'http://localhost:3008';
  const api = process.env.CRAWL_CHECK_API ?? 'http://localhost:3016/api';
  await command('Page.navigate', { url: `${base}/admin/login` });
  await waitFor(() => evaluate('Boolean(document.querySelector("input[type=password]"))'), 'trang đăng nhập');
  const credentials = { email: process.env.CRAWL_CHECK_EMAIL ?? 'admin@gmail.com', password: process.env.CRAWL_CHECK_PASSWORD ?? 'admin#123' };
  const loginStatus = await evaluate(`fetch(${JSON.stringify(`${api}/admin/auth/login-staff`)}, {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(${JSON.stringify(credentials)})}).then(response => response.status)`);
  assert.ok([200, 201].includes(loginStatus), 'Đăng nhập bằng tài khoản kiểm thử');
  if (process.env.CRAWL_CHECK_SELECTION === '1') await command('Page.addScriptToEvaluateOnNewDocument', { source: `(${installSelectionFixtures.toString()})()` });
  await command('Page.navigate', { url: `${base}/admin/property-crawl` });
  await waitFor(() => evaluate('Boolean(document.querySelector("textarea"))'), 'màn hình crawl');
  await waitFor(() => evaluate('Boolean(document.querySelector("tbody input[type=checkbox]"))'), 'listing xem trước');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('label')).find(label => label.textContent.includes('Trang bắt đầu trên Zillow')).querySelector('input').value`), '1');
  assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Mốc tiếp tục crawl"]'))`), true);
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Điền URL 58')).click()`);
  assert.equal(await evaluate('document.querySelector("textarea").value.split("\\n").length'), 58);
  const canSelect = await evaluate('Boolean(document.querySelector("tbody input[type=checkbox]:not(:disabled)"))');
  if (canSelect) {
    await evaluate('document.querySelector("tbody input[type=checkbox]:not(:disabled)").click()');
    await waitFor(() => evaluate(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Nhập 1 nhà đã chọn') && !button.disabled)`), 'chọn listing');
  } else {
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('nhà đã chọn')).disabled`), true);
  }
  assert.equal(await evaluate(`Boolean(document.querySelector('[aria-label="Thống kê worker"]'))`), true);
  assert.equal(await evaluate('document.querySelector("input[type=checkbox]").checked'), false, 'Mặc định không xuất bản');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('tbody a')).some(link => link.href.startsWith('https://www.zillow.com/'))`), true);
  if (process.env.CRAWL_CHECK_SELECTION === '1') await checkPageSelection();
  for (const width of [1440, 390]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 });
    if (process.env.CRAWL_CHECK_SELECTION === '1') await evaluate(`document.querySelector('[aria-label="Xem trước listing"]').scrollIntoView({block:'start'})`);
    await delay(500);
    const metrics = await evaluate('({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth})');
    assert.ok(metrics.scroll <= metrics.width + 1, `Không tràn ngang ở ${width}px`);
    const screenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(artifacts, `crawl-${width}.png`), Buffer.from(screenshot.data, 'base64'));
  }
  assert.deepEqual(errors, [], 'Không có lỗi JavaScript');
  const selectionResult = process.env.CRAWL_CHECK_SELECTION === '1'
    ? 'API mô phỏng: chọn riêng 45/50/25 nhà trên từng trang, đổi trang bỏ chọn, chỉ nhập 50 dòng đang hiển thị, giữ lựa chọn sau lỗi'
    : `listing thật, ${canSelect ? 'chọn tin' : 'khóa tin đã nhập'}`;
  console.log(`PASS: đăng nhập, preset 58 county, thống kê worker, ${selectionResult}, mặc định không xuất bản, desktop/mobile. Ảnh: ${artifacts}`);
} finally {
  socket?.close();
  child.kill();
}
