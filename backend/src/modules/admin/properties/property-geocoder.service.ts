/**
 * Lấy toạ độ (vĩ độ, kinh độ) từ địa chỉ nhà qua dịch vụ geocoding miễn phí của US Census Bureau, để ghim nhà lên bản đồ website.
 * Dùng bởi: properties.service.ts (khi admin tạo / sửa nhà mà chưa nhập toạ độ).
 * Lưu ý: chỉ tìm được địa chỉ thật ở Mỹ; không tìm thấy, quá thời gian (GEOCODE_TIMEOUT_MS) hay lỗi mạng thì trả null để việc lưu nhà
 * vẫn thành công (nhà không hiện trên bản đồ cho tới khi có toạ độ). Không cần API key.
 */
import { Injectable, Logger } from '@nestjs/common';

export type Coordinates = { latitude: number; longitude: number };

export type GeocodableAddress = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
};

const CENSUS_GEOCODER_URL = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';

const GEOCODE_TIMEOUT_MS = 6000;

type CensusGeocoderResponse = {
  result?: { addressMatches?: Array<{ coordinates?: { x?: number; y?: number } }> };
};

@Injectable()
export class PropertyGeocoderService {
  private readonly logger = new Logger(PropertyGeocoderService.name);

  async geocode(location: GeocodableAddress): Promise<Coordinates | null> {
    if (!location.address?.trim() || !location.city?.trim()) return null;
    const oneLineAddress = [location.address, location.city, `${location.state ?? 'CA'} ${location.zip ?? ''}`.trim()]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(', ');
    const url = `${CENSUS_GEOCODER_URL}?${new URLSearchParams({
      address: oneLineAddress,
      benchmark: 'Public_AR_Current',
      format: 'json',
    }).toString()}`;

    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS) });
      if (!response.ok) return null;
      const payload = (await response.json()) as CensusGeocoderResponse;
      const coordinates = payload.result?.addressMatches?.[0]?.coordinates;
      if (typeof coordinates?.x !== 'number' || typeof coordinates?.y !== 'number') return null;
      return { latitude: coordinates.y, longitude: coordinates.x };
    } catch (error) {
      this.logger.warn(`Geocoding failed for "${oneLineAddress}": ${(error as Error).message}`);
      return null;
    }
  }
}
