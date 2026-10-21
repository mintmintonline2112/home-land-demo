"use client";

/**
 * Màn tìm nhà kiểu Zillow: thanh lọc ngang, bên trái bản đồ (cụm + ghim giá), bên phải danh sách thẻ nhà có sắp xếp và chia trang.
 * Kéo / zoom bản đồ thì danh sách lọc theo khung đang xem (tắt được bằng ô "Search as I move the map"); rê chuột lên thẻ thì ghim nổi màu.
 * Dùng bởi: app/(site)/properties/page.tsx (trang server truyền bộ lọc từ URL + trang kết quả đầu tiên để có HTML sẵn cho SEO).
 * Lưu ý: bộ lọc được ghi lại lên URL bằng history.replaceState (không tải lại trang). Điểm bản đồ chỉ tải lại khi đổi bộ lọc,
 * trừ khi backend báo truncated (quá nhiều nhà) thì tải theo khung bản đồ mỗi lần di chuyển. Dưới 1024px bản đồ và danh sách
 * chuyển qua lại bằng nút nổi Map / List. Lọc giá Luxury (từ $5M) thì tiêu đề đổi thành "Luxury Homes".
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { PropertyCard } from "@/app/(site)/_components/property/PropertyCard";
import {
  getPropertyCard,
  getPropertyMapPoints,
  searchProperties,
  toPropertyQueryString,
} from "@/app/(site)/_lib/properties";
import { LUXURY_PRICE_RANGE, SORT_OPTIONS } from "@/config/property-search";
import { siteRoutes } from "@/config/routes";
import type { MapPoint, Property, PropertyFilters, PropertyPage } from "@/types/property";
import { cn } from "@/utils/cn";
import { MapPreviewCard } from "./MapPreviewCard";
import { PropertyFilterBar } from "./PropertyFilterBar";
import { PropertyMap } from "./PropertyMap";

const PAGE_WINDOW = 2;

function pageNumbersOf(currentPage: number, totalPages: number): Array<number | "gap"> {
  const pages: Array<number | "gap"> = [];
  for (let page = 1; page <= totalPages; page++) {
    const isEdge = page === 1 || page === totalPages;
    const isNear = Math.abs(page - currentPage) <= PAGE_WINDOW;
    if (isEdge || isNear) pages.push(page);
    else if (pages[pages.length - 1] !== "gap") pages.push("gap");
  }
  return pages;
}

function ResultPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const buttonClass = "inline-flex h-10 min-w-10 items-center justify-center border px-3 text-sm font-semibold";
  return (
    <nav className="mt-8 flex flex-wrap justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={cn(buttonClass, "border-line bg-paper text-navy-900 disabled:opacity-40")}
        aria-label="Previous page"
      >
        ‹
      </button>
      {pageNumbersOf(currentPage, totalPages).map((page, i) =>
        page === "gap" ? (
          <span key={`gap-${i}`} className="inline-flex h-10 items-center px-1 text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              buttonClass,
              page === currentPage
                ? "border-navy-800 bg-navy-800 text-light"
                : "border-line bg-paper text-navy-900 hover:border-navy-800",
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={cn(buttonClass, "border-line bg-paper text-navy-900 disabled:opacity-40")}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

export function PropertySearch({
  title,
  initialFilters,
  initialResult,
}: {
  title: string;
  initialFilters: PropertyFilters;
  initialResult: PropertyPage;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [result, setResult] = useState(initialResult);
  const [isLoading, setIsLoading] = useState(false);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [isPointsTruncated, setIsPointsTruncated] = useState(false);
  const [fitKey, setFitKey] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSearchingOnMove, setIsSearchingOnMove] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [initialBounds] = useState(initialFilters.bounds);
  const listRef = useRef<HTMLDivElement>(null);
  const isFirstListLoad = useRef(true);

  const pointFilters = useMemo(
    () => ({
      keyword: filters.keyword,
      area: filters.area,
      type: filters.type,
      price: filters.price,
      beds: filters.beds,
    }),
    [filters.keyword, filters.area, filters.type, filters.price, filters.beds],
  );

  useEffect(() => {
    let isCancelled = false;
    getPropertyMapPoints(pointFilters).then((mapResult) => {
      if (isCancelled) return;
      setPoints(mapResult.points);
      setIsPointsTruncated(mapResult.truncated);
    });
    return () => {
      isCancelled = true;
    };
  }, [pointFilters]);

  useEffect(() => {
    const query = toPropertyQueryString(filters);
    window.history.replaceState(null, "", query ? `${siteRoutes.properties}?${query}` : siteRoutes.properties);
    if (isFirstListLoad.current) {
      isFirstListLoad.current = false;
      return;
    }
    let isCancelled = false;
    setIsLoading(true);
    searchProperties(filters)
      .then((page) => {
        if (!isCancelled) setResult(page);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [filters]);

  useEffect(() => {
    if (selectedId === null) {
      setSelectedProperty(null);
      return;
    }
    const listedProperty = result.data.find((property) => property.id === selectedId);
    if (listedProperty) {
      setSelectedProperty(listedProperty);
      return;
    }
    let isCancelled = false;
    setSelectedProperty(null);
    getPropertyCard(selectedId).then((property) => {
      if (!isCancelled) setSelectedProperty(property);
    });
    return () => {
      isCancelled = true;
    };
  }, [selectedId, result.data]);

  function applyFilterChanges(changes: Partial<PropertyFilters>) {
    setFilters((current) => ({ ...current, ...changes, bounds: undefined, page: undefined }));
    setSelectedId(null);
    setFitKey((key) => key + 1);
  }

  function handleReset() {
    setFilters({ sort: filters.sort });
    setSelectedId(null);
    setFitKey((key) => key + 1);
  }

  function handleBoundsChange(bounds: string) {
    if (isPointsTruncated) {
      getPropertyMapPoints({ ...pointFilters, bounds }).then((mapResult) => setPoints(mapResult.points));
    }
    if (!isSearchingOnMove) return;
    setFilters((current) => ({ ...current, bounds, page: undefined }));
  }

  function handleSearchOnMoveChange(isChecked: boolean) {
    setIsSearchingOnMove(isChecked);
    if (!isChecked) setFilters((current) => ({ ...current, bounds: undefined, page: undefined }));
  }

  function handlePageChange(page: number) {
    setFilters((current) => ({ ...current, page: page > 1 ? page : undefined }));
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (window.matchMedia("(max-width: 1023px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeIds = [hoveredId, selectedId].filter((id): id is number => id !== null);
  const total = result.meta.total;

  return (
    <section className="flex flex-col lg:h-[calc(100dvh-var(--header-height)-1px)]">
      <div className="shrink-0 border-b border-line bg-paper px-4 py-3 sm:px-6">
        <PropertyFilterBar filters={filters} onChange={applyFilterChanges} onReset={handleReset} />
      </div>

      <div className="relative flex-1 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,47rem)]">
        <div
          className={cn(
            "relative h-[calc(100dvh-var(--header-height)-4.5rem)] bg-cream lg:block lg:h-full",
            mobileView === "map" ? "block" : "hidden",
          )}
        >
          <PropertyMap
            points={points}
            fitKey={fitKey}
            initialBounds={initialBounds}
            activeIds={activeIds}
            isVisible={mobileView === "map"}
            onBoundsChange={handleBoundsChange}
            onSelect={setSelectedId}
          />
          <label className="absolute top-3 left-3 z-10 flex cursor-pointer items-center gap-2 border border-line bg-paper px-3 py-2 text-xs font-semibold text-navy-900 shadow-soft">
            <input
              type="checkbox"
              checked={isSearchingOnMove}
              onChange={(event) => handleSearchOnMoveChange(event.target.checked)}
              className="accent-navy-800"
            />
            Search as I move the map
          </label>
          {selectedId !== null ? (
            <MapPreviewCard property={selectedProperty} onClose={() => setSelectedId(null)} />
          ) : null}
        </div>

        <div
          ref={listRef}
          className={cn(
            "px-4 py-6 sm:px-6 lg:block lg:overflow-y-auto",
            mobileView === "list" ? "block" : "hidden",
          )}
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-navy-900">{filters.price === LUXURY_PRICE_RANGE ? "Luxury Homes" : title}</h1>
              <p className="m-0 text-sm text-ink-faint">
                <strong className="text-navy-900">{total.toLocaleString("en-US")}</strong>{" "}
                {total === 1 ? "home" : "homes"}
                {filters.bounds ? " in this map area" : ""}
              </p>
            </div>
            <select
              aria-label="Sort by"
              value={filters.sort ?? "newest"}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  sort: event.target.value === "newest" ? undefined : event.target.value,
                  page: undefined,
                }))
              }
              className="h-10 border border-line bg-paper px-3 text-sm text-ink focus:border-navy-700 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {result.data.length > 0 ? (
            <div
              className={cn(
                "grid gap-5 transition-opacity duration-200 sm:grid-cols-2",
                isLoading && "pointer-events-none opacity-50",
              )}
            >
              {result.data.map((property) => (
                <div
                  key={property.id}
                  onMouseEnter={() => setHoveredId(property.id)}
                  onMouseLeave={() => setHoveredId((current) => (current === property.id ? null : current))}
                >
                  <PropertyCard property={property} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-line bg-cream px-6 py-14 text-center">
              <h2 className="mb-2 text-xl font-bold text-navy-900">No homes match your search</h2>
              <p className="mb-6 text-sm text-ink-faint">
                Try zooming out, moving the map, or changing your filters — or ask Sean about off-market listings.
              </p>
              <button type="button" onClick={handleReset} className="btn btn-ghost-dark">
                Reset Search
              </button>
            </div>
          )}

          <ResultPagination currentPage={result.meta.page} totalPages={result.meta.totalPages} onPageChange={handlePageChange} />
        </div>

        <button
          type="button"
          onClick={() => setMobileView((view) => (view === "list" ? "map" : "list"))}
          className="btn btn-primary fixed bottom-5 left-1/2 z-50 -translate-x-1/2 shadow-float lg:hidden"
        >
          {mobileView === "list" ? "Map" : "List"}
        </button>
      </div>
    </section>
  );
}
