/**
 * Thẻ "báo cáo định giá mẫu" nổi trên ảnh hero trang /home-valuation: giá ước tính, thanh khoảng giá, 3 căn đã bán để so sánh và dòng
 * "Reviewed by" kèm ảnh môi giới — cho người xem thấy trước họ sẽ nhận được gì.
 * Dùng bởi: app/(site)/home-valuation/page.tsx.
 * Lưu ý: số liệu là minh hoạ, thẻ luôn ghi rõ "Sample" và chú thích bên dưới; không thay bằng số thật của một căn nhà cụ thể.
 */
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { cn } from "@/utils/cn";

const SAMPLE_COMPARABLES = [
  { distance: "0.2 mi", summary: "4 bd · 2,410 sq ft", soldPrice: "$1,512,000" },
  { distance: "0.4 mi", summary: "4 bd · 2,280 sq ft", soldPrice: "$1,468,000" },
  { distance: "0.5 mi", summary: "3 bd · 2,150 sq ft", soldPrice: "$1,395,000" },
];

const SAMPLE_VALUE_POSITION = "58%";

export function SampleReportCard({ agentName, agentPhoto, className }: { agentName: string; agentPhoto: string; className?: string }) {
  return (
    <div className={cn("border border-line bg-paper p-5 text-ink shadow-float", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-2xs font-bold tracking-md text-navy-800 uppercase">
          <Icon name="file" className="h-3.5 w-3.5" />
          Valuation Report
        </span>
        <span className="bg-navy-50 px-2 py-1 text-2xs font-bold tracking-sm text-navy-700 uppercase">Sample</span>
      </div>

      <p className="m-0 mb-1 text-xs text-ink-faint">Estimated market value</p>
      <p className="m-0 mb-1 text-3xl leading-none font-extrabold tracking-tight text-navy-900">$1,485,000</p>
      <p className="m-0 mb-4 text-xs text-ink-faint">Single-family home · Irvine, CA</p>

      <div className="relative mb-1.5 h-2 bg-[linear-gradient(90deg,var(--navy-100)_0%,var(--navy-600)_100%)]">
        <span
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 border-2 border-paper bg-navy-900 shadow-badge"
          style={{ left: SAMPLE_VALUE_POSITION }}
        />
      </div>
      <div className="mb-5 flex justify-between text-2xs font-semibold text-ink-faint">
        <span>$1.42M</span>
        <span>$1.56M</span>
      </div>

      <p className="m-0 mb-2 text-2xs font-bold tracking-sm text-ink-faint uppercase max-sm:hidden">Recent comparable sales</p>
      <ul className="mb-4 grid gap-2 max-sm:hidden">
        {SAMPLE_COMPARABLES.map((comparable) => (
          <li key={comparable.soldPrice} className="flex items-center justify-between gap-3 bg-cream px-3 py-2 text-xs">
            <span className="text-ink-soft">
              <span className="font-semibold text-navy-900">{comparable.distance}</span> · {comparable.summary}
            </span>
            <span className="font-bold text-navy-900">{comparable.soldPrice}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3 border-t border-line pt-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={agentPhoto} alt="" className="h-9 w-9 object-cover" />
        <p className="m-0 flex-1 text-xs leading-snug text-ink-soft">
          Reviewed by <strong className="text-navy-900">{agentName}</strong>
          <br />
          <span className="text-ink-faint">Illustration only — yours is built for your home</span>
        </p>
        <span className="grid h-7 w-7 place-items-center bg-navy-800 text-light">
          <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}
