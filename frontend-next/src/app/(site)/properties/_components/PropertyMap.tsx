"use client";

/**
 * Bản đồ tìm nhà kiểu Zillow (MapLibre): gộp nhà thành cụm có số khi zoom xa, ghim giá ($1.3M) khi zoom gần; bấm cụm để zoom vào,
 * bấm ghim để xem thẻ nhà; kéo / zoom thì báo khung đang xem để danh sách lọc theo.
 * Dùng bởi: properties/_components/PropertySearch.tsx.
 * Lưu ý: MapLibre nạp động trong useEffect (không chạy phía server). Chỉ lần di chuyển do người dùng (có originalEvent) mới gọi
 * onBoundsChange — fitBounds tự động không làm danh sách lọc lại. Ghim đang chọn / đang rê chuột vẽ ở lớp riêng (ACTIVE_PIN_LAYER) để
 * nổi lên trên. fitKey đổi thì bản đồ tự canh khung vừa các điểm mới. Cấu hình nền / màu ở src/config/map.ts.
 * CSS của MapLibre không nằm trong layer nên đè class Tailwind trên chính thẻ bản đồ (.maplibregl-map ép position: relative) —
 * vì vậy khung định vị là thẻ bọc ngoài, thẻ bản đồ chỉ h-full w-full.
 */
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, MapLayerMouseEvent } from "maplibre-gl";
import { formatShortPrice } from "@/app/(site)/_lib/property-format";
import { CALIFORNIA_BOUNDS, MAP_COLORS, MAP_FONT, MAP_STYLE_URL } from "@/config/map";
import type { MapPoint } from "@/types/property";

const SOURCE_ID = "properties";
const CLUSTER_LAYER = "property-clusters";
const CLUSTER_COUNT_LAYER = "property-cluster-counts";
const PIN_LAYER = "property-pins";
const ACTIVE_PIN_LAYER = "property-pins-active";
const PIN_IMAGE = "price-pin";
const ACTIVE_PIN_IMAGE = "price-pin-active";
const PIN_PIXEL_RATIO = 2;

type PointCollection = GeoJSON.FeatureCollection<GeoJSON.Point, { id: number; price: number; label: string }>;

function toPointCollection(points: MapPoint[]): PointCollection {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.longitude, point.latitude] },
      properties: { id: point.id, price: point.price, label: formatShortPrice(point.price) },
    })),
  };
}

function toBoundsParam(map: MapLibreMap): string {
  const bounds = map.getBounds();
  return [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()]
    .map((value) => value.toFixed(5))
    .join(",");
}

function parseBoundsParam(value: string | undefined): [[number, number], [number, number]] | null {
  const parts = value?.split(",").map(Number);
  if (!parts || parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) return null;
  const [south, west, north, east] = parts;
  return [
    [west, south],
    [east, north],
  ];
}

function createPinImage(fill: string): ImageData {
  const width = 36 * PIN_PIXEL_RATIO;
  const height = 24 * PIN_PIXEL_RATIO;
  const radius = 6 * PIN_PIXEL_RATIO;
  const border = 1.5 * PIN_PIXEL_RATIO;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d")!;
  context.beginPath();
  context.roundRect(border / 2, border / 2, width - border, height - border, radius);
  context.fillStyle = fill;
  context.fill();
  context.lineWidth = border;
  context.strokeStyle = MAP_COLORS.pinBorder;
  context.stroke();
  return context.getImageData(0, 0, width, height);
}

function addPinImages(map: MapLibreMap) {
  const stretchOptions = {
    pixelRatio: PIN_PIXEL_RATIO,
    stretchX: [[14, 58]] as [number, number][],
    stretchY: [[14, 34]] as [number, number][],
    content: [12, 8, 60, 40] as [number, number, number, number],
  };
  map.addImage(PIN_IMAGE, createPinImage(MAP_COLORS.pin), stretchOptions);
  map.addImage(ACTIVE_PIN_IMAGE, createPinImage(MAP_COLORS.pinActive), stretchOptions);
}

