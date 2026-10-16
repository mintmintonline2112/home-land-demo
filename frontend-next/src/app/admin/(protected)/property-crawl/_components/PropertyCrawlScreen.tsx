'use client';

/**
 * Màn hình crawl Zillow: chọn phạm vi, theo dõi tiến độ, xem nguồn và nhập các nhà được chọn vào CMS.
 * Dùng bởi: property-crawl/page.tsx; checkbox đầu bảng chỉ chọn nhà chưa nhập trong tối đa 50 dòng đang hiển thị.
 * Lưu ý: đổi trang hoặc lượt sẽ bỏ chọn; nhà đã nhập bị khóa, nhập lỗi giữ lựa chọn của trang hiện tại.
 */
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAdminAuth } from '@/app/admin/_auth/AuthProvider';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { adminRoutes } from '@/config/routes';
import { formatUsd, PROPERTY_QUERY_KEY } from '@/app/admin/(protected)/properties/_lib/property.service';
import { CALIFORNIA_CRAWL_URLS, propertyCrawlService } from '../_lib/property-crawl.service';

const STATUS_LABELS = {
  queued: 'Đang chờ', running: 'Đang thu thập', completed: 'Đã xử lý hết URL',
  partial: 'Chưa hoàn tất', failed: 'Không thu thập được', cancelled: 'Đã dừng',
  blocked: 'Nguồn đang chặn / yêu cầu xác minh',
};
const INPUT_CLASS = 'w-full rounded-lg border border-slate-300 bg-white p-3 text-sm';

