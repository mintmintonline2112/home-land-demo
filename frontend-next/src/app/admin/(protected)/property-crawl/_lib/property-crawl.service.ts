/**
 * Gọi API crawl và cung cấp danh sách URL tìm kiếm theo 58 county California.
 * Dùng bởi: PropertyCrawlScreen.tsx; URL county là điểm bắt đầu, không cam kết nguồn trả đủ mọi listing.
 */
import { adminApi } from '@/app/admin/_lib/admin-api';
import type { Property } from '@/app/admin/(protected)/properties/_lib/property.service';

export type CrawlRun = {
  id: number;
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed' | 'cancelled' | 'blocked';
  pages: number;
  found: number;
  skipped: number;
  maxPages: number;
  maxListings: number;
  pendingUrls: string[];
  visitedUrls: string[];
  messages: string[];
  createdAt: string;
  retryCount: number;
  failureCount: number;
  duplicateCount: number;
  nextAttemptAt: string | null;
  lastErrorCode: string | null;
  lastError: string | null;
  lastProcessedAt: string | null;
  coverageLimited: boolean;
  lastPageDurationMs: number;
  checkpoint?: { lastUrl: string | null; lastPage: number | null; nextUrl: string | null; nextPage: number | null };
};

export type CrawlItem = {
  id: number;
  sourceKey: string;
  sourceUrl: string;
  data: Partial<Property>;
  fetchedAt: string;
  propertyId: number | null;
};

export type CrawlItemsPage = { items: CrawlItem[]; total: number; unimportedTotal: number; importedTotal: number; page: number; totalPages: number };

const CALIFORNIA_COUNTIES = [
  'Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa', 'Del Norte',
  'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo', 'Kern', 'Kings', 'Lake',
  'Lassen', 'Los Angeles', 'Madera', 'Marin', 'Mariposa', 'Mendocino', 'Merced', 'Modoc',
  'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange', 'Placer', 'Plumas', 'Riverside',
  'Sacramento', 'San Benito', 'San Bernardino', 'San Diego', 'San Francisco', 'San Joaquin',
  'San Luis Obispo', 'San Mateo', 'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta',
  'Sierra', 'Siskiyou', 'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity',
  'Tulare', 'Tuolumne', 'Ventura', 'Yolo', 'Yuba',
];

export const CALIFORNIA_CRAWL_URLS = CALIFORNIA_COUNTIES.map((county) =>
  `https://www.zillow.com/${county.toLowerCase().replaceAll(' ', '-')}-county-ca/`,
);

const ENDPOINT = 'admin/property-crawl';
export const propertyCrawlService = {
  list: () => adminApi.get<CrawlRun[]>(ENDPOINT),
  start: (input: { urls: string[]; startPage?: number; maxPages: number; maxListings: number }) => adminApi.post<CrawlRun>(ENDPOINT, input),
  resume: (id: number, input: { additionalPages: number; additionalListings: number }) => adminApi.post<CrawlRun>(`${ENDPOINT}/${id}/resume`, input),
  cancel: (id: number) => adminApi.post<CrawlRun>(`${ENDPOINT}/${id}/cancel`),
  items: (id: number, page: number) => adminApi.get<CrawlItemsPage>(`${ENDPOINT}/${id}/items?page=${page}`),
  import: (id: number, itemIds: number[], publish: boolean) =>
    adminApi.post<{ created: number; updated: number; skipped: number }>(`${ENDPOINT}/${id}/import`, { itemIds, publish }),
};
