"use client";

/**
 * Nút trái tim "lưu nhà yêu thích" trên thẻ nhà; danh sách đã lưu giữ trong localStorage của trình duyệt.
 * Dùng bởi: property/PropertyCard.tsx.
 * Lưu ý: chưa có tài khoản khách nên chỉ lưu trên máy người xem (key FAVORITES_STORAGE_KEY); nhãn trợ năng tiếng Anh cố định vì site chỉ có tiếng Anh.
 */
import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const FAVORITES_STORAGE_KEY = "seantruongre_favorites";

function readFavorites(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({ slug, className }: { slug: string; className?: string }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(readFavorites().includes(slug));
  }, [slug]);

  function handleToggle() {
    const favorites = readFavorites();
    const nextFavorites = favorites.includes(slug)
      ? favorites.filter((entry) => entry !== slug)
      : [...favorites, slug];
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    } catch {}
    setIsSaved(nextFavorites.includes(slug));
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from favorites" : "Save to favorites"}
      className={cn(
        "grid h-10 w-10 place-items-center border-0 bg-paper text-navy-800 transition-colors duration-200 ease-brand hover:bg-navy-800 hover:text-light",
        isSaved && "bg-navy-800 text-light",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill={isSaved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
}
