"use client";

/**
 * Mọi hiệu ứng trang trí của site public: hiện dần khi cuộn + so le, đếm số (từ 0, chạy so le theo data-stagger, giữ dấu phẩy nghìn), tách chữ tiêu đề, mở khẩu độ / trượt ảnh (GSAP), nút nam châm, thẻ nghiêng 3D, thanh tiến độ.
 * Dùng bởi: app/(site)/layout.tsx. Chạy lại mỗi lần đổi route; tôn trọng prefers-reduced-motion (riêng đếm số vẫn chạy vì chỉ đổi chữ,
 * không chuyển động — Windows tắt "Animation effects" là Chrome báo reduce).
 * Lưu ý: móc trong markup (style ở styles/effects.css): .reveal / .reveal-group (thêm .is-visible), data-stagger="N" (ms),
 * data-count, h1[data-headline], .photo-frame img, .news-card-thumb img, .news-featured-photo img, .btn-gold, .tilt-card.
 * Đổi tên các class / thuộc tính này phải sửa cả component dùng chúng.
 */
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SiteEffects() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasFinePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const cleanups: Array<() => void> = [];

    document
      .querySelectorAll<HTMLElement>("[data-stagger]")
      .forEach((group) => {
        const step = Number(group.dataset.stagger) || 0;
        Array.from(group.children).forEach((child, i) => {
          (child as HTMLElement).style.setProperty(
            "--reveal-delay",
            `${i * step}ms`,
          );
        });
      });

    const COUNT_UP_MS = 2200;

    function countUpDelayOf(counter: HTMLElement) {
      const staggerItem = counter.closest("[data-stagger] > *");
      return staggerItem ? Number.parseFloat(getComputedStyle(staggerItem).getPropertyValue("--reveal-delay")) || 0 : 0;
    }

    function runCountUp(element: Element) {
      const counter = element as HTMLElement;
      const target = Number.parseInt(counter.getAttribute("data-count") ?? "", 10);
      if (!Number.isFinite(target) || counter.dataset.counted) return;
      counter.dataset.counted = "true";
      const delay = countUpDelayOf(counter);
      let startTime: number | null = null;
      const tick = (now: number) => {
        if (startTime === null) startTime = now + delay;
        const progress = Math.min(Math.max((now - startTime) / COUNT_UP_MS, 0), 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        if (counter.firstChild) counter.firstChild.nodeValue = Math.round(eased * target).toLocaleString("en-US");
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    const revealElements = document.querySelectorAll(".reveal");
    let revealObserver: IntersectionObserver | null = null;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      revealElements.forEach((element) => revealObserver?.observe(element));
      cleanups.push(() => revealObserver?.disconnect());
    }

    if ("IntersectionObserver" in window) {
      const counters = document.querySelectorAll<HTMLElement>("[data-count]");
      counters.forEach((counter) => {
        if (!counter.dataset.counted && counter.firstChild) counter.firstChild.nodeValue = "0";
      });
      const countObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            runCountUp(entry.target);
            countObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.6 },
      );
      counters.forEach((counter) => countObserver.observe(counter));
      cleanups.push(() => countObserver.disconnect());
    }

    const progressBar = progressRef.current;
    let progressPending = false;
    const updateProgress = () => {
      if (!progressBar) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${maxScroll > 0 ? window.scrollY / maxScroll : 0})`;
    };
    const handleProgressScroll = () => {
      if (progressPending) return;
      progressPending = true;
      requestAnimationFrame(() => {
        updateProgress();
        progressPending = false;
      });
    };
    window.addEventListener("scroll", handleProgressScroll, { passive: true });
    updateProgress();
    cleanups.push(() => window.removeEventListener("scroll", handleProgressScroll));

    if (!prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
      document.documentElement.classList.add("gsap");

      const headline = document.querySelector<HTMLElement>("h1[data-headline]");
      if (headline && !headline.dataset.split) {
        headline.dataset.split = "true";
        headline.classList.remove("reveal");
        headline.classList.add("is-visible");
        const words = (headline.textContent ?? "").trim().split(/\s+/);
        headline.innerHTML = words
          .map(
            (word) =>
              `<span class="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top"><span class="inline-block will-change-transform">${word}</span></span>`,
          )
          .join(" ");
        gsap.from(headline.querySelectorAll(":scope > span > span"), {
          yPercent: 115,
          rotate: 3,
          duration: 0.9,
          stagger: 0.055,
          ease: "expo.out",
          delay: 0.15,
        });
      }

      document
        .querySelectorAll<HTMLImageElement>(
          ".photo-frame img, .news-card-thumb img, .news-featured-photo img",
        )
        .forEach((img) => {
          const frame = img.closest(
            ".photo-frame, .news-card-thumb, .news-featured-photo",
          );
          gsap.fromTo(
            img,
            { clipPath: "inset(16% 16% 16% 16%)", opacity: 0.3 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: 1,
              duration: 1.25,
              ease: "power3.out",
              scrollTrigger: { trigger: frame, start: "top 88%", once: true },
            },
          );
        });

      document
        .querySelectorAll<HTMLImageElement>(
          ".photo-frame img, .news-featured-photo img",
        )
        .forEach((img) => {
          const frame = img.closest(".photo-frame, .news-featured-photo");
          gsap.fromTo(
            img,
            { yPercent: -11, scale: 1.24 },
            {
              yPercent: 11,
              scale: 1.24,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.4,
              },
            },
          );
        });

      if (hasFinePointer) {
        document.querySelectorAll<HTMLElement>(".btn-gold").forEach((button) => {
          const moveX = gsap.quickTo(button, "x", {
            duration: 0.4,
            ease: "power3.out",
          });
          const moveY = gsap.quickTo(button, "y", {
            duration: 0.4,
            ease: "power3.out",
          });
          const handleMouseMove = (e: MouseEvent) => {
            const rect = button.getBoundingClientRect();
            moveX((e.clientX - rect.left - rect.width / 2) * 0.28);
            moveY((e.clientY - rect.top - rect.height / 2) * 0.4);
          };
          const handleMouseLeave = () => {
            gsap.to(button, {
              x: 0,
              y: 0,
              duration: 0.7,
              ease: "elastic.out(1, 0.45)",
            });
          };
          button.addEventListener("mousemove", handleMouseMove);
          button.addEventListener("mouseleave", handleMouseLeave);
          cleanups.push(() => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
          });
        });
      }

      cleanups.push(() => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      });
    }

    if (!prefersReducedMotion && hasFinePointer) {
      document.querySelectorAll<HTMLElement>(".tilt-card").forEach((card) => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
          const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
          card.style.transform = `perspective(900px) translateY(-4px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
        };
        const handleMouseLeave = () => {
          card.style.transform = "";
        };
        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", handleMouseMove);
          card.removeEventListener("mouseleave", handleMouseLeave);
        });
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [pathname]);

  return (
    <div
      ref={progressRef}
      className="pointer-events-none fixed inset-x-0 top-0 z-300 h-[3px] origin-[0_50%] [transform:scaleX(0)] bg-[linear-gradient(90deg,var(--gold-500),var(--gold-300))]"
      aria-hidden="true"
    />
  );
}
