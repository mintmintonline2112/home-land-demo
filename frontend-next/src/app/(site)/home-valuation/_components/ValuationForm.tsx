"use client";

/**
 * Thẻ form "What's my home worth?" trang /home-valuation: bước 1 chỉ có ô địa chỉ + nút "View Home Value"; tiếp theo là thông tin căn
 * nhà → thông tin liên hệ → màn cảm ơn, tất cả đổi ngay trong cùng thẻ (có thanh tiến trình từ bước 2, nút quay lại giữ dữ liệu đã nhập).
 * Dùng bởi: app/(site)/home-valuation/page.tsx (mũi tên ở hero trỏ về #valuation-form).
 * Lưu ý: gửi một lần ở bước cuối qua postContact (forms.tsx) vào hộp Liên hệ của admin: subject "Home valuation — <địa chỉ>", toàn bộ
 * thông tin căn nhà ghép vào message (backend cần message ≥ 10 ký tự, subject tối đa 255 ký tự nên địa chỉ giới hạn 200).
 */
import { useState, type FormEvent } from "react";
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
  timeline: string;
};

const PROGRESS_STEPS: Array<{ key: ValuationStep; label: string }> = [
  { key: "address", label: "Address" },
  { key: "details", label: "Home details" },
  { key: "contact", label: "Contact" },
];

const PROPERTY_TYPE_CHOICES = ["Single-family home", "Condo", "Townhouse", "Multi-family", "Land / Lot"];
const BED_CHOICES = ["1", "2", "3", "4", "5+"];
const BATH_CHOICES = ["1", "1.5", "2", "2.5", "3", "4+"];
const TIMELINE_CHOICES = ["As soon as possible", "1–3 months", "3–6 months", "6+ months", "Just curious"];

const EMPTY_DETAILS: HomeDetails = {
  address: "",
  propertyType: PROPERTY_TYPE_CHOICES[0],
  beds: "3",
  baths: "2",
  sqft: "",
  timeline: TIMELINE_CHOICES[1],
};

const FIELD = "mb-4";
const FIELD_LABEL = "mb-2 block text-2xs font-bold tracking-md text-ink-faint uppercase";
const SELECT = cn(INPUT, "cursor-pointer appearance-none pr-10");

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
    `Selling timeline: ${details.timeline}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function StepProgress({ step }: { step: ValuationStep }) {
  const activeIndex = PROGRESS_STEPS.findIndex((item) => item.key === step);
  return (
    <ol className="mb-7 grid grid-cols-3 gap-2" aria-label="Valuation steps">
      {PROGRESS_STEPS.map((item, index) => (
        <li key={item.key} aria-current={index === activeIndex ? "step" : undefined}>
          <span className={cn("mb-2 block h-1", index <= activeIndex ? "bg-navy-700" : "bg-line")} />
          <span className={cn("text-2xs font-bold tracking-sm uppercase", index <= activeIndex ? "text-navy-900" : "text-ink-faint")}>
            {index + 1}. {item.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function SelectField({ id, name, label, choices, defaultValue }: { id: string; name: string; label: string; choices: string[]; defaultValue: string }) {
  return (
    <div className={FIELD}>
      <label htmlFor={id} className={FIELD_LABEL}>
        {label}
      </label>
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
    <div id="valuation-form" className="scroll-mt-28 border border-line bg-paper p-[clamp(1.5rem,4vw,2.5rem)] shadow-soft">
      {step === "details" || step === "contact" ? <StepProgress step={step} /> : null}

      {step === "address" ? (
        <form key="address" onSubmit={handleAddressSubmit} noValidate>
          <h2 className="mb-1 text-2xl font-bold text-navy-900">What&apos;s my home worth?</h2>
          <p className="mb-7 text-sm text-ink-faint">Get a free home value estimate from {agentName}.</p>
          <div className="mb-5">
            <label htmlFor="hv-address" className={FIELD_LABEL}>
              Home Address
            </label>
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-ink-faint" />
              <input
                className={cn(INPUT, "py-3.5 pl-11")}
                type="text"
                id="hv-address"
                name="address"
                autoComplete="street-address"
                placeholder="Enter your address"
                defaultValue={details.address}
                minLength={5}
                maxLength={200}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            View Home Value
            <ArrowIcon />
          </button>
        </form>
      ) : null}

      {step === "details" ? (
        <form key="details" onSubmit={handleDetailsSubmit} noValidate>
          <h2 className="mb-1 text-2xl font-bold text-navy-900">Tell us about the home</h2>
          <p className="mb-6 flex items-center gap-1.5 text-sm text-ink-faint">
            <Icon name="pin" className="h-3.5 w-3.5 text-navy-700" />
            {details.address}
          </p>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <SelectField id="hv-type" name="propertyType" label="Property Type" choices={PROPERTY_TYPE_CHOICES} defaultValue={details.propertyType} />
            <SelectField id="hv-timeline" name="timeline" label="Planning to Sell" choices={TIMELINE_CHOICES} defaultValue={details.timeline} />
          </div>
          <div className="grid grid-cols-3 gap-x-4 max-[480px]:grid-cols-2">
            <SelectField id="hv-beds" name="beds" label="Beds" choices={BED_CHOICES} defaultValue={details.beds} />
            <SelectField id="hv-baths" name="baths" label="Baths" choices={BATH_CHOICES} defaultValue={details.baths} />
            <div className={cn(FIELD, "max-[480px]:col-span-2")}>
              <label htmlFor="hv-sqft" className={FIELD_LABEL}>
                Sq Ft
              </label>
              <input className={INPUT} type="number" inputMode="numeric" id="hv-sqft" name="sqft" min={100} max={50000} placeholder="Approx." defaultValue={details.sqft} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
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
          <h2 className="mb-1 text-2xl font-bold text-navy-900">Unlock your free valuation</h2>
          <p className="mb-6 text-sm text-ink-faint">Enter your details and {agentName} will send your home value report.</p>
          <div className={FIELD}>
            <RequiredLabel htmlFor="hv-name">Full Name</RequiredLabel>
            <input className={INPUT} type="text" id="hv-name" name="fullname" autoComplete="name" required />
          </div>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <div className={FIELD}>
              <RequiredLabel htmlFor="hv-email">Email</RequiredLabel>
              <input className={INPUT} type="email" id="hv-email" name="email" autoComplete="email" required />
            </div>
            <div className={FIELD}>
              <RequiredLabel htmlFor="hv-phone">Phone</RequiredLabel>
              <input className={INPUT} type="tel" id="hv-phone" name="phone" autoComplete="tel" required />
            </div>
          </div>
          <label className="mb-6 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-faint">
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
              {isSending ? "Sending…" : "Unlock Your Free Valuation"}
              {isSending ? null : <ArrowIcon />}
            </button>
          </div>
        </form>
      ) : null}

      {step === "sent" ? (
        <div role="status" className="py-4 text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center bg-navy-800 text-light" aria-hidden="true">
            <Icon name="check" className="h-7 w-7" strokeWidth={2.5} />
          </span>
          <h2 className="mb-2 text-2xl font-bold text-navy-900">Thank you — your request is in</h2>
          <p className="mx-auto mb-6 max-w-136 text-sm text-ink-soft">
            {agentName} will prepare a personal valuation for <strong className="text-navy-900">{details.address}</strong> and reach out
            within one business day.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={agentPhoneHref} className="btn btn-ghost-dark btn-sm">
              <Icon name="phone" />
              {agentPhone}
            </a>
            <button type="button" onClick={handleStartOver} className="btn btn-primary btn-sm">
              Value another home
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
