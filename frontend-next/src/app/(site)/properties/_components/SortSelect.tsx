"use client";

/**
 * Ô "Sắp xếp" trên đầu danh sách nhà (/properties): đổi lựa chọn thì đổi tham số sort trên URL, giữ nguyên các bộ lọc khác.
 * Dùng bởi: app/(site)/properties/page.tsx.
 * Lưu ý: dùng router.replace + scroll: false để không nhảy lên đầu trang; "newest" là mặc định nên bỏ khỏi URL.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/config/property-search";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSortChange(nextSort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSort === "newest") params.delete("sort");
    else params.set("sort", nextSort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <select
      aria-label="Sort by"
      value={value}
      onChange={(event) => handleSortChange(event.target.value)}
      className="h-11 border border-line bg-paper px-4 text-sm text-ink focus:border-navy-700 focus:outline-none"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
