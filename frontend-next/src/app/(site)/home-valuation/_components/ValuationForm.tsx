"use client";

/**
 * Form định giá nhà trang /home-valuation: thanh nhập địa chỉ lớn ngay trong hero; nhập xong mở hộp thoại (dialog) 2 bước còn lại —
 * thông tin căn nhà → thông tin liên hệ — rồi màn cảm ơn kèm các bước tiếp theo. Cột trái hộp thoại tóm tắt địa chỉ + môi giới.
 * Dùng bởi: app/(site)/home-valuation/page.tsx (các nút CTA khác trên trang trỏ về #valuation-form).
 * Lưu ý: gửi một lần ở bước cuối qua postContact (forms.tsx) vào hộp Liên hệ của admin: subject "Home valuation — <địa chỉ>", toàn bộ
 * thông tin căn nhà ghép vào message (backend cần message ≥ 10 ký tự, subject tối đa 255 ký tự nên địa chỉ giới hạn 200).
 * Dialog dùng showModal() của trình duyệt (Esc để đóng, khoá cuộn trang khi mở); đóng sau khi đã gửi thì form quay về trống.
 */
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { ErrorLine, INPUT, RequiredLabel, postContact } from "@/app/(site)/_components/forms";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { cn } from "@/utils/cn";

type DialogStep = "details" | "contact" | "sent";

type HomeDetails = {
  address: string;
  propertyType: string;
  beds: string;
  baths: string;
  sqft: string;
  condition: string;
  timeline: string;
};

export type ValuationAgent = { name: string; title: string; photo: string; phone: string; phoneHref: string };

const PROGRESS_STEPS = ["Address", "Home details", "Contact"];

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

const REPORT_CONTENTS = [
  "A price range built on recent comparable sales",
  "The nearby homes behind every number",
  "Pricing and timing advice for your sale",
];

