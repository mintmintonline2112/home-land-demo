"use client";

/**
 * Phần tương tác của property-grid: hàng tab lọc theo vùng (Tất cả / từng vùng) + lưới thẻ nhà hiển thị theo tab đang chọn.
 * Dùng bởi: property-grid/PropertyGrid.tsx.
 * Lưu ý: nhận dữ liệu thuần (danh sách nhà, nhãn tab) từ section server; không có tab nào thì chỉ hiện lưới.
 */
import { useId, useState } from "react";
import { PropertyCard } from "@/app/(site)/_components/property/PropertyCard";
import type { Property } from "@/types/property";
import { cn } from "@/utils/cn";

export type PropertyTab = { value: string; label: string };

const ALL_TAB = "all";

export function PropertyTabs({
  properties,
  tabs,
  allLabel,
}: {
  properties: Property[];
  tabs: PropertyTab[];
  allLabel?: string;
}) {
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const gridId = useId();
  const visibleProperties =
    activeTab === ALL_TAB ? properties : properties.filter((property) => property.region === activeTab);
  const tabOptions = allLabel && tabs.length > 0 ? [{ value: ALL_TAB, label: allLabel }, ...tabs] : [];

  return (
    <>
      {tabOptions.length > 0 ? (
        <div className="reveal mb-10 flex flex-wrap justify-center gap-2" role="tablist">
          {tabOptions.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              aria-controls={gridId}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "border-0 px-5.5 py-3 text-sm font-semibold transition-colors duration-200 ease-brand",
                activeTab === tab.value
                  ? "bg-navy-800 text-light"
                  : "bg-cream text-navy-800 hover:bg-line",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}
      <div
        id={gridId}
        role={tabOptions.length > 0 ? "tabpanel" : undefined}
        data-stagger="80"
        className="reveal reveal-group grid gap-7 md:grid-cols-2 lg:grid-cols-3"
      >
        {visibleProperties.map((property) => (
          <div key={property.slug}>
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </>
  );
}
