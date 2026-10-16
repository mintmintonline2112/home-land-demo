/**
 * Seed 31 nhà đăng bán mẫu (9 nhà của bản demo homeland + 22 nhà thêm cho đủ nội dung) ở Orange County và Bay Area; ảnh tạm là link Unsplash.
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo slug — nhà đã có (kể cả admin đã sửa / xoá mềm) giữ nguyên, nên chạy lại db:seed an toàn; riêng nhà chưa có
 * toạ độ thì được bổ sung toạ độ gần đúng theo thành phố (modules/admin/properties/california-places.ts) để hiện trên bản đồ.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Property } from 'src/modules/admin/properties/entities/property.entity';
import { coordinatesOf } from 'src/modules/admin/properties/california-places';

const DEMO_PROPERTIES: DeepPartial<Property>[] = [
  {
    "title": "Turtle Rock Estate",
    "slug": "turtle-rock-estate",
    "listingId": "ST-2026-0812",
    "status": "For Sale",
    "type": "luxury",
    "typeLabel": "Single-Family Estate",
    "region": "orange-county",
    "neighborhood": "Turtle Rock",
    "city": "Irvine",
    "state": "CA",
    "zip": "92603",
    "address": "12 Sendero",
    "price": 1850000,
    "beds": 5,
    "baths": 4,
    "sqft": 3800,
    "lotSize": "0.30 acres",
    "garage": 3,
    "stories": 2,
    "yearBuilt": 2018,
    "facing": "Southeast",
    "hoa": "$250 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-08-01",
    "description": "Nestled in Irvine's prestigious Turtle Rock community, this beautifully updated estate offers panoramic hillside views, award-winning schools, and quick access to UC Irvine, fine dining, and the coast. The open-concept design floods every room with California sunshine.\n\nThe main level features a dramatic two-story foyer, a chef's kitchen with a large center island, and a great room that opens to a resort-style backyard with pool, spa, and covered California room. Upstairs, the primary suite offers a spa bath, walk-in closet, and a private view balcony. A main-floor bedroom and full bath complete the layout — perfect for guests or multi-generational living.",
    "amenities": [
      "Pool & Spa",
      "Panoramic Views",
      "3-Car Garage",
      "Central A/C & Heating",
      "Main-Floor Bedroom",
      "Chef's Kitchen",
      "Award-Winning Schools",
      "Near UC Irvine",
      "Low HOA"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80",
        "alt": "Estate exterior with pool"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 1
  },
  {
    "title": "Newport Harbor View Home",
    "slug": "newport-harbor-view-home",
    "listingId": "ST-2026-0815",
    "status": "For Sale",
    "type": "luxury",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": null,
    "city": "Newport Beach",
    "state": "CA",
    "zip": "92660",
    "address": "2201 Harbor View Dr",
    "price": 2400000,
    "beds": 4,
    "baths": 4,
    "sqft": 3200,
    "lotSize": "0.18 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2015,
    "facing": "West",
    "hoa": "None",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-08-05",
    "description": "A light-filled contemporary home minutes from Newport Harbor, with sweeping water views from the main living level and the primary suite.\n\nWalls of glass open to an entertainer's backyard with pool and outdoor kitchen, while the upper level offers four generous bedrooms.",
    "amenities": [
      "Harbor Views",
      "Pool",
      "Outdoor Kitchen",
      "Smart Home",
      "Walk to Beach",
      "2-Car Garage"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern home with pool at dusk"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 2
  },
  {
    "title": "Anaheim Hills View Home",
    "slug": "anaheim-hills-view-home",
    "listingId": "ST-2026-0818",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": null,
    "city": "Anaheim Hills",
    "state": "CA",
    "zip": "92807",
    "address": "5420 E Vista Ridge",
    "price": 1150000,
    "beds": 4,
    "baths": 3,
    "sqft": 2600,
    "lotSize": "0.22 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2004,
    "facing": "North",
    "hoa": "$120 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-08-08",
    "description": "A spacious two-story home on a quiet cul-de-sac with city-light views and a sparkling pool.\n\nUpdated kitchen, family room with fireplace, and an upstairs primary suite with a view deck.",
    "amenities": [
      "City-Light Views",
      "Pool",
      "Cul-de-Sac",
      "Updated Kitchen",
      "Fireplace",
      "Near Golf Course"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80",
        "alt": "Two-story family home"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 3
  },
  {
    "title": "Charming Craftsman",
    "slug": "charming-craftsman",
    "listingId": "ST-2026-0802",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": "Old Towne",
    "city": "Orange",
    "state": "CA",
    "zip": "92866",
    "address": "318 E Palmyra Ave",
    "price": 875000,
    "beds": 3,
    "baths": 2,
    "sqft": 1800,
    "lotSize": "0.16 acres",
    "garage": 1,
    "stories": 1,
    "yearBuilt": 1924,
    "facing": "South",
    "hoa": "None",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-07-20",
    "description": "A lovingly restored 1920s Craftsman in the heart of Old Towne Orange, steps from the Plaza's cafés and antique shops.\n\nOriginal built-ins and hardwood floors pair with a modern kitchen and a deep backyard with mature trees.",
    "amenities": [
      "Historic District",
      "Hardwood Floors",
      "Original Built-Ins",
      "Large Backyard",
      "Walk to Old Towne Plaza"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
        "alt": "Craftsman house with front yard"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 4
  },
  {
    "title": "Modern Family Home",
    "slug": "modern-family-home",
    "listingId": "ST-2026-0809",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": null,
    "city": "Tustin",
    "state": "CA",
    "zip": "92782",
    "address": "14 Lantern Way",
    "price": 980000,
    "beds": 4,
    "baths": 3,
    "sqft": 2400,
    "lotSize": "0.12 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2012,
    "facing": "East",
    "hoa": "$180 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-07-28",
    "description": "A move-in ready family home in Tustin Ranch with an open floor plan and a downstairs bedroom.\n\nClose to top-rated schools, parks, and The District shopping center.",
    "amenities": [
      "Downstairs Bedroom",
      "Open Floor Plan",
      "Community Pool",
      "Near Top Schools",
      "Solar Panels"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern family home exterior"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 5
  },
  {
    "title": "Garden Grove Starter Home",
    "slug": "garden-grove-starter-home",
    "listingId": "ST-2026-0820",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": null,
    "city": "Garden Grove",
    "state": "CA",
    "zip": "92840",
    "address": "11872 Stuart Dr",
    "price": 720000,
    "beds": 3,
    "baths": 2,
    "sqft": 1450,
    "lotSize": "0.14 acres",
    "garage": 2,
    "stories": 1,
    "yearBuilt": 1962,
    "facing": "West",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-09",
    "description": "A well-kept single-story home — an ideal first purchase close to Little Saigon, shopping, and freeways.\n\nUpdated bathrooms, a bright living room, and a large yard with room to expand.",
    "amenities": [
      "Single Story",
      "Large Yard",
      "Near Little Saigon",
      "Updated Bathrooms",
      "No HOA"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
        "alt": "Single-story starter home"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 6
  },
  {
    "title": "Silicon Valley Townhouse",
    "slug": "silicon-valley-townhouse",
    "listingId": "ST-2026-0791",
    "status": "For Sale",
    "type": "townhouse",
    "typeLabel": "Townhouse",
    "region": "bay-area",
    "neighborhood": "Willow Glen",
    "city": "San Jose",
    "state": "CA",
    "zip": "95125",
    "address": "1450 Lincoln Ave #3",
    "price": 1280000,
    "beds": 3,
    "baths": 3,
    "sqft": 1700,
    "lotSize": "—",
    "garage": 2,
    "stories": 3,
    "yearBuilt": 2019,
    "facing": "South",
    "hoa": "$420 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-07-10",
    "description": "A modern three-level townhouse in walkable Willow Glen, close to Lincoln Avenue's restaurants and major tech campuses.\n\nOpen living space with a chef's kitchen, rooftop deck, and an attached two-car garage with EV charger.",
    "amenities": [
      "Rooftop Deck",
      "EV Charger",
      "Walkable Neighborhood",
      "Near Tech Campuses",
      "Attached Garage"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern townhouse interior"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 7
  },
  {
    "title": "Nob Hill Condo",
    "slug": "nob-hill-condo",
    "listingId": "ST-2026-0806",
    "status": "For Sale",
    "type": "condo",
    "typeLabel": "Condominium",
    "region": "bay-area",
    "neighborhood": "Nob Hill",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94109",
    "address": "1200 California St #8B",
    "price": 1050000,
    "beds": 2,
    "baths": 2,
    "sqft": 1100,
    "lotSize": "—",
    "garage": 1,
    "stories": 1,
    "yearBuilt": 1965,
    "facing": "East",
    "hoa": "$950 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-08-03",
    "description": "A bright corner condo on iconic Nob Hill with city views, steps from the cable car line and Grace Cathedral.\n\nRemodeled kitchen and baths, in-unit laundry, and a doorman building with deeded parking.",
    "amenities": [
      "City Views",
      "Doorman Building",
      "In-Unit Laundry",
      "Deeded Parking",
      "Cable Car Line"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80",
        "alt": "Bright city condo"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 8
  },
  {
    "title": "Villa Park Estate",
    "slug": "villa-park-estate",
    "listingId": "ST-2026-0814",
    "status": "For Sale",
    "type": "luxury",
    "typeLabel": "Single-Family Estate",
    "region": "orange-county",
    "neighborhood": null,
    "city": "Villa Park",
    "state": "CA",
    "zip": "92861",
    "address": "9 Hidden Ranch Rd",
    "price": 1980000,
    "beds": 5,
    "baths": 5,
    "sqft": 4200,
    "lotSize": "0.65 acres",
    "garage": 3,
    "stories": 2,
    "yearBuilt": 2009,
    "facing": "West",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-06",
    "description": "A private gated estate on more than half an acre in coveted Villa Park, with resort-style grounds and a pool.\n\nFormal living and dining rooms, a gourmet kitchen, home office, and a guest suite with its own entrance.",
    "amenities": [
      "Gated Estate",
      "Pool",
      "Guest Suite",
      "Home Office",
      "Half-Acre Lot",
      "3-Car Garage"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
        "alt": "Estate home with pool"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 9
  },
  {
    "title": "Woodbridge Lakeside Home",
    "slug": "woodbridge-lakeside-home",
    "listingId": "ST-2026-0901",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": "Woodbridge",
    "city": "Irvine",
    "state": "CA",
    "zip": "92604",
    "address": "18 Lakeshore",
    "price": 1495000,
    "beds": 4,
    "baths": 3,
    "sqft": 2350,
    "lotSize": "0.11 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 1979,
    "facing": "East",
    "hoa": "$145 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-02",
    "description": "Steps from Woodbridge's North Lake, this updated two-story home pairs a classic brick façade with a bright, open interior. Residents enjoy two lagoons, beaches, pools, and tennis courts across the village.\n\nThe remodeled kitchen opens to a family room with fireplace; upstairs, four bedrooms include a primary suite with a walk-in closet. Walk to Woodbridge Village Center and award-winning schools.",
    "amenities": [
      "Lake Access",
      "Remodeled Kitchen",
      "Fireplace",
      "Community Pools",
      "Walk to Schools",
      "Tennis Courts"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1400&q=80",
        "alt": "Two-story home in Woodbridge"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with fireplace"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 10
  },
  {
    "title": "Quail Hill Modern Townhome",
    "slug": "quail-hill-modern-townhome",
    "listingId": "ST-2026-0904",
    "status": "For Sale",
    "type": "townhouse",
    "typeLabel": "Townhouse",
    "region": "orange-county",
    "neighborhood": "Quail Hill",
    "city": "Irvine",
    "state": "CA",
    "zip": "92603",
    "address": "61 Pacific Crest",
    "price": 1189000,
    "beds": 3,
    "baths": 3,
    "sqft": 1680,
    "lotSize": "—",
    "garage": 2,
    "stories": 3,
    "yearBuilt": 2016,
    "facing": "South",
    "hoa": "$390 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-05",
    "description": "A light-filled three-level townhome in Quail Hill with hillside trail access and quick routes to UC Irvine and the Irvine Spectrum.\n\nAn open main level with quartz kitchen, a private rooftop-style deck, and an attached two-car garage with EV charger. Low-maintenance living with resort pools and parks nearby.",
    "amenities": [
      "EV Charger",
      "Private Deck",
      "Hiking Trails",
      "Resort Pools",
      "Near UC Irvine",
      "Attached Garage"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern townhome at dusk"
      },
      {
        "src": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 11
  },
  {
    "title": "Newport Coast Villa",
    "slug": "newport-coast-villa",
    "listingId": "ST-2026-0907",
    "status": "For Sale",
    "type": "luxury",
    "typeLabel": "Single-Family Estate",
    "region": "orange-county",
    "neighborhood": "Newport Coast",
    "city": "Newport Beach",
    "state": "CA",
    "zip": "92657",
    "address": "7 Coral Ridge",
    "price": 4250000,
    "beds": 5,
    "baths": 6,
    "sqft": 5100,
    "lotSize": "0.42 acres",
    "garage": 3,
    "stories": 2,
    "yearBuilt": 2008,
    "facing": "West",
    "hoa": "$520 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-08",
    "description": "A guard-gated Mediterranean villa in Newport Coast with ocean breezes, a resort-style pool, and room to entertain on every level.\n\nInside, a formal dining room, chef's kitchen, and a great room that opens fully to the loggia. The primary retreat includes a fireplace, spa bath, and private balcony. Minutes to Crystal Cove and Fashion Island.",
    "amenities": [
      "Guard-Gated",
      "Ocean Breezes",
      "Resort-Style Pool",
      "Wine Room",
      "3-Car Garage",
      "Near Crystal Cove"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&w=1400&q=80",
        "alt": "Mediterranean villa with pool at night"
      },
      {
        "src": "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with pool view"
      },
      {
        "src": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=80",
        "alt": "Chef's kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and spa"
      }
    ],
    "sortOrder": 12
  },
  {
    "title": "Corona del Mar Coastal Condo",
    "slug": "corona-del-mar-coastal-condo",
    "listingId": "ST-2026-0910",
    "status": "Pending",
    "type": "condo",
    "typeLabel": "Condominium",
    "region": "orange-county",
    "neighborhood": "Corona del Mar",
    "city": "Newport Beach",
    "state": "CA",
    "zip": "92625",
    "address": "3401 E Coast Hwy #4",
    "price": 1325000,
    "beds": 2,
    "baths": 2,
    "sqft": 1240,
    "lotSize": "—",
    "garage": 1,
    "stories": 1,
    "yearBuilt": 2012,
    "facing": "South",
    "hoa": "$610 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-22",
    "description": "A bright, single-level condo a short stroll from Corona del Mar's beaches, cafés, and boutiques.\n\nCoastal finishes, an open living area with wide windows, and a primary suite with spa-inspired bath. Secure parking and elevator access.",
    "amenities": [
      "Walk to Beach",
      "Elevator Building",
      "Secure Parking",
      "Single Level",
      "Coastal Finishes"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1400&q=80",
        "alt": "White coastal condo building"
      },
      {
        "src": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 13
  },
  {
    "title": "North Tustin Ranch Estate",
    "slug": "north-tustin-ranch-estate",
    "listingId": "ST-2026-0913",
    "status": "For Sale",
    "type": "luxury",
    "typeLabel": "Single-Family Estate",
    "region": "orange-county",
    "neighborhood": "North Tustin",
    "city": "Tustin",
    "state": "CA",
    "zip": "92705",
    "address": "11902 Cowan Heights Dr",
    "price": 2650000,
    "beds": 5,
    "baths": 5,
    "sqft": 4600,
    "lotSize": "0.85 acres",
    "garage": 3,
    "stories": 1,
    "yearBuilt": 1998,
    "facing": "Southwest",
    "hoa": "None",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-10",
    "description": "A private North Tustin estate on nearly an acre, with canyon views, mature landscaping, and no HOA.\n\nSingle-level living with a chef's kitchen, oversized family room, and a backyard built for gatherings — pool, outdoor kitchen, and space for a sport court or ADU.",
    "amenities": [
      "No HOA",
      "Single Level",
      "Canyon Views",
      "Pool",
      "ADU Potential",
      "Outdoor Kitchen"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1400&q=80",
        "alt": "Farmhouse-style estate"
      },
      {
        "src": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80",
        "alt": "Family room"
      },
      {
        "src": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=80",
        "alt": "Chef's kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 14
  },
  {
    "title": "Tustin Legacy Family Home",
    "slug": "tustin-legacy-family-home",
    "listingId": "ST-2026-0916",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": "Tustin Legacy",
    "city": "Tustin",
    "state": "CA",
    "zip": "92782",
    "address": "245 Victory Rd",
    "price": 1385000,
    "beds": 4,
    "baths": 3,
    "sqft": 2480,
    "lotSize": "0.08 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2019,
    "facing": "North",
    "hoa": "$210 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-28",
    "description": "A nearly new home in Tustin Legacy with solar, smart-home features, and a downstairs bedroom suite.\n\nClose to Tustin Legacy Park, The District shopping center, and the 5 and 55 freeways.",
    "amenities": [
      "Solar Owned",
      "Smart Home",
      "Downstairs Suite",
      "Community Parks",
      "Near The District"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern two-story home"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 15
  },
  {
    "title": "Anaheim Hills Golf View Home",
    "slug": "anaheim-hills-golf-view-home",
    "listingId": "ST-2026-0919",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": "Anaheim Hills",
    "city": "Anaheim Hills",
    "state": "CA",
    "zip": "92807",
    "address": "6120 E Golf Ridge Cir",
    "price": 1295000,
    "beds": 4,
    "baths": 3,
    "sqft": 2750,
    "lotSize": "0.20 acres",
    "garage": 3,
    "stories": 2,
    "yearBuilt": 1991,
    "facing": "North",
    "hoa": "$95 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-12",
    "description": "Overlooking the fairways of Anaheim Hills Golf Course, this two-story home offers sunset views from the living room and primary suite.\n\nVaulted ceilings, a remodeled kitchen, and a spacious backyard with view deck. Award-winning Orange Unified schools.",
    "amenities": [
      "Golf Course Views",
      "Vaulted Ceilings",
      "View Deck",
      "3-Car Garage",
      "Top Schools"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=1400&q=80",
        "alt": "Hillside home at sunset"
      },
      {
        "src": "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with fireplace"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 16
  },
  {
    "title": "Villa Park Equestrian Estate",
    "slug": "villa-park-equestrian-estate",
    "listingId": "ST-2026-0922",
    "status": "Coming Soon",
    "type": "luxury",
    "typeLabel": "Single-Family Estate",
    "region": "orange-county",
    "city": "Villa Park",
    "state": "CA",
    "zip": "92861",
    "address": "18 Mesa Dr",
    "price": 3150000,
    "beds": 6,
    "baths": 6,
    "sqft": 5400,
    "lotSize": "1.10 acres",
    "garage": 4,
    "stories": 2,
    "yearBuilt": 2002,
    "facing": "East",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-18",
    "description": "A rare acre-plus estate in Villa Park with an equestrian-zoned lot, sweeping lawns, and a grand two-story entry.\n\nSix bedrooms, a library, a game room, and a resort backyard with pool and cabana — all minutes from Old Towne Orange.",
    "amenities": [
      "Acre-Plus Lot",
      "Equestrian Zoning",
      "Library",
      "Game Room",
      "Pool & Cabana",
      "4-Car Garage"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1400&q=80",
        "alt": "Grand estate at dusk"
      },
      {
        "src": "https://images.unsplash.com/photo-1521782462922-9318be1cfd04?auto=format&fit=crop&w=1400&q=80",
        "alt": "Great room"
      },
      {
        "src": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=80",
        "alt": "Chef's kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1400&q=80",
        "alt": "Pool and backyard"
      }
    ],
    "sortOrder": 17
  },
  {
    "title": "Old Towne Orange Bungalow",
    "slug": "old-towne-orange-bungalow",
    "listingId": "ST-2026-0925",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": "Old Towne",
    "city": "Orange",
    "state": "CA",
    "zip": "92866",
    "address": "421 N Shaffer St",
    "price": 965000,
    "beds": 2,
    "baths": 1,
    "sqft": 1180,
    "lotSize": "0.14 acres",
    "garage": 1,
    "stories": 1,
    "yearBuilt": 1922,
    "facing": "West",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-03",
    "description": "A charming 1920s bungalow on a tree-lined street in Old Towne's historic district — walk to the Plaza, Chapman University, and the Metrolink.\n\nOriginal hardwoods and period details with an updated kitchen and bath. A detached garage offers studio or ADU potential.",
    "amenities": [
      "Historic District",
      "Hardwood Floors",
      "ADU Potential",
      "Walk to Plaza",
      "Near Metrolink"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1400&q=80",
        "alt": "White cottage with front porch"
      },
      {
        "src": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
        "alt": "Family room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 18
  },
  {
    "title": "Garden Grove Ranch Home",
    "slug": "garden-grove-ranch-home",
    "listingId": "ST-2026-0928",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "city": "Garden Grove",
    "state": "CA",
    "zip": "92843",
    "address": "10462 Kerrigan St",
    "price": 849000,
    "beds": 4,
    "baths": 2,
    "sqft": 1620,
    "lotSize": "0.16 acres",
    "garage": 2,
    "stories": 1,
    "yearBuilt": 1958,
    "facing": "South",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-30",
    "description": "A move-in ready single-story home minutes from Little Saigon's restaurants and markets, with a large backyard and RV parking.\n\nRecently updated with new flooring, dual-pane windows, and a refreshed kitchen. Great first home or multi-generational fit.",
    "amenities": [
      "Single Story",
      "RV Parking",
      "Large Backyard",
      "Near Little Saigon",
      "No HOA"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=1400&q=80",
        "alt": "Single-story ranch home"
      },
      {
        "src": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 19
  },
  {
    "title": "Pacific Heights View Condo",
    "slug": "pacific-heights-view-condo",
    "listingId": "ST-2026-0931",
    "status": "For Sale",
    "type": "condo",
    "typeLabel": "Condominium",
    "region": "bay-area",
    "neighborhood": "Pacific Heights",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94115",
    "address": "2200 Pacific Ave #6A",
    "price": 1895000,
    "beds": 2,
    "baths": 2,
    "sqft": 1450,
    "lotSize": "—",
    "garage": 1,
    "stories": 1,
    "yearBuilt": 1928,
    "facing": "North",
    "hoa": "$1,150 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-14",
    "description": "A classic Pacific Heights residence with Golden Gate and bay views, high ceilings, and a gracious floor plan.\n\nUpdated kitchen and baths, in-unit laundry, and a full-service building with doorman and deeded parking. Steps to Fillmore Street.",
    "amenities": [
      "Bay Views",
      "Doorman",
      "In-Unit Laundry",
      "Deeded Parking",
      "Walk to Fillmore Street"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
        "alt": "Condo building with balconies"
      },
      {
        "src": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 20
  },
  {
    "title": "Noe Valley Victorian",
    "slug": "noe-valley-victorian",
    "listingId": "ST-2026-0934",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "bay-area",
    "neighborhood": "Noe Valley",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94114",
    "address": "4127 24th St",
    "price": 2395000,
    "beds": 3,
    "baths": 2,
    "sqft": 1950,
    "lotSize": "0.06 acres",
    "garage": 1,
    "stories": 2,
    "yearBuilt": 1905,
    "facing": "South",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-06",
    "description": "A lovingly updated Victorian in sunny Noe Valley, blocks from 24th Street's cafés and the J-Church line.\n\nPeriod details meet a modern open kitchen; the terraced garden is a rare city retreat.",
    "amenities": [
      "Period Details",
      "Terraced Garden",
      "Walk to 24th Street",
      "Near Muni",
      "Garage Parking"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&w=1400&q=80",
        "alt": "Victorian-era family home"
      },
      {
        "src": "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with fireplace"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 21
  },
  {
    "title": "SoMa Loft Condo",
    "slug": "soma-loft-condo",
    "listingId": "ST-2026-0937",
    "status": "Pending",
    "type": "condo",
    "typeLabel": "Loft Condominium",
    "region": "bay-area",
    "neighborhood": "SoMa",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94107",
    "address": "855 Folsom St #512",
    "price": 995000,
    "beds": 1,
    "baths": 1,
    "sqft": 980,
    "lotSize": "—",
    "garage": 1,
    "stories": 1,
    "yearBuilt": 2007,
    "facing": "East",
    "hoa": "$820 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-19",
    "description": "A true loft with 17-foot ceilings, polished concrete floors, and walls of windows near Yerba Buena Gardens.\n\nBuilding amenities include a roof deck, gym, and 24-hour lobby attendant.",
    "amenities": [
      "17-Foot Ceilings",
      "Roof Deck",
      "Fitness Center",
      "24-Hour Lobby",
      "Walk to Caltrain"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern loft building"
      },
      {
        "src": "https://images.unsplash.com/photo-1521782462922-9318be1cfd04?auto=format&fit=crop&w=1400&q=80",
        "alt": "Great room"
      },
      {
        "src": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 22
  },
  {
    "title": "Almaden Valley Pool Home",
    "slug": "almaden-valley-pool-home",
    "listingId": "ST-2026-0940",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "bay-area",
    "neighborhood": "Almaden Valley",
    "city": "San Jose",
    "state": "CA",
    "zip": "95120",
    "address": "6728 Leyland Park Dr",
    "price": 2150000,
    "beds": 4,
    "baths": 3,
    "sqft": 2600,
    "lotSize": "0.18 acres",
    "garage": 2,
    "stories": 1,
    "yearBuilt": 1977,
    "facing": "West",
    "hoa": "None",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-11",
    "description": "A single-level Almaden Valley home with a sparkling pool, hillside views, and top-rated Almaden schools.\n\nRemodeled kitchen and baths, a bright family room, and an easy commute to downtown San Jose and Silicon Valley campuses.",
    "amenities": [
      "Pool",
      "Single Level",
      "Top-Rated Schools",
      "Hillside Views",
      "Remodeled Kitchen"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1400&q=80",
        "alt": "Backyard with swimming pool"
      },
      {
        "src": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80",
        "alt": "Family room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 23
  },
  {
    "title": "Berryessa New Construction",
    "slug": "berryessa-new-construction",
    "listingId": "ST-2026-0943",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "bay-area",
    "neighborhood": "Berryessa",
    "city": "San Jose",
    "state": "CA",
    "zip": "95132",
    "address": "1780 Flickinger Ave",
    "price": 1698000,
    "beds": 4,
    "baths": 3,
    "sqft": 2150,
    "lotSize": "0.07 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2025,
    "facing": "South",
    "hoa": "$180 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-15",
    "description": "A brand-new home near the Berryessa BART station with solar, EV charging, and a main-floor bedroom.\n\nOpen-concept living, a large island kitchen, and a low-maintenance yard. Close to Penitencia Creek Park and Great Mall.",
    "amenities": [
      "New Construction",
      "Near BART",
      "Solar",
      "EV Charger",
      "Main-Floor Bedroom"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1400&q=80",
        "alt": "New modern family home"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 24
  },
  {
    "title": "Palo Alto Modern Retreat",
    "slug": "palo-alto-modern-retreat",
    "listingId": "ST-2026-0946",
    "status": "For Sale",
    "type": "luxury",
    "typeLabel": "Single-Family Estate",
    "region": "bay-area",
    "neighborhood": "Old Palo Alto",
    "city": "Palo Alto",
    "state": "CA",
    "zip": "94301",
    "address": "1245 Waverley St",
    "price": 5480000,
    "beds": 5,
    "baths": 5,
    "sqft": 3900,
    "lotSize": "0.20 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2021,
    "facing": "South",
    "hoa": "None",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-16",
    "description": "A newly built modern home in Old Palo Alto with walls of glass, a floating staircase, and seamless indoor-outdoor flow.\n\nClose to Stanford, University Avenue, and top Palo Alto schools. Smart-home systems throughout.",
    "amenities": [
      "New Build",
      "Smart Home",
      "Floating Staircase",
      "Near Stanford",
      "Top Schools",
      "Indoor-Outdoor Living"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1400&q=80",
        "alt": "Glass-walled modern home"
      },
      {
        "src": "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with pool view"
      },
      {
        "src": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=80",
        "alt": "Chef's kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=80",
        "alt": "Staircase"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 25
  },
  {
    "title": "Mountain View Townhouse",
    "slug": "mountain-view-townhouse",
    "listingId": "ST-2026-0949",
    "status": "For Sale",
    "type": "townhouse",
    "typeLabel": "Townhouse",
    "region": "bay-area",
    "neighborhood": "Old Mountain View",
    "city": "Mountain View",
    "state": "CA",
    "zip": "94041",
    "address": "277 Bryant St #3",
    "price": 1749000,
    "beds": 3,
    "baths": 3,
    "sqft": 1640,
    "lotSize": "—",
    "garage": 2,
    "stories": 3,
    "yearBuilt": 2018,
    "facing": "West",
    "hoa": "$450 / month",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-09",
    "description": "A stylish townhome a few blocks from Castro Street, Caltrain, and major tech campuses.\n\nThree levels with an open kitchen, a private patio, and a two-car garage.",
    "amenities": [
      "Walk to Castro Street",
      "Near Caltrain",
      "Private Patio",
      "2-Car Garage",
      "Near Tech Campuses"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Row of modern townhouses"
      },
      {
        "src": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80",
        "alt": "Family room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 26
  },
  {
    "title": "Sunnyvale Eichler Home",
    "slug": "sunnyvale-eichler-home",
    "listingId": "ST-2026-0952",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Mid-Century Modern",
    "region": "bay-area",
    "neighborhood": "Cherry Chase",
    "city": "Sunnyvale",
    "state": "CA",
    "zip": "94087",
    "address": "1094 Sesame Dr",
    "price": 2295000,
    "beds": 4,
    "baths": 2,
    "sqft": 1820,
    "lotSize": "0.15 acres",
    "garage": 2,
    "stories": 1,
    "yearBuilt": 1961,
    "facing": "East",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-04",
    "description": "A classic Eichler with an atrium, post-and-beam ceilings, and walls of glass, in Cherry Chase.\n\nUpdated radiant heating, a remodeled kitchen, and a private backyard. Close to Cupertino Union schools.",
    "amenities": [
      "Atrium",
      "Post-and-Beam",
      "Radiant Heating",
      "Remodeled Kitchen",
      "Top Schools"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
        "alt": "Mid-century modern home"
      },
      {
        "src": "https://images.unsplash.com/photo-1521782462922-9318be1cfd04?auto=format&fit=crop&w=1400&q=80",
        "alt": "Great room"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 27
  },
  {
    "title": "Oakland Hills View Home",
    "slug": "oakland-hills-view-home",
    "listingId": "ST-2026-0955",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "bay-area",
    "neighborhood": "Montclair",
    "city": "Oakland",
    "state": "CA",
    "zip": "94611",
    "address": "6033 Snake Rd",
    "price": 1450000,
    "beds": 3,
    "baths": 2,
    "sqft": 1900,
    "lotSize": "0.22 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 1956,
    "facing": "West",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-08-26",
    "description": "A mid-century home in the Montclair hills with bay and city-light views from nearly every room.\n\nUpdated throughout, with decks for entertaining and quick access to Montclair Village and Highway 13.",
    "amenities": [
      "Bay Views",
      "City Lights",
      "Decks",
      "Near Montclair Village",
      "Updated Throughout"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=1400&q=80",
        "alt": "Hillside modern home at dusk"
      },
      {
        "src": "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with fireplace"
      },
      {
        "src": "https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 28
  },
  {
    "title": "Berkeley Craftsman",
    "slug": "berkeley-craftsman",
    "listingId": "ST-2026-0958",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "bay-area",
    "neighborhood": "Elmwood",
    "city": "Berkeley",
    "state": "CA",
    "zip": "94705",
    "address": "2911 Benvenue Ave",
    "price": 1695000,
    "beds": 3,
    "baths": 2,
    "sqft": 1720,
    "lotSize": "0.10 acres",
    "garage": 1,
    "stories": 2,
    "yearBuilt": 1912,
    "facing": "North",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-01",
    "description": "A classic Elmwood Craftsman with a welcoming front porch, built-ins, and a sunny back garden.\n\nWalk to College Avenue shops and UC Berkeley; updated systems and a remodeled kitchen.",
    "amenities": [
      "Front Porch",
      "Original Built-Ins",
      "Garden",
      "Walk to College Avenue",
      "Near UC Berkeley"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1400&q=80",
        "alt": "Craftsman home with front porch"
      },
      {
        "src": "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with fireplace"
      },
      {
        "src": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1400&q=80",
        "alt": "Dining room"
      },
      {
        "src": "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80",
        "alt": "Kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      }
    ],
    "sortOrder": 29
  },
  {
    "title": "Westminster Family Home",
    "slug": "westminster-family-home",
    "listingId": "ST-2026-0961",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "city": "Westminster",
    "state": "CA",
    "zip": "92683",
    "address": "14582 Moran St",
    "price": 979000,
    "beds": 4,
    "baths": 3,
    "sqft": 1980,
    "lotSize": "0.14 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 1972,
    "facing": "East",
    "hoa": "None",
    "isFeatured": false,
    "isActive": true,
    "listedAt": "2026-09-13",
    "description": "A spacious two-story home in the heart of Little Saigon — walk to Asian Garden Mall, restaurants, and community events.\n\nFour bedrooms, a downstairs bonus room, and a large backyard with fruit trees.",
    "amenities": [
      "Heart of Little Saigon",
      "Bonus Room",
      "Fruit Trees",
      "No HOA",
      "Near Freeways"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1400&q=80",
        "alt": "Family home with two-car garage"
      },
      {
        "src": "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room"
      },
      {
        "src": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80",
        "alt": "Open kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 30
  },
  {
    "title": "Portola Springs Family Home",
    "slug": "irvine-portola-springs-home",
    "listingId": "ST-2026-0964",
    "status": "For Sale",
    "type": "house",
    "typeLabel": "Single-Family Residence",
    "region": "orange-county",
    "neighborhood": "Portola Springs",
    "city": "Irvine",
    "state": "CA",
    "zip": "92618",
    "address": "126 Interstellar",
    "price": 1890000,
    "beds": 5,
    "baths": 4,
    "sqft": 3050,
    "lotSize": "0.09 acres",
    "garage": 2,
    "stories": 2,
    "yearBuilt": 2015,
    "facing": "South",
    "hoa": "$265 / month",
    "isFeatured": true,
    "isActive": true,
    "listedAt": "2026-09-17",
    "description": "A spacious Portola Springs home with a downstairs bedroom suite, loft, and a backyard pool.\n\nResort-style community amenities and Portola High School nearby.",
    "amenities": [
      "Pool",
      "Downstairs Suite",
      "Loft",
      "Resort Amenities",
      "Near Portola High"
    ],
    "images": [
      {
        "src": "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Modern home with pool"
      },
      {
        "src": "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1400&q=80",
        "alt": "Living room with pool view"
      },
      {
        "src": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1400&q=80",
        "alt": "Chef's kitchen"
      },
      {
        "src": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bedroom"
      },
      {
        "src": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80",
        "alt": "Primary bathroom"
      }
    ],
    "sortOrder": 31
  }
];

@Injectable()
export class PropertySeed {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
  ) {}

  async run(): Promise<void> {
    let createdCount = 0;
    let locatedCount = 0;
    for (const property of DEMO_PROPERTIES) {
      const coordinates = coordinatesOf(String(property.city), String(property.slug));
      const existing = await this.propertyRepo.findOne({
        where: { slug: property.slug },
        withDeleted: true,
      });
      if (existing) {
        if (coordinates && (existing.latitude === null || existing.longitude === null)) {
          await this.propertyRepo.update(existing.id, coordinates);
          locatedCount++;
        }
        continue;
      }
      await this.propertyRepo.save(this.propertyRepo.create({ ...property, ...(coordinates ?? {}) }));
      createdCount++;
    }
    console.log(
      createdCount + locatedCount > 0
        ? `--- [Seed] Properties: created ${createdCount} listing(s), added map coordinates to ${locatedCount}.`
        : '--- [Seed] Properties: nothing missing, skipping.',
    );
  }
}
