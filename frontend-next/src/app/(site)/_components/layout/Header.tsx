"use client";

/**
 * Header site public: thanh trắng dính đầu trang — logo, menu CMS có menu thả xuống (mục nhiều con chia 2 cột; mục trỏ tới /news là
 * menu Blogs có tab danh mục + bài mới, xem BlogMenuPanel.tsx), nút "Schedule Consultation".
 * Dùng bởi: app/(site)/layout.tsx.
 * Lưu ý: chiều cao thanh = biến CSS --header-height (styles/base.css) — trang /properties dựa vào đó để bản đồ vừa khít màn hình.
 * Dưới 1100px menu thu vào nút ☰, menu con thành accordion. Mục có con mở bằng bấm (và rê chuột trên desktop);
 * bấm ra ngoài / Esc / đổi trang thì đóng hết. Mục `showSubmenu: false` hiện như link thường dù có con.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SiteMenuItem } from "@/app/(site)/_lib/site-menu";
import { siteRoutes } from "@/config/routes";
import { cn } from "@/utils/cn";
import { isActivePath } from "@/utils/route";
import { BlogMenuPanel, type BlogMenuData } from "./BlogMenuPanel";
import { Brand, type BrandProps } from "./Brand";

const NAV_LINK =
  "relative inline-flex items-center gap-1 border-0 bg-transparent px-0 py-2 text-sm font-medium text-ink-soft transition-colors duration-200 ease-brand hover:text-navy-900 aria-[current=page]:text-navy-900 aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-navy-800 aria-[current=page]:after:content-[''] max-[1100px]:w-full max-[1100px]:justify-between max-[1100px]:border-b max-[1100px]:border-line max-[1100px]:py-3.5 max-[1100px]:text-base";

const DROPDOWN_LINK =
  "block px-4 py-2.5 text-sm text-ink-soft transition-colors duration-150 ease-brand hover:bg-cream hover:text-navy-900 max-[1100px]:px-3 max-[1100px]:py-2";

const MEGA_MENU_MIN_CHILDREN = 8;

const isDesktopViewport = () =>
  window.matchMedia("(min-width: 1101px)").matches;

export function Header({
  menu,
  brand,
  blogMenu,
}: {
  menu: SiteMenuItem[];
  brand?: BrandProps;
  blogMenu?: BlogMenuData;
}) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenKey(null);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsMenuOpen(false);
      setOpenKey(null);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenKey(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const isCurrent = (href: string) =>
    !href.includes("?") && isActivePath(pathname, href, siteRoutes.home);

  return (
    <header
      ref={headerRef}
      id="site-header"
      className={cn(
        "sticky top-0 z-100 border-b border-line bg-paper transition-shadow duration-250 ease-brand",
        isScrolled && "shadow-soft",
      )}
    >
      <div className="mx-auto flex h-(--header-height) w-[min(1320px,100%-3rem)] items-center justify-between gap-6 max-[640px]:w-[min(1320px,100%-2.2rem)]">
        <Brand {...brand} />

        <nav
          id="site-nav"
          aria-label="Primary"
          className={cn(
            "flex items-center gap-7 max-[1280px]:gap-5",
            "max-[1100px]:absolute max-[1100px]:inset-x-0 max-[1100px]:top-full max-[1100px]:max-h-[calc(100vh-5rem)] max-[1100px]:flex-col max-[1100px]:items-stretch max-[1100px]:gap-0 max-[1100px]:overflow-y-auto max-[1100px]:border-b max-[1100px]:border-line max-[1100px]:bg-paper max-[1100px]:px-6 max-[1100px]:pb-6 max-[1100px]:shadow-float",
            isMenuOpen ? "max-[1100px]:flex" : "max-[1100px]:hidden",
          )}
        >
          {menu.map((item) => {
            const children =
              item.showSubmenu === false ? [] : (item.children ?? []);
            const isBlogMenu =
              Boolean(blogMenu) &&
              item.href.split(/[?#]/)[0] === siteRoutes.news;
            if (children.length === 0 && !isBlogMenu) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={NAV_LINK}
                  aria-current={isCurrent(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            }
            const isOpen = openKey === item.key;
            const isMega = children.length >= MEGA_MENU_MIN_CHILDREN;
            return (
              <div
                key={item.key}
                className="relative max-[1100px]:w-full"
                onMouseEnter={() => isDesktopViewport() && setOpenKey(item.key)}
                onMouseLeave={() => isDesktopViewport() && setOpenKey(null)}
              >
                <button
                  type="button"
                  className={NAV_LINK}
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenKey(isOpen && !isDesktopViewport() ? null : item.key)
                  }
                >
                  {item.label}
                  <svg
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                <div
                  className={cn(
                    "absolute top-full left-1/2 z-10 -translate-x-1/2 pt-[calc(var(--header-height)/2-1.125rem)] max-[1100px]:static max-[1100px]:translate-x-0 max-[1100px]:pt-1",
                    isOpen ? "block" : "hidden",
                  )}
                >
                  {isBlogMenu && blogMenu ? (
                    <BlogMenuPanel
                      data={blogMenu}
                      onNavigate={() => setOpenKey(null)}
                    />
                  ) : (
                    <div
                      className={cn(
                        "border border-line bg-paper py-2 shadow-float max-[1100px]:border-0 max-[1100px]:py-0 max-[1100px]:shadow-none",
                        isMega
                          ? "grid w-120 grid-cols-2 max-[1100px]:w-full"
                          : "w-60 max-[1100px]:w-full",
                      )}
                    >
                      {children.map((child) => (
                        <Link
                          key={child.href + child.label}
                          href={child.href}
                          className={DROPDOWN_LINK}
                          onClick={() => setOpenKey(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <Link
            href={siteRoutes.contact}
            className="btn btn-primary hidden text-xs tracking-sm uppercase max-[1100px]:mt-5 max-[1100px]:inline-flex"
          >
            Schedule Consultation
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={siteRoutes.contact}
            className="btn btn-primary text-xs tracking-sm uppercase max-[1100px]:hidden"
          >
            Schedule Consultation
          </Link>
          <button
            type="button"
            className="hidden h-11 w-11 place-items-center border border-line bg-transparent text-navy-900 max-[1100px]:grid"
            aria-expanded={isMenuOpen}
            aria-controls="site-nav"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((wasOpen) => !wasOpen)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
