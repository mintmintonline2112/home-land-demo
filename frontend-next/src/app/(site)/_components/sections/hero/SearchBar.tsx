/**
 * Ô tìm nhà nền trắng của hero: từ khoá, khu vực, loại nhà, khoảng giá + nút Search, gửi GET tới trang danh sách nhà.
 * Dùng bởi: hero/Hero.tsx (bố cục search).
 * Lưu ý: nhãn lấy từ CMS qua props, ô nào thiếu nhãn thì không có <label> hiển thị (vẫn có aria-label); lựa chọn lấy từ config/property-search.ts.
 */
import { AREA_GROUPS, PRICE_RANGES, PROPERTY_TYPES } from "@/config/property-search";
import { cn } from "@/utils/cn";
import { Icon } from "../_shared";

export type SearchBarLabels = {
  keyword?: string;
  keywordPlaceholder?: string;
  area?: string;
  anyArea?: string;
  type?: string;
  anyType?: string;
  price?: string;
  anyPrice?: string;
  submit?: string;
};

const FIELD_LABEL = "mb-1.5 block text-2xs font-bold tracking-sm text-ink-soft uppercase";
const CONTROL =
  "h-12 w-full border border-line bg-paper px-3.5 text-sm text-ink focus:border-navy-700 focus:outline-none";

export function SearchBar({ action, labels }: { action: string; labels: SearchBarLabels }) {
  return (
    <form
      action={action}
      method="get"
      role="search"
      className="reveal mx-auto grid w-full max-w-[62rem] grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] items-end gap-3 bg-paper p-4 text-left text-ink shadow-float max-[900px]:grid-cols-2 max-[640px]:grid-cols-1"
    >
      <div className="max-[900px]:col-span-2 max-[640px]:col-span-1">
        {labels.keyword ? (
          <label htmlFor="hero-keyword" className={FIELD_LABEL}>
            {labels.keyword}
          </label>
        ) : null}
        <input
          id="hero-keyword"
          name="keyword"
          type="text"
          placeholder={labels.keywordPlaceholder}
          aria-label={labels.keyword ?? "Keyword"}
          className={CONTROL}
        />
      </div>
      <div>
        {labels.area ? (
          <label htmlFor="hero-area" className={FIELD_LABEL}>
            {labels.area}
          </label>
        ) : null}
        <select id="hero-area" name="area" defaultValue="" aria-label={labels.area ?? "Area"} className={CONTROL}>
          <option value="">{labels.anyArea ?? ""}</option>
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
      <div>
        {labels.type ? (
          <label htmlFor="hero-type" className={FIELD_LABEL}>
            {labels.type}
          </label>
        ) : null}
        <select id="hero-type" name="type" defaultValue="" aria-label={labels.type ?? "Property type"} className={CONTROL}>
          <option value="">{labels.anyType ?? ""}</option>
          {PROPERTY_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        {labels.price ? (
          <label htmlFor="hero-price" className={FIELD_LABEL}>
            {labels.price}
          </label>
        ) : null}
        <select id="hero-price" name="price" defaultValue="" aria-label={labels.price ?? "Price range"} className={CONTROL}>
          <option value="">{labels.anyPrice ?? ""}</option>
          {PRICE_RANGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className={cn("btn btn-primary h-12 px-6 max-[900px]:col-span-2 max-[640px]:col-span-1")}>
        <Icon name="search" />
        {labels.submit}
      </button>
    </form>
  );
}
