/**
 * Trang chi tiết nhà (/properties/<slug>): breadcrumb, tên + địa chỉ + giá, bộ ảnh, tổng quan, mô tả, tiện ích, bảng thông số, bản đồ vị trí;
 * cột phải là thẻ môi giới + form hẹn xem nhà + thẻ gọi điện; cuối trang là nhà cùng vùng.
 * Dùng bởi: Next.js App Router (route động /properties/[slug]).
 * Lưu ý: nhà lấy từ _lib/properties.ts (API backend); thông tin môi giới lấy từ resolveContact (Admin → Trang Liên hệ, trống thì config/contact.ts).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PropertyInquiryForm } from "@/app/(site)/_components/forms";
import { PropertyCard } from "@/app/(site)/_components/property/PropertyCard";
import { Icon } from "@/app/(site)/_components/sections/_shared/icons";
import { Breadcrumbs, CARD, Eyebrow, SECTION } from "@/app/(site)/_components/ui";
import { getProperty, getRelatedProperties } from "@/app/(site)/_lib/properties";
import { formatArea, formatFullAddress, formatPrice } from "@/app/(site)/_lib/property-format";
import { buildPageMetadata } from "@/app/(site)/_lib/seo";
import { siteRoutes } from "@/config/routes";
import { getSiteSettings, resolveContact } from "@/settings/site-settings";
import { cn } from "@/utils/cn";
import { LocationMap } from "../_components/LocationMap";
import { PropertyGallery } from "../_components/PropertyGallery";

type PropertyParams = Promise<{ slug: string }>;

const PANEL_TITLE = "mb-5 border-b border-line pb-4 text-xl font-bold text-navy-900";

export async function generateMetadata({ params }: { params: PropertyParams }): Promise<Metadata> {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) return { title: "Property not found", robots: { index: false } };
  return buildPageMetadata({
    title: `${property.title}, ${property.city}`,
    description: `${property.beds}-bedroom ${property.typeLabel.toLowerCase()} in ${property.city}, CA — ${formatPrice(property.price)}. Full details, photos, and a showing with Sean Truong.`,
    path: siteRoutes.property(property.slug),
    image: property.images[0]?.src,
  });
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(CARD, "reveal p-[clamp(1.5rem,3vw,1.75rem)]")}>
      <h2 className={PANEL_TITLE}>{title}</h2>
      {children}
    </section>
  );
}

export default async function PropertyDetailPage({ params }: { params: PropertyParams }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  const [settings, relatedProperties] = await Promise.all([getSiteSettings(), getRelatedProperties(property)]);
  const agent = resolveContact(settings);

  const overview = [
    { icon: "bed", value: String(property.beds), label: "Bedrooms" },
    { icon: "bath", value: String(property.baths), label: "Bathrooms" },
    { icon: "area", value: formatArea(property.sqft), label: "Living Area" },
    { icon: "car", value: String(property.garage), label: "Garage Spaces" },
  ];
  const details = [
    ["Listing ID", property.listingId],
    ["Property Type", property.typeLabel],
    ["Status", property.status],
    ["Lot Size", property.lotSize],
    ["Living Area", formatArea(property.sqft)],
    ["Stories", String(property.stories)],
    ["Year Built", String(property.yearBuilt)],
    ["Facing", property.facing],
    ["HOA Fees", property.hoa],
  ];

  return (
    <>
      <section className="bg-navy-900 py-[clamp(2.5rem,5vw,3.5rem)]">
        <div className="site-container">
          <Breadcrumbs
            items={[
              { label: "Home", href: siteRoutes.home },
              { label: "Property Search", href: siteRoutes.properties },
              { label: property.title },
            ]}
          />
        </div>
      </section>

      <section className="pt-[clamp(2.5rem,5vw,3.5rem)] pb-(--section-pad)">
        <div className="site-container">
          <div className="reveal mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="mb-3 text-h3 text-navy-900">{property.title}</h1>
              <p className="m-0 flex items-center gap-2 text-sm text-ink-faint">
                <Icon name="pin" />
                {formatFullAddress(property)}
              </p>
            </div>
            <div className="text-right max-[640px]:text-left">
              <span className="mb-2 inline-block bg-navy-800 px-3 py-1.5 text-2xs font-bold tracking-sm text-light uppercase">
                {property.status}
              </span>
              <p className="m-0 text-h3 leading-none font-extrabold text-navy-900">{formatPrice(property.price)}</p>
            </div>
          </div>

          <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
            <div className="grid gap-7">
              <div className="reveal">
                <PropertyGallery images={property.images} title={property.title} />
              </div>

              <Panel title="Overview">
                <dl className="m-0 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {overview.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 bg-cream px-4 py-5">
                      <Icon name={item.icon} className="h-6 w-6 text-navy-800" strokeWidth={1.75} />
                      <div className="flex flex-col">
                        <dt className="order-2 text-2xs font-semibold tracking-sm text-ink-faint uppercase">{item.label}</dt>
                        <dd className="m-0 text-base font-bold text-navy-900">{item.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Panel>

              <Panel title="Description">
                <div className="text-base leading-relaxed text-ink-soft">
                  {property.description.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
              </Panel>

              <Panel title="Amenities">
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-3 text-sm text-ink-soft">
                      <Icon name="check" className="h-4 w-4 text-navy-700" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Property Details">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {details.map(([label, value]) => (
                      <tr key={label} className="border-b border-line last:border-b-0">
                        <th scope="row" className="w-[45%] px-1 py-3.5 text-left font-semibold text-navy-900">
                          {label}
                        </th>
                        <td className="px-1 py-3.5 text-ink-soft">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <Panel title="Location">
                {property.latitude !== null && property.longitude !== null ? (
                  <LocationMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                    label={`Map of ${formatFullAddress(property)}`}
                  />
                ) : (
                  <div className="grid aspect-[16/7] place-items-center bg-[linear-gradient(135deg,var(--cream)_0%,var(--line)_100%)]">
                    <span className="grid h-12 w-12 place-items-center bg-navy-800 text-light">
                      <Icon name="pin" className="h-6 w-6" />
                    </span>
                  </div>
                )}
                <p className="mt-3 mb-0 flex items-center gap-2 text-sm text-ink-faint">
                  <Icon name="pin" className="h-4 w-4" />
                  {formatFullAddress(property)}
                </p>
              </Panel>
            </div>

            <aside className="grid gap-7 lg:sticky lg:top-28">
              <div className={cn(CARD, "reveal p-6")}>
                <div className="mb-5 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.photo} alt={agent.name} className="h-15 w-15 object-cover" loading="lazy" />
                  <div>
                    <p className="m-0 text-base font-bold text-navy-900">{agent.name}</p>
                    <p className="m-0 text-xs text-ink-faint">{agent.title}</p>
                  </div>
                </div>
                <ul className="mb-6 grid gap-2.5 text-sm text-ink-soft">
                  <li>
                    <a href={agent.phoneHref} className="flex items-center gap-2.5 text-inherit hover:text-navy-700">
                      <Icon name="phone" />
                      {agent.phone}
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2.5 text-inherit hover:text-navy-700">
                      <Icon name="mail" />
                      {agent.email}
                    </a>
                  </li>
                  <li>
                    <a href={agent.website} className="flex items-center gap-2.5 text-inherit underline hover:text-navy-700">
                      <Icon name="link" />
                      {agent.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                </ul>
                <PropertyInquiryForm propertyTitle={property.title} listingId={property.listingId} />
              </div>

              <div className={cn(CARD, "reveal p-6")}>
                <h2 className="mb-3 text-base font-bold text-navy-900">Schedule a Private Tour</h2>
                <p className="mb-5 text-sm text-ink-faint">Call Sean directly to book an in-person or virtual showing within 24 hours.</p>
                <a href={agent.phoneHref} className="btn btn-ghost-dark btn-block">
                  <Icon name="phone" />
                  {agent.phone}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {relatedProperties.length > 0 ? (
        <section className={cn(SECTION, "bg-cream")}>
          <div className="site-container">
            <div className="reveal mx-auto mb-12 text-center">
              <Eyebrow center>You May Also Like</Eyebrow>
              <h2 className="text-h3">Similar Homes Nearby</h2>
            </div>
            <div data-stagger="80" className="reveal reveal-group grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {relatedProperties.map((related) => (
                <div key={related.slug}>
                  <PropertyCard property={related} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
