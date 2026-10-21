/**
 * Trang định giá nhà miễn phí (/home-valuation, menu Sell → Home Valuation): hero sáng (tiêu đề có chữ nhấn serif, thanh nhập địa chỉ,
 * ảnh nhà + thẻ báo cáo mẫu), dải cam kết navy, quy trình 4 bước, so sánh ước tính tự động với định giá của Sean, các yếu tố quyết định
 * giá, thẻ hẹn tư vấn với Sean, câu hỏi thường gặp và dải CTA cuối trang.
 * Dùng bởi: Next.js App Router (route /home-valuation); link từ menu Sell, footer và section sell-cta trang chủ.
 * Lưu ý: chữ trên trang viết cố định ở đây (không qua CMS); thông tin môi giới lấy từ resolveContact. Form gửi vào hộp Liên hệ của admin
 * (xem _components/ValuationForm.tsx), không tính giá tự động.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { CARD, CtaBand, Eyebrow, PHOTO_FRAME, SECTION, SECTION_TINT } from "@/app/(site)/_components/ui";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";
import { accentSerif } from "@/fonts/accent-serif-font";
import { SampleReportCard } from "./_components/SampleReportCard";
import { ValuationForm } from "./_components/ValuationForm";

const HERO_IMAGE = "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1400&q=80";
const VALUE_FACTORS_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";

const HERO_ASSURANCES = ["100% free", "No obligation to sell", "Your details stay private"];

const HERO_FACTS = [{ value: "15+ yrs", label: "Local expertise · EN & VI" }];

const TRUST_STRIP = [
  { icon: "shield", value: "First Team Real Estate", label: "Backed by a leading SoCal brokerage" },
  { icon: "pin", value: "Orange County & Bay Area", label: "Neighborhood-level pricing" },
  { icon: "chart", value: "Real comparable sales", label: "Not a public-records formula" },
  { icon: "clock", value: "Within 24 hours", label: "Personal reply from Sean" },
];

const PROCESS_STEPS = [
  { title: "Share your address", text: "Tell us where the home is and a few quick details — beds, baths, condition and timing." },
  { title: "We study the market", text: "Sean pulls recent closed sales, active competition and pending deals around your street." },
  { title: "Get your price range", text: "You receive a clear, written valuation with the comparable homes behind every number." },
  { title: "Plan your next move", text: "Optional walkthrough to refine the value, plus a strategy to sell for top dollar." },
];

const ONLINE_ESTIMATE_POINTS = [
  "Formula based on public records only",
  "Can't see upgrades, views or condition",
  "Often off by tens of thousands of dollars",
  "No advice on timing or pricing strategy",
];

const AGENT_VALUATION_POINTS = [
  "Hand-picked comparable sales near you",
  "Accounts for remodels, lot, view and layout",
  "Reflects today's buyer demand in your area",
  "Comes with a plan to maximize your sale price",
];

const VALUE_FACTORS = [
  { icon: "pin", title: "Location & schools", text: "Neighborhood, school district, commute and nearby amenities set the baseline for every price." },
  { icon: "area", title: "Size & layout", text: "Living area, lot size, bedroom count and how well the floor plan works for today's families." },
  { icon: "wrench", title: "Condition & upgrades", text: "Kitchens, baths, roof, solar and curb appeal — the updates buyers will pay more for." },
  { icon: "chart", title: "Market timing", text: "Inventory, interest rates and the season shift what buyers are willing to pay right now." },
];

const AGENT_BADGES = [
  { icon: "shield", title: "Trusted agent", text: "First Team Real Estate" },
  { icon: "pin", title: "Local expert", text: "Orange County & Bay Area" },
  { icon: "clock", title: "Prompt response", text: "Replies within 24 hours" },
];

const VALUATION_FAQS = [
  {
    question: "Is the home valuation really free?",
    answer: "Yes. There is no cost and no obligation to list your home. Many owners request a valuation simply to plan ahead, refinance or track their equity.",
  },
  {
    question: "How is this different from an online estimate?",
    answer: "Online estimates run a formula over public records and can't see your upgrades, view or condition. Sean reviews comparable homes by hand and adjusts for what makes your property unique.",
  },
  {
    question: "How long does it take to get my valuation?",
    answer: "Most requests are answered within one business day. If you'd like an in-person walkthrough for a more precise number, Sean will schedule it at a time that suits you.",
  },
  {
    question: "Will my information be shared?",
    answer: "No. Your details are used only to prepare your valuation and to follow up with you. They are never sold or shared with third parties.",
  },
  {
    question: "Do I have to sell with Sean afterwards?",
    answer: "Not at all. The valuation is yours to keep. If you do decide to sell, you'll already have a pricing strategy and a local expert who knows your home.",
  },
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

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default async function HomeValuationPage() {
  const agent = resolveContact(await getSiteSettings());

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--cream)_0%,var(--paper)_78%)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-1 bg-[linear-gradient(var(--line-soft)_1px,transparent_1px),linear-gradient(90deg,var(--line-soft)_1px,transparent_1px)] mask-[linear-gradient(180deg,black,transparent_70%)] bg-size-[56px_56px]"
        />
        <div className="site-container grid items-center gap-x-[clamp(2.5rem,6vw,5.5rem)] gap-y-14 pt-[clamp(2rem,4vw,3rem)] pb-[clamp(4rem,8vw,6.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div>
            <nav aria-label="Breadcrumb" className="reveal mb-[clamp(2rem,5vw,3.5rem)] text-sm text-ink-faint">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href={siteRoutes.home} className="text-ink-soft hover:text-navy-800">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>Sell</li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-navy-900">
                  Home Valuation
                </li>
              </ol>
            </nav>

            <p className="reveal m-0 mb-6 inline-flex items-center gap-2.5 border border-line bg-paper py-1.5 pr-3.5 pl-2 text-2xs font-bold tracking-md text-navy-800 uppercase shadow-soft">
              <span className="bg-navy-800 px-1.5 py-0.5 text-light">Free</span>
              Complimentary home valuation
            </p>

            <h1 data-headline className="reveal mb-6 text-h1 leading-[1.08] tracking-tight text-navy-900">
              What is your home{" "}
              <em className={cn(accentSerif.className, "font-medium text-navy-700")}>truly worth</em> in today&apos;s market?
            </h1>
            <p className="reveal mb-9 max-w-136 text-lg leading-relaxed text-ink-soft">
              Skip the guesswork of online estimates. Get a precise, personal valuation built on real local sales — prepared by a Realtor®
              who knows your street.
            </p>

            <div className="reveal mb-5 max-w-150">
              <ValuationForm agent={agent} />
            </div>
            <p className="reveal m-0 mb-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
              {HERO_ASSURANCES.map((assurance) => (
                <span key={assurance} className="inline-flex items-center gap-1.5">
                  <Icon name="check" className="h-3.5 w-3.5 text-navy-700" strokeWidth={3} />
                  {assurance}
                </span>
              ))}
            </p>

            <div className="reveal flex flex-wrap items-center gap-x-6 gap-y-5 border-t border-line pt-7">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={agent.photo} alt={agent.name} className="h-13 w-13 object-cover shadow-badge ring-2 ring-paper" />
                <p className="m-0 text-xs leading-snug text-ink-faint">
                  <strong className="block text-sm text-navy-900">{agent.name}</strong>
                  {agent.title}
                </p>
              </div>
              {HERO_FACTS.map((fact) => (
                <p key={fact.label} className="m-0 border-l border-line pl-6 text-xs leading-snug text-ink-faint max-[480px]:border-0 max-[480px]:pl-0">
                  <strong className="block text-lg leading-tight font-extrabold text-navy-900">{fact.value}</strong>
                  {fact.label}
                </p>
              ))}
            </div>
          </div>

          <div className="reveal relative mx-auto w-full max-w-136 lg:mr-0">
            <span aria-hidden="true" className="absolute -right-5 -bottom-5 -z-1 h-3/4 w-3/4 bg-navy-800 max-sm:-right-2.5 max-sm:-bottom-2.5" />
            <figure className={cn(PHOTO_FRAME, "aspect-4/5 shadow-float [&_img]:object-[50%_85%]")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO_IMAGE} alt="Modern Southern California home with a pool" fetchPriority="high" />
            </figure>
            <p className="absolute top-6 -right-4 m-0 flex items-center gap-2.5 bg-paper py-2.5 pr-4 pl-2.5 text-xs font-semibold text-navy-900 shadow-float max-sm:right-3">
              <span className="grid h-8 w-8 place-items-center bg-navy-50 text-navy-800">
                <Icon name="clock" className="h-4 w-4" />
              </span>
              <span>
                Reply within
                <span className="block text-sm font-extrabold">24 hours</span>
              </span>
            </p>
            <SampleReportCard
              agentName={agent.name}
              agentPhoto={agent.photo}
              className="relative z-1 -mt-40 mr-6 ml-auto w-[min(20rem,calc(100%-1.5rem))] sm:-mt-56 lg:absolute lg:bottom-10 lg:-left-14 lg:m-0"
            />
          </div>
        </div>
      </section>

      <section className="bg-navy-900 text-light">
        <ul className="site-container grid grid-cols-4 divide-x divide-light/10 py-8 max-lg:grid-cols-2 max-lg:gap-6 max-lg:divide-x-0 max-sm:grid-cols-1">
          {TRUST_STRIP.map((item) => (
            <li key={item.label} className="flex items-center gap-4 px-6 first:pl-0 max-lg:px-0">
              <Icon name={item.icon} className="h-7 w-7 text-light/70" strokeWidth={1.5} />
              <span>
                <span className="block text-base font-bold text-light">{item.value}</span>
                <span className="block text-xs text-light/60">{item.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={SECTION}>
        <div className="site-container">
          <div className="reveal mx-auto mb-14 max-w-176 text-center">
            <Eyebrow center>How It Works</Eyebrow>
            <h2 className="mb-4 text-h3">From address to asking price in four simple steps</h2>
            <p className="m-0 text-lg text-ink-faint">A clear, data-backed number — and a real person to explain it.</p>
          </div>
          <ol data-stagger="90" className="reveal reveal-group relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((processStep, index) => (
              <li key={processStep.title} className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center bg-navy-800 font-display text-xl font-bold text-light">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < PROCESS_STEPS.length - 1 ? (
                    <span aria-hidden="true" className="hidden h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--line)_0_8px,transparent_8px_14px)] lg:block" />
                  ) : null}
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy-900">{processStep.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-ink-soft">{processStep.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={cn(SECTION, SECTION_TINT)}>
        <div className="site-container">
          <div className="reveal mx-auto mb-14 max-w-176 text-center">
            <Eyebrow center>Why It Matters</Eyebrow>
            <h2 className="mb-4 text-h3">An online estimate is a guess. A valuation is a strategy.</h2>
            <p className="m-0 text-lg text-ink-faint">
              Pricing is the single biggest factor in how fast — and for how much — your home sells.
            </p>
          </div>
          <div className="mx-auto grid max-w-240 items-stretch gap-6 md:grid-cols-2">
            <div className={cn(CARD, "reveal p-[clamp(1.75rem,3vw,2.5rem)]")}>
              <p className="mb-2 text-2xs font-bold tracking-md text-ink-faint uppercase">Automated</p>
              <h3 className="mb-6 text-2xl font-bold text-navy-900">Online estimate</h3>
              <ul className="grid gap-4">
                {ONLINE_ESTIMATE_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-ink-soft">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-cream text-ink-faint">
                      <CrossIcon />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal relative bg-navy-800 p-[clamp(1.75rem,3vw,2.5rem)] text-light shadow-float">
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-light px-3 py-1.5 text-2xs font-bold tracking-sm text-navy-900 uppercase shadow-badge">
                Recommended
              </span>
              <p className="mb-2 text-2xs font-bold tracking-md text-light/60 uppercase">Personal</p>
              <h3 className="mb-6 text-2xl font-bold text-light">Valuation by {agent.name}</h3>
              <ul className="mb-8 grid gap-4">
                {AGENT_VALUATION_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-light/90">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-light text-navy-800">
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <a href="#valuation-form" className="btn btn-light btn-sm">
                Get My Free Valuation
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <div className="site-container grid items-center gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-2">
          <figure className={cn(PHOTO_FRAME, "reveal aspect-4/5 max-lg:aspect-16/10")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={VALUE_FACTORS_IMAGE} alt="Bright, updated living room in a Southern California home" loading="lazy" />
          </figure>
          <div>
            <Eyebrow className="reveal">What Drives Value</Eyebrow>
            <h2 className="reveal mb-4 text-h3">What buyers are really paying for</h2>
            <p className="reveal mb-10 text-lg text-ink-faint">
              Every valuation weighs the same four forces. Knowing where your home stands on each one is how you price it to win.
            </p>
            <ul data-stagger="80" className="reveal reveal-group grid gap-7 sm:grid-cols-2">
              {VALUE_FACTORS.map((factor) => (
                <li key={factor.title}>
                  <span className="mb-4 grid h-12 w-12 place-items-center bg-cream text-navy-800">
                    <Icon name={factor.icon} className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mb-2 text-base font-bold text-navy-900">{factor.title}</h3>
                  <p className="m-0 text-sm leading-relaxed text-ink-soft">{factor.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={cn(SECTION, "bg-navy-900 text-light")}>
        <div className="site-container grid items-center gap-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[22rem_minmax(0,1fr)]">
          <figure className={cn(PHOTO_FRAME, "reveal mx-auto aspect-4/5 w-full max-w-88 bg-navy-800")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={agent.photo} alt={`${agent.name}, ${agent.title}`} loading="lazy" />
          </figure>
          <div>
            <Eyebrow gold className="reveal">
              Get the Best Price for Your Home
            </Eyebrow>
            <h2 className="reveal mb-3 text-h3 text-light">Talk it through with {agent.name}</h2>
            <p className="reveal mb-2 text-sm font-semibold tracking-sm text-light/60 uppercase">
              {agent.title}
            </p>
            <p className="reveal mb-8 max-w-160 text-base leading-relaxed text-light/80">{agent.about}</p>
            <ul data-stagger="70" className="reveal reveal-group mb-10 grid gap-4 sm:grid-cols-3">
              {AGENT_BADGES.map((badge) => (
                <li key={badge.title} className="flex items-center gap-3 border border-light/15 bg-light/5 p-4">
                  <Icon name={badge.icon} className="h-6 w-6 text-light" strokeWidth={1.75} />
                  <span>
                    <span className="block text-sm font-bold text-light">{badge.title}</span>
                    <span className="block text-xs text-light/60">{badge.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="reveal flex flex-wrap gap-3">
              <Link href={siteRoutes.contactTopic("sell")} className="btn btn-light">
                <Icon name="calendar" />
                Schedule a Consultation
              </Link>
              <a href={agent.phoneHref} className="btn btn-ghost">
                <Icon name="phone" />
                {agent.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className={SECTION}>
        <div className="site-container grid gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="reveal">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mb-4 text-h3">Home valuation questions</h2>
            <p className="mb-6 text-base text-ink-faint">Still wondering about something? Sean is happy to help.</p>
            <a href={`mailto:${agent.email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-navy-600">
              <Icon name="mail" />
              {agent.email}
            </a>
          </div>
          <div className="reveal border-t border-line">
            {VALUATION_FAQS.map((faq, index) => (
              <details key={faq.question} open={index === 0} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-base font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <span className="grid h-8 w-8 shrink-0 place-items-center border border-line text-navy-800 group-open:bg-navy-800 group-open:text-light [&_svg]:transition-transform group-open:[&_svg]:rotate-45">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-0 mb-5 max-w-176 pr-12 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Curious what your home could sell for?"
        text="It takes less than a minute to request — and the answer could change your plans."
      >
        <a href="#valuation-form" className="btn btn-light">
          Start My Valuation
        </a>
        <a href={agent.phoneHref} className="btn btn-ghost">
          <Icon name="phone" />
          Call {agent.phone}
        </a>
      </CtaBand>
    </>
  );
}
