"use client";

/**
 * Form định giá nhà 3 bước trong thẻ nổi ở hero trang /home-valuation: địa chỉ → thông tin căn nhà → thông tin liên hệ, rồi màn cảm ơn
 * kèm tóm tắt và các bước tiếp theo. Thanh tiến trình trên đầu thẻ, bước sau có nút quay lại, giữ nguyên dữ liệu đã nhập.
 * Dùng bởi: app/(site)/home-valuation/page.tsx.
 * Lưu ý: gửi một lần ở bước cuối qua postContact (forms.tsx) vào hộp Liên hệ của admin: subject "Home valuation — <địa chỉ>", toàn bộ
 * thông tin căn nhà ghép vào message (backend cần message ≥ 10 ký tự, subject tối đa 255 ký tự nên địa chỉ giới hạn 200).
 */
import { useState, type FormEvent, type ReactNode } from "react";
import { ErrorLine, INPUT, RequiredLabel, postContact } from "@/app/(site)/_components/forms";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { cn } from "@/utils/cn";

type ValuationStep = "address" | "details" | "contact" | "sent";

type HomeDetails = {
  address: string;
  propertyType: string;
  beds: string;
  baths: string;
  sqft: string;
  condition: string;
  timeline: string;
};

const FORM_STEPS: Array<{ key: ValuationStep; label: string }> = [
  { key: "address", label: "Address" },
  { key: "details", label: "Details" },
  { key: "contact", label: "Contact" },
];

const PROPERTY_TYPE_CHOICES = ["Single-family home", "Condo", "Townhouse", "Multi-family", "Land / Lot"];
const BED_CHOICES = ["1", "2", "3", "4", "5+"];
const BATH_CHOICES = ["1", "1.5", "2", "2.5", "3", "4+"];
const CONDITION_CHOICES = ["Move-in ready", "Recently updated", "Needs some work", "Fixer-upper"];
const TIMELINE_CHOICES = ["ASAP", "1–3 months", "3–6 months", "6+ months", "Just curious"];

const EMPTY_DETAILS: HomeDetails = {
  address: "",
  propertyType: PROPERTY_TYPE_CHOICES[0],
  beds: "3",
  baths: "2",
  sqft: "",
  condition: CONDITION_CHOICES[0],
  timeline: TIMELINE_CHOICES[1],
};

const FIELD = "mb-4";
const SELECT = cn(INPUT, "cursor-pointer appearance-none pr-10");

const NEXT_STEPS = [
  "Sean reviews recent sales and active listings around your address.",
  "You receive a personalized price range — usually within one business day.",
  "Optional: a walkthrough to fine-tune the value and plan your sale.",
];

function readFormValues(form: HTMLFormElement): Record<string, string> | null {
  if (!form.checkValidity()) {
    form.reportValidity();
    return null;
  }
  return Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
}

