"use client";

/**
 * Khung "Search Filters" bên trái trang /properties: từ khoá, khu vực, loại nhà, số phòng ngủ tối thiểu, thanh kéo giá tối đa, nút áp dụng / xoá lọc.
 * Dùng bởi: app/(site)/properties/page.tsx.
 * Lưu ý: là form GET thường (chạy được cả khi chưa có JS) trỏ về chính trang; JS chỉ để hiện giá đang kéo và giữ tham số sắp xếp (sort).
 * Thanh kéo ở mức cao nhất thì không gửi maxPrice (coi như không giới hạn).
 */
import Link from "next/link";
import { useState } from "react";
import { formatShortPrice } from "@/app/(site)/_lib/property-format";
import { AREA_GROUPS, BED_OPTIONS, MAX_PRICE_RANGE, PROPERTY_TYPES } from "@/config/property-search";
import { siteRoutes } from "@/config/routes";

const FIELD_LABEL = "mb-2 block text-2xs font-bold tracking-sm text-ink-soft uppercase";
const CONTROL =
  "h-12 w-full border border-line bg-paper px-3.5 text-sm text-ink focus:border-navy-700 focus:outline-none";

export type PropertyFilterValues = {
  keyword?: string;
  area?: string;
  type?: string;
  beds?: string;
  maxPrice?: string;
  sort?: string;
  price?: string;
};

export function PropertyFilters({ values }: { values: PropertyFilterValues }) {
  const [maxPrice, setMaxPrice] = useState(Number(values.maxPrice) || MAX_PRICE_RANGE.max);
  const isUnlimited = maxPrice >= MAX_PRICE_RANGE.max;

  return (
    <aside className="border border-line bg-paper p-6 lg:sticky lg:top-28">
      <h2 className="mb-5 flex items-center gap-2.5 text-lg font-bold text-navy-900">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        Search Filters
      </h2>
      <form action={siteRoutes.properties} method="get">
        {values.sort ? <input type="hidden" name="sort" value={values.sort} /> : null}
        {values.price ? <input type="hidden" name="price" value={values.price} /> : null}
        <div className="mb-5">
          <label htmlFor="filter-keyword" className={FIELD_LABEL}>
            Keyword
          </label>
          <input
            id="filter-keyword"
            name="keyword"
            type="text"
            defaultValue={values.keyword}
            placeholder="Community, street, ZIP..."
            className={CONTROL}
          />
        </div>
        <div className="mb-5">
          <label htmlFor="filter-area" className={FIELD_LABEL}>
            Area
          </label>
          <select id="filter-area" name="area" defaultValue={values.area ?? ""} className={CONTROL}>
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
        </div>
        <div className="mb-5">
          <label htmlFor="filter-type" className={FIELD_LABEL}>
            Property Type
          </label>
          <select id="filter-type" name="type" defaultValue={values.type ?? ""} className={CONTROL}>
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-5">
          <label htmlFor="filter-beds" className={FIELD_LABEL}>
            Bedrooms (min)
          </label>
          <select id="filter-beds" name="beds" defaultValue={values.beds ?? ""} className={CONTROL}>
            <option value="">Any</option>
            {BED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="filter-max-price" className={FIELD_LABEL}>
            Max Price
          </label>
          <input
            id="filter-max-price"
            name={isUnlimited ? undefined : "maxPrice"}
            type="range"
            min={MAX_PRICE_RANGE.min}
            max={MAX_PRICE_RANGE.max}
            step={MAX_PRICE_RANGE.step}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            className="w-full accent-navy-800"
          />
          <div className="mt-2 flex justify-between text-sm font-semibold text-navy-900">
            <span>{formatShortPrice(MAX_PRICE_RANGE.min)}</span>
            <output htmlFor="filter-max-price">{formatShortPrice(maxPrice)}{isUnlimited ? "+" : ""}</output>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          Apply Filters
        </button>
        <Link href={siteRoutes.properties} className="btn btn-block mt-2 text-navy-900 hover:text-navy-600">
          Reset Filters
        </Link>
      </form>
    </aside>
  );
}
