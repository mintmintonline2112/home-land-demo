"use client";

/**
 * Bản đồ nhỏ ở mục "Location" của trang chi tiết nhà: một ghim navy tại toạ độ của nhà, có nút zoom; cuộn chuột không zoom
 * (tránh kẹt trang khi cuộn) — giữ Ctrl / ⌘ để zoom.
 * Dùng bởi: app/(site)/properties/[slug]/page.tsx.
 * Lưu ý: MapLibre nạp động trong useEffect (không chạy phía server); cấu hình nền / màu ở src/config/map.ts.
 */
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { MAP_COLORS, MAP_STYLE_URL } from "@/config/map";

const LOCATION_ZOOM = 14;

function createPinElement(): HTMLElement {
  const element = document.createElement("div");
  element.style.width = "36px";
  element.style.height = "36px";
  element.innerHTML = `<svg viewBox="0 0 24 24" width="36" height="36" fill="${MAP_COLORS.pin}" stroke="${MAP_COLORS.pinBorder}" stroke-width="1.5" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="${MAP_COLORS.pinBorder}" stroke="none"/></svg>`;
  return element;
}

export function LocationMap({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isDisposed = false;
    let map: MapLibreMap | null = null;
    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (isDisposed || !containerRef.current) return;
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: [longitude, latitude],
        zoom: LOCATION_ZOOM,
        attributionControl: { compact: true },
        cooperativeGestures: true,
        dragRotate: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      new maplibregl.Marker({ element: createPinElement(), anchor: "bottom" }).setLngLat([longitude, latitude]).addTo(map);
    });
    return () => {
      isDisposed = true;
      map?.remove();
    };
  }, [latitude, longitude]);

  return <div ref={containerRef} role="img" aria-label={label} className="aspect-[16/7] w-full bg-cream" />;
}
