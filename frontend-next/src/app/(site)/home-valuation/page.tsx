/**
 * Trang định giá nhà miễn phí (/home-valuation, menu Sell → Home Valuation): hero ảnh nền + form 3 bước, quy trình 4 bước, so sánh ước tính
 * tự động với định giá của Sean, các yếu tố quyết định giá, thẻ hẹn tư vấn với Sean, câu hỏi thường gặp và dải CTA cuối trang.
 * Dùng bởi: Next.js App Router (route /home-valuation); link từ menu Sell, footer và section sell-cta trang chủ.
 * Lưu ý: chữ trên trang viết cố định ở đây (không qua CMS); thông tin môi giới lấy từ resolveContact. Form gửi vào hộp Liên hệ của admin
 * (xem _components/ValuationForm.tsx), không tính giá tự động.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { Breadcrumbs, CARD, CtaBand, Eyebrow, PHOTO_FRAME, SECTION, SECTION_TINT } from "@/app/(site)/_components/ui";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";
import { ValuationForm } from "./_components/ValuationForm";

const HERO_IMAGE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80";
const VALUE_FACTORS_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80";

const HERO_POINTS = [
  { icon: "chart", text: "Based on recent sales in your neighborhood" },
  { icon: "users", text: "Reviewed personally by a local Realtor®" },
  { icon: "clock", text: "Your price range within one business day" },
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
      <section className="relative isolate overflow-hidden bg-navy-900 text-light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 -z-2 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-1 bg-[linear-gradient(100deg,var(--navy-900)_0%,color-mix(in_oklab,var(--navy-900)_88%,transparent)_45%,color-mix(in_oklab,var(--navy-900)_55%,transparent)_100%)]"
        />
        <div className="site-container grid gap-x-[clamp(2.5rem,5vw,4.5rem)] gap-y-10 py-[clamp(3rem,7vw,5.5rem)] lg:grid-cols-[minmax(0,1fr)_28rem]">
          <div className="lg:self-end">
            <div className="reveal mb-8">
              <Breadcrumbs items={[{ label: "Home", href: siteRoutes.home }, { label: "Sell" }, { label: "Home Valuation" }]} />
            </div>
            <Eyebrow gold className="reveal">
              Free Home Valuation
            </Eyebrow>
            <h1 data-headline className="reveal mb-5 text-h1 text-light">
              What is your home really worth today?
            </h1>
            <p className="reveal m-0 max-w-140 text-lg text-light/80">
              Skip the guesswork of online estimates. Get a market valuation built on real local sales and reviewed by a Realtor® who knows
              your neighborhood.
            </p>
          </div>

          <div className="reveal lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <ValuationForm agentName={agent.name} agentPhone={agent.phone} agentPhoneHref={agent.phoneHref} />
          </div>

          <div className="lg:self-start">
            <ul className="reveal mb-10 grid gap-3.5">
              {HERO_POINTS.map((point) => (
                <li key={point.text} className="flex items-center gap-3.5 text-base text-light/90">
                  <span className="grid h-9 w-9 shrink-0 place-items-center bg-light/10 text-light ring-1 ring-light/20">
                    <Icon name={point.icon} className="h-4.5 w-4.5" />
                  </span>
                  {point.text}
                </li>
              ))}
            </ul>
            <div className="reveal flex items-center gap-4 border-t border-light/15 pt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={agent.photo} alt={agent.name} className="h-14 w-14 object-cover ring-2 ring-light/30" />
              <p className="m-0 text-sm text-light/75">
                Prepared personally by <strong className="text-light">{agent.name}</strong>
                <br />
                {agent.title}
              </p>
            </div>
          </div>
        </div>
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
