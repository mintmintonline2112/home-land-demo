/**
 * Section `contact`: cột trái các thẻ thông tin (văn phòng, điện thoại, email, giờ làm việc), cột phải khung form tư vấn; dưới cùng là bản đồ
 * Google Maps khi admin đã nhập link (Admin → Trang Liên hệ), chưa có link thì không hiện khung bản đồ.
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading (tiêu đề khung form), content (câu mở đầu form), metadata.labelOffice, labelPhone, labelEmail, labelHours, phoneNote,
 * topics [{label, value}] (ô "I'm Interested In"; value khớp ?topic= trên URL), messagePlaceholder, submitLabel, background.
 * Văn phòng / điện thoại / email / giờ / bản đồ lấy từ Admin → Trang Liên hệ (resolveContact), trống thì dùng config/contact.ts.
 * lint-sections-ignore R2: tiêu đề là tiêu đề của khung form ở cột phải, không phải đầu khối căn giữa của Head.
 */
import { Suspense, type ReactNode } from "react";
import { CARD } from "@/app/(site)/_components/ui";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";
import {
  IconBadge,
  RichIntro,
  Shell,
  anchorIdOf,
  iconFor,
  itemsOf,
  textOf,
  toneOf,
  type SectionProps,
} from "../_shared";
import { ContactPanel } from "./ContactPanel.client";

const INFO_LINE = "m-0 text-sm leading-relaxed text-ink-faint";

function InfoCard({ icon, label, children }: { icon: string; label?: string; children: ReactNode }) {
  return (
    <li className={cn(CARD, "flex gap-4 p-6")}>
      <IconBadge className="h-12 w-12 [&>svg]:h-5 [&>svg]:w-5">{iconFor(icon, 0)}</IconBadge>
      <div>
        {label ? <h3 className="mb-1.5 text-base font-bold text-navy-900">{label}</h3> : null}
        {children}
      </div>
    </li>
  );
}

export async function Contact({ section, index = 0 }: SectionProps) {
  const contact = resolveContact(await getSiteSettings());
  const topics = itemsOf(section, "topics").filter((topic) => topic.label);
  const phoneNote = textOf(section, "phoneNote");
  const id = anchorIdOf(section, "contact");

  return (
    <Shell id={id} tone={toneOf(section, index)}>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <ul data-stagger="80" className="reveal reveal-group grid gap-4">
          <InfoCard icon="pin" label={textOf(section, "labelOffice")}>
            <p className={INFO_LINE}>
              {contact.office}
              <br />
              {contact.address}
              <br />
              {contact.location}
            </p>
          </InfoCard>
          <InfoCard icon="phone" label={textOf(section, "labelPhone")}>
            <p className={INFO_LINE}>
              <a href={contact.phoneHref} className="text-inherit hover:text-navy-700">
                {contact.phone}
              </a>
              {phoneNote ? (
                <>
                  <br />
                  {phoneNote}
                </>
              ) : null}
            </p>
          </InfoCard>
          <InfoCard icon="mail" label={textOf(section, "labelEmail")}>
            <p className={INFO_LINE}>
              <a href={`mailto:${contact.email}`} className="text-inherit hover:text-navy-700">
                {contact.email}
              </a>
              <br />
              <a href={contact.website} className="text-inherit underline hover:text-navy-700">
                {contact.website.replace(/^https?:\/\//, "")}
              </a>
            </p>
          </InfoCard>
          {contact.hours ? (
            <InfoCard icon="clock" label={textOf(section, "labelHours")}>
              <p className={INFO_LINE}>
                {contact.hours.split(" · ").map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </InfoCard>
          ) : null}
        </ul>

        <div className={cn(CARD, "reveal p-[clamp(1.5rem,4vw,2rem)]")}>
          {section?.heading ? (
            <h2 className="mb-5 border-b border-line pb-5 text-xl font-bold text-navy-900">{section.heading}</h2>
          ) : null}
          <RichIntro html={section?.content} className="mb-5 text-sm text-ink-soft [&_p:last-child]:mb-0" />
          <Suspense fallback={null}>
            <ContactPanel
              topics={topics.map((topic) => ({ label: topic.label, value: topic.value ?? topic.label }))}
              messagePlaceholder={textOf(section, "messagePlaceholder")}
              submitLabel={textOf(section, "submitLabel")}
            />
          </Suspense>
        </div>
      </div>

      {contact.mapUrl ? (
        <div className="reveal relative mt-12 aspect-[21/8] min-h-72 overflow-hidden bg-cream">
          <iframe
            src={contact.mapUrl}
            title={contact.office}
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}
    </Shell>
  );
}
