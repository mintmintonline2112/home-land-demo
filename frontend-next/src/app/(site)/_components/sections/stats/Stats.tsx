/**
 * Section `stats`: dải số liệu nổi bật nền navy, mỗi cột một con số lớn + nhãn chữ hoa + dòng mô tả nhỏ, các cột ngăn bằng đường kẻ mảnh;
 * có thể kèm đầu khối phía trên.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.stats [{value, label, note}]. Giá trị bắt đầu bằng số (VD "350+", "2,000+") tự chạy
 * đếm từ 0 khi cuộn tới nhờ data-count (SiteEffects.tsx đếm phần số, phần đuôi như "+" giữ nguyên); giá trị chữ (VD "EN · VI") hiện nguyên.
 */
import { Head, Shell, anchorIdOf, itemsOf, type SectionProps } from "../_shared";

function splitStatValue(value: string) {
  const match = value.match(/^(\d[\d,]*)(.*)$/);
  return match
    ? { count: Number.parseInt(match[1].replace(/,/g, ""), 10), number: match[1], suffix: match[2] }
    : { count: undefined, number: value, suffix: "" };
}

export function Stats({ section }: SectionProps) {
  const stats = itemsOf(section, "stats").filter((stat) => stat.label && stat.value);
  const id = anchorIdOf(section, "stats");

  if (stats.length === 0) return null;

  return (
    <Shell id={id} tone="dark" className="py-[clamp(2.75rem,5vw,3.75rem)]">
      <Head section={section} light />
      <dl
        data-stagger="160"
        className="reveal reveal-group m-0 grid grid-cols-2 gap-y-10 text-center lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]"
      >
        {stats.map((stat) => {
          const value = splitStatValue(stat.value);
          return (
            <div key={stat.label} className="flex flex-col px-4 lg:border-l lg:border-light/10 lg:first:border-l-0">
              <dt className="order-2 text-xs font-bold tracking-lg text-light/80 uppercase">{stat.label}</dt>
              <dd className="m-0 mb-3 text-[clamp(2.25rem,4vw,3.25rem)] leading-none font-extrabold text-light tabular-nums">
                <span data-count={value.count}>{value.number}</span>
                <span className="text-light/60">{value.suffix}</span>
              </dd>
              {stat.note ? <dd className="order-3 m-0 mt-2 text-xs text-light/50">{stat.note}</dd> : null}
            </div>
          );
        })}
      </dl>
    </Shell>
  );
}