function buildValuationMessage(details: HomeDetails): string {
  return [
    `Home valuation request for ${details.address}.`,
    `Property type: ${details.propertyType}`,
    `Bedrooms: ${details.beds}`,
    `Bathrooms: ${details.baths}`,
    details.sqft ? `Living area: ${details.sqft} sq ft` : null,
    `Condition: ${details.condition}`,
    `Selling timeline: ${details.timeline}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function StepProgress({ step }: { step: ValuationStep }) {
  const activeIndex = step === "sent" ? FORM_STEPS.length : FORM_STEPS.findIndex((item) => item.key === step);
  return (
    <ol className="mb-7 grid grid-cols-3 gap-2" aria-label="Valuation steps">
      {FORM_STEPS.map((item, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <li key={item.key} aria-current={isActive ? "step" : undefined}>
            <span
              className={cn(
                "mb-2 block h-1 transition-colors duration-300 ease-brand",
                isDone || isActive ? "bg-navy-700" : "bg-line",
              )}
            />
            <span
              className={cn(
                "flex items-center gap-1.5 text-2xs font-bold tracking-sm uppercase",
                isActive ? "text-navy-900" : isDone ? "text-navy-700" : "text-ink-faint",
              )}
            >
              {isDone ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : <span>{index + 1}.</span>}
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ChoiceChips({ name, label, choices, defaultValue }: { name: string; label: string; choices: string[]; defaultValue: string }) {
  return (
    <fieldset className={cn("m-0 border-0 p-0", FIELD)}>
      <legend className="mb-2 block text-xs font-semibold text-navy-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <label
            key={choice}
            className="cursor-pointer border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink-soft transition-colors duration-180 ease-brand hover:border-navy-600 has-checked:border-navy-800 has-checked:bg-navy-800 has-checked:text-light has-focus-visible:ring-3 has-focus-visible:ring-navy-700/20"
          >
            <input type="radio" name={name} value={choice} defaultChecked={choice === defaultValue} className="sr-only" />
            {choice}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField({ id, name, label, choices, defaultValue }: { id: string; name: string; label: string; choices: string[]; defaultValue: string }) {
  return (
    <div className={FIELD}>
      <RequiredLabel htmlFor={id} isRequired={false}>
        {label}
      </RequiredLabel>
      <div className="relative">
        <select className={SELECT} id={id} name={name} defaultValue={defaultValue}>
          {choices.map((choice) => (
            <option key={choice}>{choice}</option>
          ))}
        </select>
        <svg viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-semibold text-ink-faint hover:text-navy-800"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function StepHeading({ title, text }: { title: string; text: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="mb-1.5 text-xl font-bold text-navy-900">{title}</h2>
      <p className="m-0 text-sm text-ink-faint">{text}</p>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function ValuationForm({ agentName, agentPhone, agentPhoneHref }: { agentName: string; agentPhone: string; agentPhoneHref: string }) {
  const [step, setStep] = useState<ValuationStep>("address");
  const [details, setDetails] = useState<HomeDetails>(EMPTY_DETAILS);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readFormValues(event.currentTarget);
    if (!values) return;
    setDetails((current) => ({ ...current, address: values.address.trim() }));
    setStep("details");
  }

  function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readFormValues(event.currentTarget);
    if (!values) return;
    setDetails((current) => ({
      ...current,
      propertyType: values.propertyType,
      beds: values.beds,
      baths: values.baths,
      sqft: values.sqft.trim(),
      condition: values.condition,
      timeline: values.timeline,
    }));
    setStep("contact");
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readFormValues(event.currentTarget);
    if (!values) return;
    setIsSending(true);
    setError(null);
    try {
      await postContact({
        fullname: values.fullname,
        email: values.email,
        phone: values.phone,
        subject: `Home valuation — ${details.address}`,
        message: buildValuationMessage(details),
      });
      setStep("sent");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not send — please try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleStartOver() {
    setDetails(EMPTY_DETAILS);
    setError(null);
    setStep("address");
  }

  return (
    <div id="valuation-form" className="scroll-mt-28 border border-line bg-paper p-[clamp(1.5rem,3vw,2.25rem)] text-ink shadow-float">
      <StepProgress step={step} />

      {step === "address" ? (
        <form key="address" onSubmit={handleAddressSubmit} noValidate>
          <StepHeading title="Get your free home valuation" text="Start with the property address — it takes less than a minute." />
          <div className={FIELD}>
            <RequiredLabel htmlFor="hv-address">Property Address</RequiredLabel>
            <div className="relative">
              <Icon name="pin" className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-navy-700" />
              <input
                className={cn(INPUT, "py-3.5 pl-11 text-base")}
                type="text"
                id="hv-address"
                name="address"
                autoComplete="street-address"
                placeholder="e.g. 123 Main St, Irvine, CA 92618"
                defaultValue={details.address}
                minLength={5}
                maxLength={200}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Continue
            <ArrowIcon />
          </button>
          <p className="mt-4 mb-0 flex items-center justify-center gap-2 text-xs text-ink-faint">
            <Icon name="shield" className="h-3.5 w-3.5" />
            Free, private and no obligation to sell.
          </p>
        </form>
      ) : null}

      {step === "details" ? (
        <form key="details" onSubmit={handleDetailsSubmit} noValidate>
          <StepHeading
            title="Tell us about the home"
            text={
              <span className="inline-flex items-start gap-1.5">
                <Icon name="pin" className="mt-0.5 h-3.5 w-3.5 text-navy-700" />
                {details.address}
              </span>
            }
          />
          <SelectField id="hv-type" name="propertyType" label="Property Type" choices={PROPERTY_TYPE_CHOICES} defaultValue={details.propertyType} />
          <div className="grid grid-cols-3 gap-x-3 max-[480px]:grid-cols-2">
            <SelectField id="hv-beds" name="beds" label="Beds" choices={BED_CHOICES} defaultValue={details.beds} />
            <SelectField id="hv-baths" name="baths" label="Baths" choices={BATH_CHOICES} defaultValue={details.baths} />
            <div className={cn(FIELD, "max-[480px]:col-span-2")}>
              <RequiredLabel htmlFor="hv-sqft" isRequired={false}>
                Sq Ft
              </RequiredLabel>
              <input className={INPUT} type="number" inputMode="numeric" id="hv-sqft" name="sqft" min={100} max={50000} placeholder="Approx." defaultValue={details.sqft} />
            </div>
          </div>
          <ChoiceChips name="condition" label="Condition" choices={CONDITION_CHOICES} defaultValue={details.condition} />
          <ChoiceChips name="timeline" label="When are you thinking of selling?" choices={TIMELINE_CHOICES} defaultValue={details.timeline} />
          <div className="mt-2 flex items-center justify-between gap-4">
            <BackButton onClick={() => setStep("address")} />
            <button type="submit" className="btn btn-primary">
              Continue
              <ArrowIcon />
            </button>
          </div>
        </form>
      ) : null}

      {step === "contact" ? (
        <form key="contact" onSubmit={handleContactSubmit} noValidate>
          <StepHeading title="Where should we send your valuation?" text="Your report is prepared personally — not by a robot." />
          <div className={FIELD}>
            <RequiredLabel htmlFor="hv-name">Full Name</RequiredLabel>
            <input className={INPUT} type="text" id="hv-name" name="fullname" autoComplete="name" required />
          </div>
          <div className="grid grid-cols-2 gap-x-3 max-[480px]:grid-cols-1">
            <div className={FIELD}>
              <RequiredLabel htmlFor="hv-email">Email</RequiredLabel>
              <input className={INPUT} type="email" id="hv-email" name="email" autoComplete="email" required />
            </div>
            <div className={FIELD}>
              <RequiredLabel htmlFor="hv-phone">Phone</RequiredLabel>
              <input className={INPUT} type="tel" id="hv-phone" name="phone" autoComplete="tel" required />
            </div>
          </div>
          <label className="mb-5 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-faint">
            <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-navy-800" />
            <span>
              I agree to be contacted by {agentName} by phone, email or text about my home valuation. Consent is not a condition of any
              purchase or sale.
            </span>
          </label>
          <ErrorLine error={error} />
          <div className="flex items-center justify-between gap-4">
            <BackButton onClick={() => setStep("details")} />
            <button type="submit" className="btn btn-primary" disabled={isSending}>
              {isSending ? "Sending…" : "Unlock My Valuation"}
              {isSending ? null : <ArrowIcon />}
            </button>
          </div>
        </form>
      ) : null}

      {step === "sent" ? (
        <div role="status">
          <span className="mb-5 grid h-14 w-14 place-items-center bg-navy-800 text-light" aria-hidden="true">
            <Icon name="check" className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <h2 className="mb-2 text-xl font-bold text-navy-900">Your request is in!</h2>
          <p className="mb-5 text-sm text-ink-soft">
            {agentName} is preparing a custom valuation for <strong className="text-navy-900">{details.address}</strong>.
          </p>
          <ol className="mb-6 grid gap-3 border-y border-line py-5">
            {NEXT_STEPS.map((nextStep, index) => (
              <li key={nextStep} className="flex items-start gap-3 text-sm text-ink-soft">
                <span className="grid h-6 w-6 shrink-0 place-items-center bg-cream text-xs font-bold text-navy-800">{index + 1}</span>
                {nextStep}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a href={agentPhoneHref} className="btn btn-ghost-dark btn-sm">
              <Icon name="phone" />
              {agentPhone}
            </a>
            <button
              type="button"
              onClick={handleStartOver}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-navy-700 underline hover:text-navy-900"
            >
              Value another home
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
