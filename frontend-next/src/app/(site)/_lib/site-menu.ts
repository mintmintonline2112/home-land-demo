/**
 * Menu tĩnh của site public (giống backend menu.seed.ts), kèm kiểu dữ liệu mục menu.
 * Dùng bởi: _lib/menu.ts (dự phòng khi API menu lỗi hoặc CMS chưa có dữ liệu), _components/layout/Header.tsx.
 */
import { LUXURY_PRICE_RANGE } from "@/config/property-search";
import { siteRoutes } from "@/config/routes";

export type SiteMenuChild = {
  label: string;
  href: string;
};

export type SiteMenuItem = {
  key: string;
  label: string;
  href: string;
  showSubmenu?: boolean;
  children?: SiteMenuChild[];
};

const areaLink = (label: string, keyword: string): SiteMenuChild => ({
  label,
  href: siteRoutes.propertiesFiltered({ keyword }),
});

export const SITE_MENU_ITEMS: SiteMenuItem[] = [
  {
    key: "buy",
    label: "Buy",
    href: siteRoutes.properties,
    children: [
      { label: "Property Search", href: siteRoutes.properties },
      { label: "Featured Homes", href: siteRoutes.homeSection("featured") },
      { label: "Luxury", href: siteRoutes.propertiesFiltered({ price: LUXURY_PRICE_RANGE }) },
    ],
  },
  {
    key: "sell",
    label: "Sell",
    href: siteRoutes.contactTopic("sell"),
    children: [
      { label: "Home Valuation", href: siteRoutes.homeValuation },
      { label: "Seller Consultation", href: siteRoutes.contactTopic("sell") },
    ],
  },
  { key: "orange-county", label: "Orange County", href: siteRoutes.propertiesFiltered({ keyword: "Orange County" }) },
  {
    key: "areas",
    label: "Areas",
    href: siteRoutes.properties,
    children: [
      areaLink("Irvine", "Irvine"),
      areaLink("Newport Beach", "Newport Beach"),
      areaLink("Tustin & North Tustin", "Tustin"),
      areaLink("Villa Park", "Villa Park"),
      areaLink("Anaheim Hills", "Anaheim Hills"),
      areaLink("Orange", "Orange"),
      areaLink("Garden Grove", "Garden Grove"),
      areaLink("Westminster (Little Saigon)", "Westminster"),
      areaLink("San Francisco", "San Francisco"),
      areaLink("San Jose", "San Jose"),
      areaLink("Silicon Valley", "Silicon Valley"),
      areaLink("Bay Area", "Bay Area"),
    ],
  },
  {
    key: "blogs",
    label: "Blogs",
    href: siteRoutes.news,
    children: [
      { label: "Market Updates", href: siteRoutes.newsCategory("market-update") },
      { label: "Buyer & Seller Guides", href: siteRoutes.newsCategory("guides") },
      { label: "Relocation", href: siteRoutes.newsCategory("relocation") },
    ],
  },
  { key: "about", label: "About Sean", href: siteRoutes.about },
  { key: "contact", label: "Contact", href: siteRoutes.contact },
];
