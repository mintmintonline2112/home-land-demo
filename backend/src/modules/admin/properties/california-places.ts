/**
 * Khung toạ độ (trên đất liền) của các thành phố Orange County và Bay Area, dùng để gán toạ độ cho nhà mẫu / nhà demo
 * mà không cần gọi geocoding; coordinatesOf trả cùng một điểm cho cùng một khoá nên chạy lại seed không làm nhà "nhảy chỗ".
 * Dùng bởi: properties.service.ts (cityCenterOf — toạ độ dự phòng khi geocoding không tìm thấy địa chỉ), database/seeding/seeds/property.seed.ts,
 * src/scripts/demo-listings.ts.
 * Lưu ý: khung được thu hẹp để tránh rơi xuống biển / vịnh (Newport, Huntington, San Francisco, Oakland); chỉ là vị trí gần đúng.
 */
import type { PropertyRegion } from './entities/property.entity';

export type PlaceBox = {
  region: PropertyRegion;
  south: number;
  north: number;
  west: number;
  east: number;
};

export const CALIFORNIA_PLACES: Record<string, PlaceBox> = {
  Irvine: { region: 'orange-county', south: 33.64, north: 33.72, west: -117.84, east: -117.74 },
  'Newport Beach': { region: 'orange-county', south: 33.615, north: 33.66, west: -117.89, east: -117.83 },
  Tustin: { region: 'orange-county', south: 33.72, north: 33.77, west: -117.84, east: -117.79 },
  'Villa Park': { region: 'orange-county', south: 33.808, north: 33.825, west: -117.825, east: -117.8 },
  'Anaheim Hills': { region: 'orange-county', south: 33.84, north: 33.87, west: -117.79, east: -117.72 },
  Orange: { region: 'orange-county', south: 33.77, north: 33.81, west: -117.87, east: -117.82 },
  'Garden Grove': { region: 'orange-county', south: 33.76, north: 33.79, west: -117.97, east: -117.92 },
  Westminster: { region: 'orange-county', south: 33.74, north: 33.77, west: -118.01, east: -117.96 },
  'Costa Mesa': { region: 'orange-county', south: 33.65, north: 33.69, west: -117.93, east: -117.89 },
  'Huntington Beach': { region: 'orange-county', south: 33.67, north: 33.72, west: -118.01, east: -117.96 },
  'Fountain Valley': { region: 'orange-county', south: 33.69, north: 33.72, west: -117.97, east: -117.93 },
  'San Francisco': { region: 'bay-area', south: 37.735, north: 37.79, west: -122.48, east: -122.41 },
  'San Jose': { region: 'bay-area', south: 37.28, north: 37.37, west: -121.93, east: -121.82 },
  'Palo Alto': { region: 'bay-area', south: 37.42, north: 37.45, west: -122.16, east: -122.12 },
  'Mountain View': { region: 'bay-area', south: 37.37, north: 37.4, west: -122.1, east: -122.06 },
  Sunnyvale: { region: 'bay-area', south: 37.35, north: 37.38, west: -122.05, east: -122.0 },
  Cupertino: { region: 'bay-area', south: 37.3, north: 37.33, west: -122.06, east: -122.02 },
  'Santa Clara': { region: 'bay-area', south: 37.34, north: 37.37, west: -121.98, east: -121.95 },
  Oakland: { region: 'bay-area', south: 37.79, north: 37.83, west: -122.25, east: -122.2 },
  Berkeley: { region: 'bay-area', south: 37.855, north: 37.885, west: -122.275, east: -122.25 },
  Fremont: { region: 'bay-area', south: 37.52, north: 37.57, west: -122.0, east: -121.94 },
};

function hashToUnitPair(key: string): [number, number] {
  let first = 2166136261;
  let second = 5381;
  for (let i = 0; i < key.length; i++) {
    const code = key.charCodeAt(i);
    first = Math.imul(first ^ code, 16777619) >>> 0;
    second = (Math.imul(second, 33) + code) >>> 0;
  }
  return [first / 4294967295, second / 4294967295];
}

export function coordinatesOf(city: string, key: string): { latitude: number; longitude: number } | null {
  const box = CALIFORNIA_PLACES[city];
  if (!box) return null;
  const [latitudeShare, longitudeShare] = hashToUnitPair(`${city}:${key}`);
  return {
    latitude: Number((box.south + (box.north - box.south) * latitudeShare).toFixed(6)),
    longitude: Number((box.west + (box.east - box.west) * longitudeShare).toFixed(6)),
  };
}

export function cityCenterOf(city: string | null | undefined): { latitude: number; longitude: number } | null {
  const box = city ? CALIFORNIA_PLACES[city.trim()] : undefined;
  if (!box) return null;
  return {
    latitude: Number(((box.south + box.north) / 2).toFixed(6)),
    longitude: Number(((box.west + box.east) / 2).toFixed(6)),
  };
}
