/**
 * Trang định giá nhà miễn phí (/home-valuation, menu Sell → Home Valuation), bố cục gọn theo trang Home Valuation của First Team:
 * hero ảnh nền + tiêu đề lớn, dòng giới thiệu, thẻ form "What's my home worth?" (nhiều bước), rồi thẻ hẹn tư vấn với Sean.
 * Dùng bởi: Next.js App Router (route /home-valuation); link từ menu Sell, footer và section sell-cta trang chủ.
 * Lưu ý: chữ trên trang viết cố định ở đây (không qua CMS); thông tin môi giới lấy từ resolveContact. Form gửi vào hộp Liên hệ của admin
 * (xem _components/ValuationForm.tsx), không tính giá tự động.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { Breadcrumbs } from "@/app/(site)/_components/ui";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import { ValuationForm } from "./_components/ValuationForm";

const HERO_IMAGE = "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=80";

const AGENT_BADGES = [
  { icon: "shield", label: "Trusted agent", text: "First Team" },
  { icon: "pin", label: "Local expert", text: "OC & Bay Area" },
  { icon: "clock", label: "Prompt response", text: "Within 24 hours" },
];

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Free Home Valuation — What Is My Home Worth?",
    description:
      "Find out what your Orange County or Bay Area home is worth today. Get a free, personal home valuation from Sean Truong, Realtor® at First Team Real Estate.",
    path: siteRoutes.homeValuation,
    image: HERO_IMAGE,
  });
}

export default async function HomeValuationPage() {
  const agent = resolveContact(await getSiteSettings());

  return (
    <>
      <section className="relative isolate flex min-h-[clamp(24rem,62vh,38rem)] flex-col justify-center overflow-hidden bg-navy-900 text-light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 -z-2 h-full w-full object-cover object-[50%_70%]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-1 bg-navy-900/55" />
        <div className="site-container py-16 text-center">
          <div className="reveal mb-6 flex justify-center">
            <Breadcrumbs items={[{ label: "Home", href: siteRoutes.home }, { label: "Home Valuation" }]} />
          </div>
          <h1 data-headline className="reveal mx-auto mb-0 max-w-4xl text-display tracking-tight text-light uppercase">
            Discover your home&apos;s market value
          </h1>
        </div>
        <a
          href="#valuation-form"
          aria-label="Go to the valuation form"
          className="absolute bottom-8 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-light/50 text-light hover:bg-light/15"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </a>
      </section>

      <section className="py-(--section-pad)">
        <div className="site-container">
          <h2 className="reveal mx-auto mb-[clamp(2.5rem,5vw,3.5rem)] max-w-200 text-center text-h3 leading-snug font-light text-navy-900">
            A strategic evaluation — local market insight for your property&apos;s true position
          </h2>

          <div className="reveal mx-auto max-w-240">
            <ValuationForm agentName={agent.name} agentPhone={agent.phone} agentPhoneHref={agent.phoneHref} />
          </div>

          <div className="reveal mx-auto mt-10 grid max-w-240 overflow-hidden border border-line bg-paper shadow-soft sm:grid-cols-[16rem_minmax(0,1fr)]">
            <figure className="relative m-0 bg-cream max-sm:aspect-4/3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={agent.portrait} alt={agent.name} className="absolute inset-0 h-full w-full object-cover object-[50%_15%]" loading="lazy" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(0deg,color-mix(in_oklab,var(--navy-900)_85%,transparent),transparent)] px-5 pt-10 pb-4 text-light">
                <strong className="block text-base">{agent.name}</strong>
                <span className="text-xs text-light/75">{agent.title}</span>
              </figcaption>
            </figure>

            <div className="p-[clamp(1.5rem,3.5vw,2.5rem)]">
              <p className="m-0 mb-3 text-xs font-bold tracking-md text-navy-700 uppercase">Get the best price for your home</p>
              <h3 className="mb-3 text-2xl font-bold text-navy-900">Schedule a free consultation</h3>
              <p className="mb-6 max-w-150 text-sm leading-relaxed text-ink-soft">
                Want more than a number? Meet with {agent.name} for a detailed pricing strategy, a walkthrough of recent sales near you and
                a plan to sell for top dollar.
              </p>
              <ul className="mb-7 grid gap-4 border-y border-line py-5 sm:grid-cols-3">
                {AGENT_BADGES.map((badge) => (
                  <li key={badge.label} className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center bg-navy-50 text-navy-800">
                      <Icon name={badge.icon} className="h-4.5 w-4.5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-navy-900">{badge.label}</span>
                      <span className="block text-xs text-ink-faint">{badge.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link href={siteRoutes.contactTopic("sell")} className="btn btn-primary">
                  <Icon name="calendar" />
                  Schedule a Consultation
                </Link>
                <a href={agent.phoneHref} className="btn btn-ghost-dark">
                  <Icon name="phone" />
                  {agent.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
