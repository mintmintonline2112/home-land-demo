/**
 * Footer site public: logo + đoạn giới thiệu, cột "Buy & Sell", cột "Areas", cột liên hệ; dòng bản quyền + mạng xã hội.
 * Dùng bởi: app/(site)/layout.tsx.
 * Lưu ý: liên hệ lấy từ Admin (resolveContact), trống thì dùng config/contact.ts; dòng bản quyền đọc footerText của Admin → Cài đặt.
 * Cột "Areas" lấy nhãn từ config/property-search.ts (AREA_GROUPS) theo danh sách FOOTER_AREA_NAMES.
 */
import Link from "next/link";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { AREA_GROUPS } from "@/config/property-search";
import { siteRoutes } from "@/config/routes";
import type { SiteContact, SocialLinks } from "@/settings/site-settings";
import { Brand, type BrandProps } from "./Brand";
import { SocialIcons } from "./SocialIcons";

const FOOTER_LINK = "block py-1.5 text-sm text-light/65 transition-colors duration-200 ease-brand hover:text-light";

const COLUMN_TITLE = "mb-5 text-sm font-bold tracking-md text-light uppercase";

const CONTACT_ROW = "flex items-start gap-3 text-sm leading-relaxed text-light/65";

const FOOTER_AREA_NAMES = ["Irvine", "Newport Beach", "Anaheim Hills", "San Francisco", "San Jose"];

const FOOTER_AREAS = AREA_GROUPS.flatMap((group) => group.options).filter((option) =>
  FOOTER_AREA_NAMES.includes(option.value),
);

export function Footer({
  brand,
  contact,
  footerText,
  social,
}: {
  brand?: BrandProps;
  contact: SiteContact;
  footerText?: string | null;
  social?: SocialLinks | null;
}) {
  return (
    <footer className="bg-navy-900 text-light/65">
      <div className="site-container grid grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] gap-[clamp(2rem,5vw,4rem)] pt-[clamp(3.5rem,6vw,4.5rem)] pb-12 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
        <div>
          <Brand isFooter {...brand} />
          <p className="mt-6 max-w-80 text-sm leading-relaxed">{contact.about}</p>
        </div>

        <nav aria-label="Buy and sell">
          <h4 className={COLUMN_TITLE}>Buy &amp; Sell</h4>
          <Link className={FOOTER_LINK} href={siteRoutes.properties}>
            Property Search
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.homeSection("featured")}>
            Featured Homes
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.homeValuation}>
            Home Valuation
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.contactTopic("buy")}>
            Buyer Consultation
          </Link>
          <Link className={FOOTER_LINK} href={siteRoutes.contactTopic("sell")}>
            Seller Consultation
          </Link>
        </nav>

        <nav aria-label="Areas">
          <h4 className={COLUMN_TITLE}>Areas</h4>
          {FOOTER_AREAS.map((area) => (
            <Link key={area.value} className={FOOTER_LINK} href={siteRoutes.propertiesFiltered({ keyword: area.value })}>
              {area.label}
            </Link>
          ))}
        </nav>

        <div>
          <h4 className={COLUMN_TITLE}>Contact</h4>
          <address className="flex flex-col gap-3.5 not-italic">
            <span className={CONTACT_ROW}>
              <Icon name="pin" className="mt-0.5 h-4 w-4" />
              <span>
                {contact.address}, {contact.location}
              </span>
            </span>
            <a className={`${CONTACT_ROW} hover:text-light`} href={contact.phoneHref}>
              <Icon name="phone" className="mt-0.5 h-4 w-4" />
              {contact.phone}
            </a>
            <a className={`${CONTACT_ROW} hover:text-light`} href={`mailto:${contact.email}`}>
              <Icon name="mail" className="mt-0.5 h-4 w-4" />
              {contact.email}
            </a>
            <a className={`${CONTACT_ROW} underline hover:text-light`} href={contact.website}>
              <Icon name="link" className="mt-0.5 h-4 w-4" />
              {contact.website.replace(/^https?:\/\//, "")}
            </a>
          </address>
        </div>
      </div>
      <div className="site-container flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-light/10 py-6 text-sm max-[640px]:flex-col max-[640px]:items-start">
        <p className="m-0">
          © {new Date().getFullYear()} {footerText?.trim() || `${contact.name} · ${contact.office}. All rights reserved.`}
        </p>
        <SocialIcons
          links={social}
          className="inline-flex items-center gap-2"
          linkClassName="grid h-9 w-9 place-items-center border border-light/20 text-light/70 transition-colors duration-200 ease-brand hover:border-light hover:bg-light hover:text-navy-900 [&>svg]:h-4 [&>svg]:w-4"
          label={`${contact.name} on social media`}
        />
      </div>
    </footer>
  );
}
