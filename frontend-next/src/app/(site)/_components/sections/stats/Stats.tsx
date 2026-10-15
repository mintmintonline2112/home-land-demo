/**
 * Section `stats`: dải số liệu nổi bật nền navy, mỗi cột một con số lớn + nhãn chữ hoa; có thể kèm đầu khối phía trên.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.stats [{label, value}]. Giá trị bắt đầu bằng số (VD "350+") tự chạy đếm nhờ
 * data-count (SiteEffects.tsx đếm phần chữ đầu tiên, phần đuôi như "+" giữ nguyên).
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
    <Shell id={id} tone="dark" className="py-12">
      <Head section={section} light />
      <dl
        data-stagger="80"
        className="reveal reveal-group m-0 grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-8 text-center"
      >
        {stats.map((stat) => {
          const value = splitStatValue(stat.value);
          return (
            <div key={stat.label} className="flex flex-col">
              <dt className="order-2 text-sm font-semibold tracking-md text-light/75 uppercase">{stat.label}</dt>
              <dd className="m-0 mb-3 text-h3 leading-none font-extrabold text-light">
                <span data-count={value.count}>{value.number}</span>
                {value.suffix}
              </dd>
            </div>
          );
        })}
      </dl>
    </Shell>
  );
}
