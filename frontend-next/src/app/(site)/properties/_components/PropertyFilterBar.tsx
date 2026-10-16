"use client";

/**
 * Thanh lọc ngang trên đầu trang tìm nhà: ô từ khoá (Enter hoặc nút kính lúp để tìm), khu vực, loại nhà, khoảng giá, số phòng ngủ, nút xoá lọc.
 * Dùng bởi: properties/_components/PropertySearch.tsx.
 * Lưu ý: chọn ô nào là áp dụng ngay (gọi onChange với bộ lọc mới); ô từ khoá chỉ áp dụng khi gửi, để không gọi API theo từng phím.
 * Lựa chọn lấy từ src/config/property-search.ts.
 */
import { useState, type FormEvent } from "react";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { AREA_GROUPS, BED_OPTIONS, PRICE_RANGES, PROPERTY_TYPES } from "@/config/property-search";
import type { PropertyFilters } from "@/types/property";
import { cn } from "@/utils/cn";

const CONTROL =
  "h-11 border border-line bg-paper px-3 text-sm text-ink focus:border-navy-700 focus:outline-none";

type FilterKey = "area" | "type" | "price" | "beds";

export function PropertyFilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: PropertyFilters;
  onChange: (changes: Partial<PropertyFilters>) => void;
  onReset: () => void;
}) {
  const [keyword, setKeyword] = useState(filters.keyword ?? "");
  const hasFilters = Boolean(filters.keyword || filters.area || filters.type || filters.price || filters.beds);

  function handleKeywordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ keyword: keyword.trim() || undefined });
  }

  function handleSelectChange(key: FilterKey, value: string) {
    onChange({ [key]: value || undefined });
  }

  function handleReset() {
    setKeyword("");
    onReset();
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <form onSubmit={handleKeywordSubmit} role="search" className="flex min-w-60 flex-1 max-[640px]:min-w-full">
        <label htmlFor="property-keyword" className="sr-only">
          Search by city, neighborhood, address or ZIP
        </label>
        <input
          id="property-keyword"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="City, neighborhood, address, ZIP…"
          className={cn(CONTROL, "min-w-0 flex-1 border-r-0")}
        />
        <button type="submit" className="btn btn-primary h-11 px-4" aria-label="Search">
          <Icon name="search" />
        </button>
      </form>

      <select
        aria-label="Area"
        value={filters.area ?? ""}
        onChange={(event) => handleSelectChange("area", event.target.value)}
        className={cn(CONTROL, "max-w-56")}
      >
        <option value="">All Areas</option>
        {AREA_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <select
        aria-label="Property type"
        value={filters.type ?? ""}
        onChange={(event) => handleSelectChange("type", event.target.value)}
        className={CONTROL}
      >
        <option value="">All Types</option>
        {PROPERTY_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Price range"
        value={filters.price ?? ""}
        onChange={(event) => handleSelectChange("price", event.target.value)}
        className={CONTROL}
      >
        <option value="">Any Price</option>
        {PRICE_RANGES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Bedrooms"
        value={filters.beds ?? ""}
        onChange={(event) => handleSelectChange("beds", event.target.value)}
        className={CONTROL}
      >
        <option value="">Any Beds</option>
        {BED_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} Beds
          </option>
        ))}
      </select>

      {hasFilters ? (
        <button
          type="button"
          onClick={handleReset}
          className="h-11 border-0 bg-transparent px-2 text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}