export function PropertyCrawlScreen() {
  const { hasPermission } = useAdminAuth();
  const queryClient = useQueryClient();
  const [urls, setUrls] = useState('https://www.zillow.com/ca/');
  const [maxPages, setMaxPages] = useState(5);
  const [maxListings, setMaxListings] = useState(200);
  const [startPage, setStartPage] = useState(1);
  const [additionalPages, setAdditionalPages] = useState(5);
  const [additionalListings, setAdditionalListings] = useState(500);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<{ runId: number | null; page: number; ids: number[] }>({ runId: null, page: 1, ids: [] });
  const [importProgress, setImportProgress] = useState<{ processed: number; total: number } | null>(null);
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const canRead = hasPermission('PROPERTY_LIST');
  const canCreate = hasPermission('PROPERTY_CREATE');
  const canImport = canCreate && hasPermission('PROPERTY_UPDATE');
  const runs = useQuery({ queryKey: ['property-crawl'], queryFn: propertyCrawlService.list, enabled: canRead, refetchInterval: 4000 });
  const active = runs.data?.find((run) => run.id === activeId) ?? (activeId === null ? runs.data?.[0] : undefined);
  const items = useQuery({
    queryKey: ['property-crawl-items', active?.id, page, active?.found],
    queryFn: () => propertyCrawlService.items(active!.id, page), enabled: canRead && Boolean(active),
    refetchInterval: active?.status === 'running' || active?.status === 'queued' ? 4000 : false,
  });
  const unimportedTotal = items.data?.unimportedTotal ?? 0;
  const pageItemIds = items.data?.items.filter((item) => !item.propertyId).map((item) => item.id) ?? [];
  const selected = selection.runId === active?.id && selection.page === page ? selection.ids.filter((id) => pageItemIds.includes(id)) : [];
  const allSelected = pageItemIds.length > 0 && pageItemIds.every((id) => selected.includes(id));

  function setSelected(next: number[] | ((current: number[]) => number[])) {
    const runId = active?.id ?? null;
    setSelection((current) => ({ runId, page, ids: (typeof next === 'function' ? next(current.runId === runId && current.page === page ? current.ids : []) : next).filter((id) => pageItemIds.includes(id)) }));
  }

  function selectRun(id: number) { setActiveId(id); setPage(1); setSelection({ runId: id, page: 1, ids: [] }); setImportProgress(null); }

  function handleSelectAll() {
    if (!active || busy || !canImport) return;
    setActiveId(active.id);
    setImportProgress(null);
    setSelected(pageItemIds);
  }

  function changePreviewPage(nextPage: number) {
    setPage(nextPage);
    setSelection({ runId: active?.id ?? null, page: nextPage, ids: [] });
    setImportProgress(null);
  }

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const run = await propertyCrawlService.start({ urls: urls.split(/\r?\n/).map((url) => url.trim()).filter(Boolean), startPage, maxPages, maxListings });
      selectRun(run.id);
      await queryClient.invalidateQueries({ queryKey: ['property-crawl'] });
      toast.success('Đã thêm lượt crawl vào hàng đợi.');
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(false); }
  }

  async function handleCancel() {
    if (!active) return;
    setBusy(true);
    try { await propertyCrawlService.cancel(active.id); await queryClient.invalidateQueries({ queryKey: ['property-crawl'] }); }
    catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(false); }
  }

  async function handleResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active) return;
    setBusy(true);
    try {
      await propertyCrawlService.resume(active.id, { additionalPages, additionalListings });
      await queryClient.invalidateQueries({ queryKey: ['property-crawl'] });
      toast.success('Đã tiếp tục từ mốc đã lưu, giữ nguyên các listing đã thu thập.');
    } catch (error) { toast.error(getErrorMessage(error)); }
    finally { setBusy(false); }
  }

  async function handleImport() {
    if (!active || !selected.length) return;
    const runId = active.id;
    const itemIds = [...selected];
    setActiveId(runId);
    setImportProgress({ processed: 0, total: itemIds.length });
    setBusy(true);
    try {
      const result = await propertyCrawlService.import(runId, itemIds, publish);
      setSelection({ runId, page, ids: [] });
      setImportProgress({ processed: itemIds.length, total: itemIds.length });
      toast.success(`Đã tạo ${result.created}, cập nhật ${result.updated}, bỏ qua ${result.skipped} nhà.`);
    } catch (error) {
      toast.error(`${getErrorMessage(error)} Các nhà trên trang này vẫn được chọn để thử lại.`);
    } finally {
      await queryClient.invalidateQueries({ queryKey: ['property-crawl-items'] });
      await queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEY });
      setBusy(false);
    }
  }

  if (!canRead) return <p>Bạn chưa có quyền xem nhà đăng bán.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-semibold">Thu thập nhà từ Zillow</h1><p className="mt-2 text-sm text-slate-600">Xem trước listing California, kiểm tra nguồn và chọn nhà để nhập vào CMS.</p></div>
        <Link href={adminRoutes.properties.list} className="admin-secondary-button">Nhà đăng bán</Link>
      </div>

      <form onSubmit={handleStart} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Tạo lượt thu thập</h2>
          <button type="button" className="admin-secondary-button" disabled={busy || !canCreate} onClick={() => {
            setUrls(CALIFORNIA_CRAWL_URLS.join('\n')); setStartPage(1); setMaxPages(300); setMaxListings(10000);
          }}>Điền URL 58 county California</button>
        </div>
        <label className="block space-y-2 text-sm font-medium">URL tìm kiếm Zillow, mỗi dòng một URL
          <textarea className={INPUT_CLASS} rows={5} value={urls} required disabled={!canCreate || busy} onChange={(event) => setUrls(event.target.value)} />
        </label>
        <p className="text-sm text-slate-600">Chỉ nhận nhà có địa chỉ California, thuộc loại house, condo hoặc townhouse và đang bán / sắp mở bán. URL toàn bang có thể bị nguồn giới hạn kết quả; chia theo county giúp mở rộng phạm vi nhưng không bảo đảm lấy đủ mọi tin.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">Trang bắt đầu trên Zillow
            <input className={INPUT_CLASS} type="number" required min={1} max={1000} value={startPage} disabled={!canCreate || busy} onChange={(event) => setStartPage(Number(event.target.value))} />
          </label>
          <label className="space-y-2 text-sm font-medium">Số trang thu thập tối đa
            <input className={INPUT_CLASS} type="number" required min={1} max={1000} value={maxPages} disabled={!canCreate || busy} onChange={(event) => setMaxPages(Number(event.target.value))} />
          </label>
          <label className="space-y-2 text-sm font-medium">Giới hạn listing
            <input className={INPUT_CLASS} type="number" required min={1} max={20000} value={maxListings} disabled={!canCreate || busy} onChange={(event) => setMaxListings(Number(event.target.value))} />
          </label>
        </div>
        <p className="text-sm text-slate-600">Ví dụ: bắt đầu trang 1, lấy tối đa 5 trang → trang 1–5 nếu chưa chạm giới hạn listing. Để lấy tiếp lượt cũ, dùng nút Crawl tiếp ở phía dưới.</p>
        <button className="admin-primary-button" disabled={busy || !canCreate} type="submit">{busy ? 'Đang xử lý…' : 'Bắt đầu thu thập'}</button>
      </form>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" aria-label="Lịch sử thu thập">
        <h2 className="text-xl font-semibold">Các lượt gần đây</h2>
        {runs.isLoading && <p role="status">Đang tải lịch sử…</p>}
        {runs.isError && <p role="alert" className="text-red-700">{getErrorMessage(runs.error)}</p>}
        {runs.data?.length === 0 && <p>Chưa có lượt thu thập nào.</p>}
        <div className="flex flex-wrap gap-2">{runs.data?.map((run) => (
          <button key={run.id} type="button" disabled={busy} aria-pressed={active?.id === run.id} onClick={() => selectRun(run.id)} className={`rounded-lg border px-3 py-2 text-sm ${active?.id === run.id ? 'border-slate-800 bg-slate-100' : 'border-slate-200'}`}>
            #{run.id} · {STATUS_LABELS[run.status]} · {run.found} tin
          </button>
        ))}</div>
        {active && <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status">#{active.id}: {STATUS_LABELS[active.status]} · {active.pages}/{active.maxPages} trang nguồn đã xử lý · {active.found} tin hợp lệ · {active.skipped} mục bỏ qua · {active.pendingUrls.length} URL chờ</p>
            {['queued', 'running', 'blocked'].includes(active.status) && <button className="admin-secondary-button" type="button" disabled={busy || !canCreate} onClick={handleCancel}>Dừng lượt này</button>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600" aria-label="Thống kê worker">
            <span>Mục trùng đã bỏ qua: {active.duplicateCount ?? 0}</span>
            <span>Tổng lỗi: {active.failureCount ?? 0}</span>
            <span>Thử lại trang hiện tại: {active.retryCount ?? 0}/3</span>
            {active.lastPageDurationMs > 0 && <span>Trang gần nhất: {(active.lastPageDurationMs / 1000).toFixed(1)} giây</span>}
            {active.lastProcessedAt && <span>Cập nhật gần nhất: {new Date(active.lastProcessedAt).toLocaleString('vi-VN')}</span>}
          </div>
          {active.nextAttemptAt && <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            {active.status === 'queued' ? 'Tự thử lại từ mốc cũ sau' : 'Tạm nghỉ truy cập Zillow đến'} {new Date(active.nextAttemptAt).toLocaleString('vi-VN')}.
            {active.status === 'blocked' && ' Kiểm tra nguồn rồi dùng Crawl tiếp; hệ thống không tự lặp lại trang xác minh.'}
          </p>}
          {active.lastError && <p role="alert" className="break-words text-sm text-red-700">{active.lastErrorCode}: {active.lastError}</p>}
          <div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm" aria-label="Mốc tiếp tục crawl">
            <p><strong>Trang nguồn đã xử lý gần nhất:</strong> {active.checkpoint?.lastPage ?? 'Chưa có'}</p>
            <p><strong>Trang nguồn kế tiếp:</strong> {active.checkpoint?.nextPage ?? (active.pendingUrls.length ? 'Đang tải mốc…' : 'Không còn URL chờ')}</p>
            {active.checkpoint?.nextUrl && <a className="block break-all underline" href={active.checkpoint.nextUrl} target="_blank" rel="noopener noreferrer">{active.checkpoint.nextUrl}</a>}
            <p>Mốc được lưu tự động. Với nhiều county, số trang thuộc URL khu vực kế tiếp, có thể quay về trang 1 của county khác.</p>
          </div>
          {!['queued', 'running'].includes(active.status) && active.pendingUrls.length > 0 && <form onSubmit={handleResume} className="space-y-3 rounded-lg border border-slate-200 p-4">
            <h3 className="text-lg font-semibold">Crawl tiếp từ mốc đã lưu</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Số trang lấy thêm
                <input className={INPUT_CLASS} type="number" required min={1} max={1000} value={additionalPages} disabled={busy || !canCreate} onChange={(event) => setAdditionalPages(Number(event.target.value))} />
              </label>
              <label className="space-y-2 text-sm font-medium">Số listing lấy thêm tối đa
                <input className={INPUT_CLASS} type="number" required min={1} max={20000} value={additionalListings} disabled={busy || !canCreate} onChange={(event) => setAdditionalListings(Number(event.target.value))} />
              </label>
            </div>
            <p className="text-sm text-slate-600">Giữ nguyên tin đã thu thập và đã nhập. Nếu lần trước dừng giữa trang vì đủ listing, hệ thống đọc lại trang đó để lấy các tin còn thiếu, tự bỏ qua mã đã có.</p>
            <button type="submit" className="admin-primary-button" disabled={busy || !canCreate}>{busy ? 'Đang xử lý…' : `Crawl tiếp${active.checkpoint?.nextPage ? ` từ trang ${active.checkpoint.nextPage}` : ''}`}</button>
          </form>}
          {active.messages.map((message, index) => <p key={index} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{message}</p>)}
        </>}
      </section>

      {active && <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5" aria-label="Xem trước listing">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Xem trước · {items.data?.total ?? 0} listing</h2>
          <button type="button" className="admin-primary-button" onClick={handleImport} disabled={busy || !selected.length || !canImport}>{busy && importProgress ? `Đang nhập ${importProgress.processed}/${importProgress.total} nhà…` : `Nhập ${selected.length} nhà đã chọn`}</button>
        </div>
        <div className="flex flex-wrap items-center gap-3" aria-label="Chọn nhà để nhập">
          <button type="button" className="admin-secondary-button" disabled={busy || !canImport || !pageItemIds.length} onClick={handleSelectAll}>Chọn tất cả trên trang này</button>
          <button type="button" className="admin-secondary-button" disabled={busy || !selected.length} onClick={() => setSelected([])}>Bỏ chọn</button>
        </div>
        <p role="status" className="text-sm text-slate-600">Đã chọn {selected.length}/{pageItemIds.length} nhà chưa nhập trên trang này (tối đa 50 dòng). Chuyển trang sẽ bỏ lựa chọn.</p>
        <p className="text-sm text-slate-600">Tổng lượt crawl: {unimportedTotal} chưa nhập · {items.data?.importedTotal ?? 0} đã nhập.</p>
        {items.data && unimportedTotal > 0 && items.data.items.length > 0 && !pageItemIds.length && <p className="rounded-lg bg-slate-50 p-3 text-sm">Các nhà trên trang này đã được nhập. Chuyển sang trang sau để chọn các nhà chưa nhập.</p>}
        {items.data && !unimportedTotal && <p className="rounded-lg bg-slate-50 p-3 text-sm">{items.data.total ? 'Tất cả nhà trong lượt này đã có trong CMS nên không còn nhà mới để chọn. Bấm “Đã nhập” ở từng dòng để xem hoặc sửa nhà.' : 'Chưa có nhà để chọn trong lượt này.'}</p>}
        {importProgress && <p role="status" className="text-sm">Đã xử lý {importProgress.processed}/{importProgress.total} nhà đã chọn.</p>}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} disabled={busy || !canImport} />Hiển thị ngay các nhà mới sau khi nhập</label>
        <p className="text-sm text-slate-600">Mặc định nhà mới được lưu ở trạng thái ẩn để bổ sung mô tả và kiểm tra thông tin. Nhà đã có sẽ cập nhật thông tin nguồn, giữ trạng thái hiển thị, mô tả và cài đặt nổi bật. Ảnh dùng URL nguồn; số ảnh và thông số có thể chưa đầy đủ.</p>
        {items.isLoading && <p role="status">Đang tải listing…</p>}
        {items.isError && <p role="alert" className="text-red-700">{getErrorMessage(items.error)}</p>}
        {!items.isLoading && items.data?.total === 0 && <p>Chưa có listing để xem trước.</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-slate-200">
              <th className="p-3"><input type="checkbox" aria-label="Chọn tất cả nhà chưa nhập trên trang hiện tại" title="Chỉ chọn các nhà chưa nhập trong tối đa 50 dòng đang hiển thị" ref={(element) => { if (element) element.indeterminate = selected.length > 0 && !allSelected; }} disabled={busy || !canImport || !pageItemIds.length} checked={allSelected} onChange={(event) => { if (event.target.checked) handleSelectAll(); else setSelected([]); }} /></th>
              <th className="p-3">Nhà / nguồn</th><th className="p-3">Giá</th><th className="p-3">Thông số</th><th className="p-3">Thu thập lúc</th><th className="p-3">CMS</th>
            </tr></thead>
            <tbody>{items.data?.items.map((item) => <tr key={item.id} className="border-b border-slate-100 align-top">
              <td className="p-3"><input type="checkbox" aria-label={`Chọn ${item.data.title}`} checked={selected.includes(item.id)} disabled={busy || Boolean(item.propertyId) || !canImport} onChange={(event) => setSelected((current) => event.target.checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id))} /></td>
              <td className="min-w-56 p-3"><strong>{item.data.title}</strong><p className="mt-1">{item.data.status} · {item.data.images?.length ?? 0} ảnh</p><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block underline">Xem Zillow · {item.sourceKey}</a></td>
              <td className="whitespace-nowrap p-3">{formatUsd(item.data.price ?? 0)}</td>
              <td className="p-3">{item.data.beds ?? '—'} ngủ · {item.data.baths ?? '—'} tắm<br />{item.data.sqft?.toLocaleString() ?? '—'} sqft</td>
              <td className="whitespace-nowrap p-3">{new Date(item.fetchedAt).toLocaleString('vi-VN')}</td>
              <td className="p-3">{item.propertyId ? <Link className="underline" href={adminRoutes.properties.edit(item.propertyId)}>Đã nhập #{item.propertyId}</Link> : 'Chưa nhập'}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="admin-secondary-button" disabled={busy || page <= 1} onClick={() => changePreviewPage(page - 1)}>Trang trước</button>
          <span>Trang xem trước {page}/{items.data?.totalPages ?? 1}</span>
          <button type="button" className="admin-secondary-button" disabled={busy || !items.data || page >= items.data.totalPages} onClick={() => changePreviewPage(page + 1)}>Trang sau</button>
        </div>
      </section>}
    </div>
  );
}