function addPropertyLayers(map: MapLibreMap, points: MapPoint[]) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: toPointCollection(points),
    cluster: true,
    clusterRadius: 52,
    clusterMaxZoom: 13,
  });
  map.addLayer({
    id: CLUSTER_LAYER,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": MAP_COLORS.cluster,
      "circle-opacity": 0.92,
      "circle-radius": ["step", ["get", "point_count"], 17, 10, 21, 50, 26, 200, 32],
      "circle-stroke-width": 3,
      "circle-stroke-color": MAP_COLORS.clusterBorder,
    },
  });
  map.addLayer({
    id: CLUSTER_COUNT_LAYER,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": MAP_FONT,
      "text-size": 13,
      "text-allow-overlap": true,
    },
    paint: { "text-color": "#FFFFFF" },
  });
  const pinLayout = {
    "icon-text-fit": "both" as const,
    "icon-text-fit-padding": [3, 7, 3, 7] as [number, number, number, number],
    "text-field": ["get", "label"] as ["get", string],
    "text-font": MAP_FONT,
    "text-size": 12,
    "icon-allow-overlap": true,
    "text-allow-overlap": true,
    "symbol-sort-key": ["get", "price"] as ["get", string],
  };
  map.addLayer({
    id: PIN_LAYER,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    layout: { ...pinLayout, "icon-image": PIN_IMAGE },
    paint: { "text-color": "#FFFFFF" },
  });
  map.addLayer({
    id: ACTIVE_PIN_LAYER,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["in", ["get", "id"], ["literal", []]],
    layout: { ...pinLayout, "icon-image": ACTIVE_PIN_IMAGE },
    paint: { "text-color": "#FFFFFF" },
  });
}

function fitMapToPoints(map: MapLibreMap, points: MapPoint[]) {
  if (points.length === 0) return;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const point of points) {
    west = Math.min(west, point.longitude);
    east = Math.max(east, point.longitude);
    south = Math.min(south, point.latitude);
    north = Math.max(north, point.latitude);
  }
  map.fitBounds(
    [
      [west, south],
      [east, north],
    ],
    { padding: { top: 72, bottom: 56, left: 56, right: 56 }, maxZoom: 14, duration: 700 },
  );
}

export function PropertyMap({
  points,
  fitKey,
  initialBounds,
  activeIds,
  isVisible,
  onBoundsChange,
  onSelect,
}: {
  points: MapPoint[];
  fitKey: number;
  initialBounds?: string;
  activeIds: number[];
  isVisible: boolean;
  onBoundsChange: (bounds: string) => void;
  onSelect: (id: number | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const pointsRef = useRef(points);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onSelectRef = useRef(onSelect);
  const fittedKeyRef = useRef(initialBounds ? fitKey : -1);
  const [isReady, setIsReady] = useState(false);

  pointsRef.current = points;
  onBoundsChangeRef.current = onBoundsChange;
  onSelectRef.current = onSelect;

  useEffect(() => {
    let isDisposed = false;
    let map: MapLibreMap | null = null;

    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (isDisposed || !containerRef.current) return;
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        bounds: parseBoundsParam(initialBounds) ?? CALIFORNIA_BOUNDS,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      mapRef.current = map;

      map.on("load", () => {
        if (!map) return;
        addPinImages(map);
        addPropertyLayers(map, pointsRef.current);
        setIsReady(true);
      });

      map.on("click", CLUSTER_LAYER, async (event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        const source = map?.getSource<GeoJSONSource>(SOURCE_ID);
        if (!map || !feature || !source || feature.geometry.type !== "Point") return;
        const zoom = await source.getClusterExpansionZoom(Number(feature.properties?.cluster_id));
        map.easeTo(
          { center: feature.geometry.coordinates as [number, number], zoom: Math.min(zoom + 0.5, 16) },
          { originalEvent: event.originalEvent },
        );
      });

      const handlePinClick = (event: MapLayerMouseEvent) => {
        const id = Number(event.features?.[0]?.properties?.id);
        if (Number.isFinite(id)) onSelectRef.current(id);
      };
      map.on("click", PIN_LAYER, handlePinClick);
      map.on("click", ACTIVE_PIN_LAYER, handlePinClick);

      map.on("click", (event) => {
        const hitFeatures = map?.queryRenderedFeatures(event.point, {
          layers: [CLUSTER_LAYER, PIN_LAYER, ACTIVE_PIN_LAYER],
        });
        if (!hitFeatures?.length) onSelectRef.current(null);
      });

      for (const layer of [CLUSTER_LAYER, PIN_LAYER, ACTIVE_PIN_LAYER]) {
        map.on("mouseenter", layer, () => {
          if (map) map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          if (map) map.getCanvas().style.cursor = "";
        });
      }

      map.on("moveend", (event) => {
        if (map && "originalEvent" in event && event.originalEvent) onBoundsChangeRef.current(toBoundsParam(map));
      });
    });

    return () => {
      isDisposed = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [initialBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isReady || !map) return;
    map.getSource<GeoJSONSource>(SOURCE_ID)?.setData(toPointCollection(points));
    if (fittedKeyRef.current !== fitKey && points.length > 0) {
      fittedKeyRef.current = fitKey;
      fitMapToPoints(map, points);
    }
  }, [isReady, points, fitKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isReady || !map) return;
    map.setFilter(ACTIVE_PIN_LAYER, ["in", ["get", "id"], ["literal", activeIds]]);
  }, [isReady, activeIds]);

  useEffect(() => {
    if (isVisible) mapRef.current?.resize();
  }, [isVisible]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
