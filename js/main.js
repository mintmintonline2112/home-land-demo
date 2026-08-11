/* ==========================================================================
   Sean Truong Real Estate — main.js
   Handles: mobile menu, header, counters, reveal, tabs, favorites,
   gallery, listing filters, form validation, back-to-top
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // When GSAP is available, animations.js owns the reveal effects
  var gsapActive = !!(window.gsap && window.ScrollTrigger) && !prefersReducedMotion;

  /* ---------- 1. Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    document.addEventListener("click", function (e) {
      if (mainNav.classList.contains("is-open") &&
          !mainNav.contains(e.target) &&
          !navToggle.contains(e.target)) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  /* ---------- 1b. Dropdown menus (click toggle — accordion on mobile, tap support on desktop) ---------- */
  document.querySelectorAll(".has-dropdown > .nav-link").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.parentElement;
      var wasOpen = li.classList.contains("is-open");
      // Close sibling dropdowns
      document.querySelectorAll(".has-dropdown.is-open").forEach(function (other) {
        if (other !== li) {
          other.classList.remove("is-open");
          var b = other.querySelector(".nav-link");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
      li.classList.toggle("is-open", !wasOpen);
      btn.setAttribute("aria-expanded", !wasOpen ? "true" : "false");
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) {
      document.querySelectorAll(".has-dropdown.is-open").forEach(function (li) {
        li.classList.remove("is-open");
        var b = li.querySelector(".nav-link");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* ---------- 2. Header shadow on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var backToTop = document.getElementById("backToTop");
  var scrollTick = false;

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
    if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 500);
    scrollTick = false;
  }

  window.addEventListener("scroll", function () {
    if (!scrollTick) {
      scrollTick = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 3. Reveal on scroll (fallback when GSAP is absent) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !gsapActive) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- 4. Stats counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString("en-US") + "+";
        return;
      }
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-US") + (progress === 1 ? "+" : "");
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- 5. Filter tabs (home page — by region) ---------- */
  var tabWrap = document.querySelector(".filter-tabs");
  var featuredGrid = document.getElementById("featuredGrid");
  if (tabWrap && featuredGrid) {
    tabWrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      tabWrap.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.getAttribute("data-filter");
      featuredGrid.querySelectorAll(".property-card").forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-region") === filter;
        card.style.display = show ? "" : "none";
      });
    });
  }

  /* ---------- 6. Favorite buttons (localStorage) ---------- */
  var FAV_KEY = "seantruong_favs";
  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch (e) { return []; }
  }
  var favButtons = document.querySelectorAll(".fav-btn[data-fav]");
  if (favButtons.length) {
    var favs = getFavs();
    favButtons.forEach(function (btn) {
      var id = btn.getAttribute("data-fav");
      if (favs.indexOf(id) !== -1) btn.classList.add("is-active");
      btn.addEventListener("click", function () {
        var current = getFavs();
        var idx = current.indexOf(id);
        if (idx === -1) { current.push(id); } else { current.splice(idx, 1); }
        try { localStorage.setItem(FAV_KEY, JSON.stringify(current)); } catch (e) { /* private mode */ }
        // Sync every button with the same id on the page
        document.querySelectorAll('.fav-btn[data-fav="' + id + '"]').forEach(function (b) {
          b.classList.toggle("is-active", idx === -1);
        });
      });
    });
  }

  /* ---------- 7. Gallery (detail page) ---------- */
  var galleryMain = document.getElementById("galleryMain");
  var galleryThumbs = document.getElementById("galleryThumbs");
  if (galleryMain && galleryThumbs) {
    galleryThumbs.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-full]");
      if (!btn) return;
      galleryThumbs.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      galleryMain.src = btn.getAttribute("data-full");
      var thumbImg = btn.querySelector("img");
      if (thumbImg) galleryMain.alt = thumbImg.alt;
    });
  }

  /* ---------- 8. Filters + sorting (listings page) ---------- */
  var filterForm = document.getElementById("filterForm");
  var listingGrid = document.getElementById("listingGrid");

  if (filterForm && listingGrid) {
    var fKeyword = document.getElementById("fKeyword");
    var fType = document.getElementById("fType");
    var fBeds = document.getElementById("fBeds");
    var fPrice = document.getElementById("fPrice");
    var outPrice = document.getElementById("outPrice");
    var sortSelect = document.getElementById("sortSelect");
    var resultCount = document.getElementById("resultCount");
    var noResults = document.getElementById("noResults");
    var cards = Array.prototype.slice.call(listingGrid.querySelectorAll(".property-card"));

    function fmtPrice(v) {
      return v >= 1000000
        ? "$" + (v / 1000000).toFixed(1) + "M"
        : "$" + Math.round(v / 1000) + "k";
    }

    // Live slider label
    if (fPrice && outPrice) {
      fPrice.addEventListener("input", function () {
        outPrice.textContent = fmtPrice(parseFloat(fPrice.value));
      });
    }

    function normalize(str) {
      var s = (str || "").toLowerCase().normalize("NFD");
      var out = "";
      for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        if (code >= 0x0300 && code <= 0x036f) continue; // strip diacritics
        out += s[i];
      }
      return out;
    }

    function applyFilters() {
      var kw = normalize(fKeyword.value.trim());
      var type = fType.value;
      var minBeds = parseInt(fBeds.value, 10) || 0;
      var maxPrice = fPrice ? parseFloat(fPrice.value) : Infinity;
      var visible = 0;

      cards.forEach(function (card) {
        var cType = card.getAttribute("data-type");
        var cBeds = parseInt(card.getAttribute("data-beds"), 10) || 0;
        var cPrice = parseFloat(card.getAttribute("data-price")) || 0;
        var text = normalize(card.textContent);

        var ok = true;
        if (kw && text.indexOf(kw) === -1) ok = false;
        if (type && cType !== type) ok = false;
        if (minBeds && cBeds < minBeds) ok = false;
        if (cPrice > maxPrice) ok = false;

        card.style.display = ok ? "" : "none";
        if (ok) visible++;
      });

      if (resultCount) resultCount.textContent = visible;
      if (noResults) noResults.hidden = visible !== 0;
    }

    function applySort() {
      var mode = sortSelect.value;
      var sorted = cards.slice().sort(function (a, b) {
        function priceOf(el) {
          return parseFloat(el.getAttribute("data-price")) || 0;
        }
        switch (mode) {
          case "price-asc": return priceOf(a) - priceOf(b);
          case "price-desc": return priceOf(b) - priceOf(a);
          case "area-desc": return (parseFloat(b.getAttribute("data-area")) || 0) - (parseFloat(a.getAttribute("data-area")) || 0);
          default: // newest
            return new Date(b.getAttribute("data-date")) - new Date(a.getAttribute("data-date"));
        }
      });
      sorted.forEach(function (card) { listingGrid.appendChild(card); });
    }

    filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      applyFilters();
    });

    [fType, fBeds, fPrice].forEach(function (el) {
      if (el) el.addEventListener("change", applyFilters);
    });

    var kwTimer;
    fKeyword.addEventListener("input", function () {
      clearTimeout(kwTimer);
      kwTimer = setTimeout(applyFilters, 300);
    });

    if (sortSelect) sortSelect.addEventListener("change", applySort);

    var resetBtn = document.getElementById("resetFilters");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        filterForm.reset();
        if (outPrice && fPrice) outPrice.textContent = fmtPrice(parseFloat(fPrice.max));
        applyFilters();
      });
    }

    // Pick up search params from the home page (?keyword=&type=)
    var params = new URLSearchParams(window.location.search);
    var hasParams = false;
    if (params.get("keyword")) { fKeyword.value = params.get("keyword"); hasParams = true; }
    if (params.get("type")) { fType.value = params.get("type"); hasParams = true; }
    if (hasParams) applyFilters();

    applySort();
  }

  /* ---------- 9. Form validation ---------- */
  document.querySelectorAll("form.js-validate").forEach(function (form) {
    var successMsg = form.querySelector(".form-success");

    function validateField(input) {
      var field = input.closest(".field");
      if (!field) return true;
      var valid = true;
      var value = input.value.trim();

      if (input.hasAttribute("required") && !value) valid = false;
      if (valid && value && input.type === "email") {
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
      if (valid && value && input.type === "tel") {
        valid = /^[0-9+\s().-]{8,15}$/.test(value);
      }

      field.classList.toggle("has-error", !valid);
      return valid;
    }

    form.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field && field.classList.contains("has-error")) validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = true;
      var firstInvalid = null;

      form.querySelectorAll("input, textarea").forEach(function (input) {
        if (!validateField(input)) {
          allValid = false;
          if (!firstInvalid) firstInvalid = input;
        }
      });

      if (!allValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Static demo: simulate a successful submission
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        var original = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = original;
          if (successMsg) {
            successMsg.classList.add("is-visible");
            successMsg.setAttribute("role", "status");
          }
          form.reset();
          setTimeout(function () {
            if (successMsg) successMsg.classList.remove("is-visible");
          }, 6000);
        }, 800);
      }
    });
  });

})();
