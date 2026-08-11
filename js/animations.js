/* ==========================================================================
   Sean Truong Real Estate — animations.js (GSAP + ScrollTrigger)
   Loaded after main.js. Bails out gracefully when GSAP is missing
   (offline / CDN blocked) or the user prefers reduced motion —
   main.js's IntersectionObserver reveal takes over in that case.
   ========================================================================== */

(function () {
  "use strict";

  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap-on");
  gsap.defaults({ ease: "power3.out", duration: 0.6 });

  /* ---------- Hero (home page): entrance + parallax ---------- */
  var hero = document.querySelector(".hero");
  if (hero) {
    var heroBg = hero.querySelector(".hero__bg");
    var tl = gsap.timeline();

    if (heroBg) {
      tl.fromTo(heroBg, { scale: 1.12 }, { scale: 1.06, duration: 1.8, ease: "power2.out" }, 0);
    }
    var heroEyebrow = hero.querySelector(".eyebrow");
    var heroTitle = hero.querySelector("h1");
    var heroLead = hero.querySelector(".lead");
    var searchFields = hero.querySelectorAll(".search-bar > *");

    if (heroEyebrow) tl.from(heroEyebrow, { y: 22, opacity: 0, duration: 0.5 }, 0.15);
    if (heroTitle) tl.from(heroTitle, { y: 34, opacity: 0, duration: 0.7 }, 0.25);
    if (heroLead) tl.from(heroLead, { y: 24, opacity: 0, duration: 0.6 }, 0.4);
    if (searchFields.length) {
      tl.from(searchFields, { y: 26, opacity: 0, duration: 0.5, stagger: 0.06, clearProps: "all" }, 0.55);
    }

    if (heroBg) {
      gsap.to(heroBg, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.5 }
      });
    }
  }

  /* ---------- Page hero (inner pages): entrance ---------- */
  var pageHero = document.querySelector(".page-hero");
  if (pageHero) {
    gsap.from(pageHero.querySelectorAll("h1, .breadcrumb"), {
      y: 18, opacity: 0, stagger: 0.1, duration: 0.55, clearProps: "all"
    });
  }

  /* ---------- Detail page: header, gallery ---------- */
  var detailHeader = document.querySelector(".detail-header");
  if (detailHeader) {
    gsap.from(detailHeader.children, { y: 18, opacity: 0, stagger: 0.1, clearProps: "all" });
  }

  var gallery = document.querySelector(".gallery");
  if (gallery) {
    var galleryMainWrap = gallery.querySelector(".gallery__main");
    var thumbs = gallery.querySelectorAll(".gallery__thumbs button");
    if (galleryMainWrap) {
      gsap.from(galleryMainWrap, { opacity: 0, scale: 0.985, duration: 0.7, clearProps: "all" });
    }
    if (thumbs.length) {
      gsap.from(thumbs, { y: 14, opacity: 0, stagger: 0.05, duration: 0.4, delay: 0.25, clearProps: "all" });
    }
  }

  // Crossfade the main photo when a thumbnail is clicked
  // (runs after main.js's handler has already swapped the src)
  var galleryMain = document.getElementById("galleryMain");
  var galleryThumbsWrap = document.getElementById("galleryThumbs");
  if (galleryMain && galleryThumbsWrap) {
    galleryThumbsWrap.addEventListener("click", function (e) {
      if (!e.target.closest("button[data-full]")) return;
      gsap.fromTo(galleryMain,
        { opacity: 0.35, scale: 1.015 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power1.out", clearProps: "all" });
    });
  }

  /* ---------- Grids: staggered card reveals on scroll ---------- */
  gsap.utils.toArray(".grid-3, .grid-4, .grid-2, .feature-grid").forEach(function (grid) {
    if (!grid.children.length) return;
    gsap.from(grid.children, {
      y: 28,
      opacity: 0,
      duration: 0.55,
      stagger: 0.08,
      clearProps: "all", // keep CSS hover transforms working afterwards
      scrollTrigger: { trigger: grid, start: "top 85%", once: true }
    });
  });

  /* ---------- Standalone blocks: gentle fade-up on scroll ---------- */
  gsap.utils.toArray(
    ".section-head, .cta-band, .stats-strip .container, .detail-card, .agent-box, .info-card, .filter-panel, .results-toolbar, .map-placeholder, .about-split__photo, .about-split__body"
  ).forEach(function (el) {
    gsap.from(el, {
      y: 22,
      opacity: 0,
      duration: 0.55,
      clearProps: "all",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* ---------- Overview items (detail page): quick stagger ---------- */
  var overview = document.querySelector(".overview-grid");
  if (overview) {
    gsap.from(overview.children, {
      y: 14, opacity: 0, duration: 0.35, stagger: 0.06, clearProps: "all",
      scrollTrigger: { trigger: overview, start: "top 90%", once: true }
    });
  }

  /* ---------- Amenities list (detail page): subtle stagger ---------- */
  var amenities = document.querySelector(".amenities");
  if (amenities) {
    gsap.from(amenities.children, {
      x: -12, opacity: 0, duration: 0.3, stagger: 0.04, clearProps: "all",
      scrollTrigger: { trigger: amenities, start: "top 90%", once: true }
    });
  }

  /* ---------- Footer columns ---------- */
  var footerMain = document.querySelector(".footer-main");
  if (footerMain) {
    gsap.from(footerMain.children, {
      y: 24, opacity: 0, duration: 0.5, stagger: 0.1, clearProps: "all",
      scrollTrigger: { trigger: footerMain, start: "top 92%", once: true }
    });
  }

  /* ---------- Recalculate positions once images finish loading ---------- */
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
