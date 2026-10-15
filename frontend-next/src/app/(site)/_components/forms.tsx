"use client";

/**
 * Các form public gửi API backend `client/contact`: form tư vấn trang Liên hệ (ContactForm) và form hỏi về một căn nhà (PropertyInquiryForm).
 * Dùng bởi: sections/contact/ContactPanel.client.tsx, trang properties/[slug].
 * Lưu ý: backend bắt buộc fullname, email, phone, message ≥ 10 ký tự; "I'm Interested In" và tên căn nhà gửi vào `subject`.
 * Nhãn ô nhập tiếng Anh cố định vì site chỉ có tiếng Anh; chữ tiêu đề / mô tả / danh sách chủ đề do nơi gọi truyền vào.
 */
import { useState, type FormEvent, type ReactNode } from "react";
import { env } from "@/config/env";
import { cn } from "@/utils/cn";

const FIELD_ROW = "grid grid-cols-2 gap-x-4 max-[640px]:grid-cols-1";
const FIELD = "mb-4";
const LABEL = "mb-2 block text-xs font-semibold text-navy-900";
const REQUIRED_MARK = "text-danger";
const INPUT =
  "w-full border border-line bg-paper px-4 py-3 font-main text-sm text-ink transition-[border-color,box-shadow] duration-180 ease-brand placeholder:text-ink-faint/70 focus:border-navy-700 focus:ring-3 focus:ring-navy-700/10 focus:outline-none";
const TEXTAREA = cn(INPUT, "min-h-32 resize-y");
const FORM_ERROR = "m-0 mb-4 text-sm text-danger";

async function postContact(body: Record<string, string | undefined>) {
  const response = await fetch(`${env.publicApiUrl}/client/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 429) {
    throw new Error("You are sending too fast — please wait a minute and try again.");
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload?.message.join(", ") : payload?.message;
    throw new Error(message || "Could not send — please try again.");
  }
}

function useContactSubmit(buildBody: (values: Record<string, string>) => Record<string, string | undefined>) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    setIsSending(true);
    setError(null);
    try {
      await postContact(buildBody(values));
      setIsSent(true);
      form.reset();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not send — please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return { isSending, error, isSent, resetSent: () => setIsSent(false), handleSubmit };
}

function RequiredLabel({ htmlFor, children, isRequired = true }: { htmlFor: string; children: ReactNode; isRequired?: boolean }) {
  return (
    <label className={LABEL} htmlFor={htmlFor}>
      {children}
      {isRequired ? (
        <span className={REQUIRED_MARK} aria-hidden="true">
          {" "}*
        </span>
      ) : null}
    </label>
  );
}

function SuccessPanel({ title, body, onReset }: { title: string; body: string; onReset: () => void }) {
  return (
    <div className="py-8 text-center" role="status">
      <span className="mx-auto mb-5 grid h-14 w-14 place-items-center bg-cream text-navy-800" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <h3 className="mb-2 text-xl font-bold text-navy-900">{title}</h3>
      <p className="mb-6 text-sm text-ink-faint">{body}</p>
      <button type="button" className="btn btn-ghost-dark" onClick={onReset}>
        Send another message
      </button>
    </div>
  );
}

function ErrorLine({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <p className={FORM_ERROR} role="alert">
      {error}
    </p>
  );
}

export function ContactForm({
  topics,
  defaultTopic,
  messagePlaceholder,
  submitLabel = "Send Message",
}: {
  topics: string[];
  defaultTopic?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
}) {
  const { isSending, error, isSent, resetSent, handleSubmit } = useContactSubmit((values) => ({
    fullname: values.fullname,
    email: values.email,
    phone: values.phone,
    subject: values.topic || undefined,
    message: values.message,
  }));

  if (isSent) {
    return (
      <SuccessPanel
        title="Thank you — message received"
        body="Sean will personally get back to you within 24 hours."
        onReset={resetSent}
      />
    );
  }

  const initialTopic = defaultTopic && topics.includes(defaultTopic) ? defaultTopic : topics[0];

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={FIELD_ROW}>
        <div className={FIELD}>
          <RequiredLabel htmlFor="cf-name">Full Name</RequiredLabel>
          <input className={INPUT} type="text" id="cf-name" name="fullname" autoComplete="name" required />
        </div>
        <div className={FIELD}>
          <RequiredLabel htmlFor="cf-phone">Phone Number</RequiredLabel>
          <input className={INPUT} type="tel" id="cf-phone" name="phone" autoComplete="tel" required />
        </div>
      </div>
      <div className={FIELD_ROW}>
        <div className={FIELD}>
          <RequiredLabel htmlFor="cf-email">Email</RequiredLabel>
          <input className={INPUT} type="email" id="cf-email" name="email" autoComplete="email" required />
        </div>
        {topics.length > 0 ? (
          <div className={FIELD}>
            <RequiredLabel htmlFor="cf-topic" isRequired={false}>
              I&apos;m Interested In
            </RequiredLabel>
            <select className={INPUT} id="cf-topic" name="topic" defaultValue={initialTopic}>
              {topics.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      <div className={FIELD}>
        <RequiredLabel htmlFor="cf-message">Message</RequiredLabel>
        <textarea
          className={TEXTAREA}
          id="cf-message"
          name="message"
          rows={5}
          minLength={10}
          required
          placeholder={messagePlaceholder}
        />
      </div>
      <ErrorLine error={error} />
      <button type="submit" className="btn btn-primary" disabled={isSending}>
        {isSending ? "Sending…" : submitLabel}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      </button>
    </form>
  );
}

export function PropertyInquiryForm({
  propertyTitle,
  listingId,
  submitLabel = "Request a Showing",
}: {
  propertyTitle: string;
  listingId: string;
  submitLabel?: string;
}) {
  const { isSending, error, isSent, resetSent, handleSubmit } = useContactSubmit((values) => ({
    fullname: values.fullname,
    email: values.email,
    phone: values.phone,
    subject: `Showing request — ${propertyTitle} (${listingId})`,
    message: values.message,
  }));

  if (isSent) {
    return (
      <SuccessPanel
        title="Request received"
        body={`Sean will contact you shortly to schedule a showing of ${propertyTitle}.`}
        onReset={resetSent}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={FIELD}>
        <RequiredLabel htmlFor="pi-name">Full Name</RequiredLabel>
        <input className={INPUT} type="text" id="pi-name" name="fullname" autoComplete="name" required />
      </div>
      <div className={FIELD}>
        <RequiredLabel htmlFor="pi-phone">Phone Number</RequiredLabel>
        <input className={INPUT} type="tel" id="pi-phone" name="phone" autoComplete="tel" required />
      </div>
      <div className={FIELD}>
        <RequiredLabel htmlFor="pi-email">Email</RequiredLabel>
        <input className={INPUT} type="email" id="pi-email" name="email" autoComplete="email" required />
      </div>
      <div className={FIELD}>
        <RequiredLabel htmlFor="pi-message">Message</RequiredLabel>
        <textarea
          className={TEXTAREA}
          id="pi-message"
          name="message"
          rows={4}
          minLength={10}
          required
          defaultValue={`I'm interested in the ${propertyTitle}. Please get in touch with me.`}
        />
      </div>
      <ErrorLine error={error} />
      <button type="submit" className="btn btn-primary btn-block" disabled={isSending}>
        {isSending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