const FIELD = "mb-4";
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
    `Condition: ${details.condition}`,
    `Selling timeline: ${details.timeline}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildNextSteps(agentName: string) {
  const firstName = agentName.split(" ")[0];
  return [
    `${firstName} reviews recent sales and active listings around your address.`,
    "You receive a personalized price range — usually within one business day.",
    "Optional: a walkthrough to fine-tune the value and plan your sale.",
  ];
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function StepProgress({ step }: { step: DialogStep }) {
  const activeIndex = step === "details" ? 1 : step === "contact" ? 2 : PROGRESS_STEPS.length;
  return (
    <ol className="mb-7 grid grid-cols-3 gap-2" aria-label="Valuation steps">
      {PROGRESS_STEPS.map((label, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <li key={label} aria-current={isActive ? "step" : undefined}>
            <span className={cn("mb-2 block h-1", isDone || isActive ? "bg-navy-700" : "bg-line")} />
            <span
              className={cn(
                "flex items-center gap-1.5 text-2xs font-bold tracking-sm whitespace-nowrap uppercase",
                isActive ? "text-navy-900" : isDone ? "text-navy-700" : "text-ink-faint",
              )}
            >
              {isDone ? <Icon name="check" className="h-3 w-3" strokeWidth={3} /> : <span>{index + 1}.</span>}
              {label}
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
      <legend className="mb-2 block p-0 text-xs font-semibold text-navy-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <label
            key={choice}
            className="cursor-pointer border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink-soft transition-colors duration-180 ease-brand hover:border-navy-600 has-checked:border-navy-800 has-checked:bg-navy-800 has-checked:text-light has-focus-visible:ring-3 has-focus-visible:ring-navy-700/20"
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
    <div className="mb-6">
      <h2 className="mb-1.5 text-2xl font-bold text-navy-900">{title}</h2>
      <p className="m-0 text-sm text-ink-faint">{text}</p>
    </div>
  );
}

function DialogSummary({ agent, address }: { agent: ValuationAgent; address: string }) {
  return (
    <aside className="relative isolate flex flex-col overflow-hidden bg-navy-900 p-8 text-light max-md:hidden">
      <span aria-hidden="true" className="absolute -top-24 -right-24 -z-1 h-64 w-64 rounded-full bg-navy-700/40 blur-3xl" />
      <p className="m-0 mb-3 text-2xs font-bold tracking-lg text-light/60 uppercase">Your valuation</p>
      <p className="m-0 mb-8 flex items-start gap-2 text-base leading-snug font-semibold text-light">
        <Icon name="pin" className="mt-0.5 h-4 w-4 text-light/70" />
        {address}
      </p>
      <p className="m-0 mb-3 text-2xs font-bold tracking-lg text-light/60 uppercase">What you&apos;ll receive</p>
      <ul className="mb-8 grid gap-3">
        {REPORT_CONTENTS.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-light/85">
            <Icon name="check" className="mt-0.5 h-4 w-4 text-light" strokeWidth={2.5} />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center gap-3 border-t border-light/15 pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={agent.photo} alt="" className="h-12 w-12 object-cover ring-2 ring-light/25" />
        <p className="m-0 text-xs leading-snug text-light/70">
          <strong className="block text-sm text-light">{agent.name}</strong>
          {agent.title}
        </p>
      </div>
    </aside>
  );
}

export function ValuationForm({ agent }: { agent: ValuationAgent }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>("details");
  const [details, setDetails] = useState<HomeDetails>(EMPTY_DETAILS);
  const [addressDraft, setAddressDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isDialogOpen && !dialog.open) dialog.showModal();
    if (!isDialogOpen && dialog.open) dialog.close();
    document.documentElement.style.overflow = isDialogOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isDialogOpen]);

  function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readFormValues(event.currentTarget);
    if (!values) return;
    setDetails((current) => ({ ...current, address: values.address.trim() }));
    setStep("details");
    setError(null);
    setIsDialogOpen(true);
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

  function handleDialogClose() {
    setIsDialogOpen(false);
    if (step === "sent") {
      setDetails(EMPTY_DETAILS);
      setAddressDraft("");
      setStep("details");
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) handleDialogClose();
  }

  return (
    <>
      <form id="valuation-form" onSubmit={handleAddressSubmit} noValidate className="scroll-mt-36">
        <label htmlFor="hv-address" className="mb-3 block text-xs font-bold tracking-md text-navy-900 uppercase">
          Enter your property address
        </label>
        <div className="flex items-stretch gap-2 border border-line bg-paper p-2 shadow-float transition-[border-color,box-shadow] duration-180 ease-brand focus-within:border-navy-700 focus-within:ring-4 focus-within:ring-navy-700/10 max-[560px]:flex-col">
          <div className="relative min-w-0 flex-1">
            <Icon name="pin" className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-navy-700" />
            <input
              className="h-full w-full border-0 bg-transparent py-4 pr-3 pl-12 font-main text-base text-ink placeholder:text-ink-faint/70 focus:outline-none"
              type="text"
              id="hv-address"
              name="address"
              autoComplete="street-address"
              placeholder="Street address, city, ZIP"
              value={addressDraft}
              onChange={(event) => setAddressDraft(event.target.value)}
              minLength={5}
              maxLength={200}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary shrink-0 px-7">
            Get My Valuation
            <ArrowIcon />
          </button>
        </div>
      </form>

      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        onClick={handleBackdropClick}
        aria-labelledby="hv-dialog-title"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(58rem,calc(100%-2rem))] overflow-y-auto border-0 bg-paper p-0 text-ink shadow-float backdrop:bg-navy-900/70 backdrop:backdrop-blur-sm"
      >
        <div className="grid min-h-136 md:grid-cols-[18.5rem_minmax(0,1fr)]">
          <DialogSummary agent={agent} address={details.address} />

          <div className="relative p-[clamp(1.5rem,4vw,2.75rem)]">
            <button
              type="button"
              onClick={handleDialogClose}
              aria-label="Close"
              className="absolute top-4 right-4 grid h-9 w-9 cursor-pointer place-items-center border-0 bg-transparent text-ink-faint hover:bg-cream hover:text-navy-900"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            <StepProgress step={step} />

            {step === "details" ? (
              <form key="details" onSubmit={handleDetailsSubmit} noValidate>
                <h2 id="hv-dialog-title" className="sr-only">
                  Home valuation request
                </h2>
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
                <div className="mt-6 flex items-center justify-between gap-4">
                  <BackButton onClick={handleDialogClose} />
                  <button type="submit" className="btn btn-primary">
                    Continue
                    <ArrowIcon />
                  </button>
                </div>
              </form>
            ) : null}

            {step === "contact" ? (
              <form key="contact" onSubmit={handleContactSubmit} noValidate>
                <h2 id="hv-dialog-title" className="sr-only">
                  Home valuation request
                </h2>
                <StepHeading title="Where should we send your valuation?" text="Your report is prepared personally — never auto-generated." />
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
                <label className="mb-6 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink-faint">
                  <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-navy-800" />
                  <span>
                    I agree to be contacted by {agent.name} by phone, email or text about my home valuation. Consent is not a condition of
                    any purchase or sale.
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
                <h2 id="hv-dialog-title" className="sr-only">
                  Request received
                </h2>
                <span className="mb-5 grid h-14 w-14 place-items-center bg-navy-800 text-light" aria-hidden="true">
                  <Icon name="check" className="h-7 w-7" strokeWidth={2.5} />
                </span>
                <p className="m-0 mb-2 text-2xl font-bold text-navy-900">Your request is in!</p>
                <p className="mb-6 text-sm text-ink-soft">
                  {agent.name} is preparing a custom valuation for <strong className="text-navy-900">{details.address}</strong>.
                </p>
                <ol className="mb-7 grid gap-3 border-y border-line py-5">
                  {buildNextSteps(agent.name).map((nextStep, index) => (
                    <li key={nextStep} className="flex items-start gap-3 text-sm text-ink-soft">
                      <span className="grid h-6 w-6 shrink-0 place-items-center bg-cream text-xs font-bold text-navy-800">{index + 1}</span>
                      {nextStep}
                    </li>
                  ))}
                </ol>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={handleDialogClose} className="btn btn-primary">
                    Done
                  </button>
                  <a href={agent.phoneHref} className="btn btn-ghost-dark">
                    <Icon name="phone" />
                    {agent.phone}
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
