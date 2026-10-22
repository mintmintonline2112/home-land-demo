/**
 * Migration thay các thẻ "Find Your Community" (section areas, trang chủ) bằng 9 khu vực theo menu Areas — Irvine, Newport Beach, Tustin,
 * Anaheim Hills, Orange & Villa Park, Garden Grove, Westminster (Little Saigon), San Francisco, San Jose & Silicon Valley — với ảnh thật
 * của từng nơi (Wikimedia Commons, lưu ở backend/uploads/areas/) kèm dòng ghi nguồn ảnh.
 * Dùng bởi: `npm run db:run` / `db:run:prod` (TypeORM CLI qua src/database/data-source.ts).
 * Lưu ý: chỉ thay khi section còn đúng bộ thẻ cũ (nhận ra qua ảnh Irvine cũ); admin đã sửa thẻ thì giữ nguyên. Ảnh CC BY / CC BY-SA
 * bắt buộc giữ credit (tác giả + giấy phép) khi hiển thị.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_IRVINE_IMAGE_ID = '1449844908441-8829872d2607';

const areaHref = (keyword: string) => `/properties?keyword=${encodeURIComponent(keyword)}`;
const unsplash = (photoId: string) => `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;

const OLD_ITEMS = [
  { title: 'Irvine', text: 'Master-planned communities & top schools', image: unsplash(OLD_IRVINE_IMAGE_ID), alt: 'Aerial view of a master-planned community', href: areaHref('Irvine') },
  { title: 'Newport Beach', text: 'Coastal luxury & harbor living', image: unsplash('1519046904884-53103b34b206'), alt: 'Southern California beach', href: areaHref('Newport Beach') },
  { title: 'Anaheim Hills', text: 'View homes & golf communities', image: unsplash('1570129477492-45c003edd2be'), alt: 'Hillside home with a view', href: areaHref('Anaheim Hills') },
  { title: 'Orange & Villa Park', text: 'Historic charm & estate lots', image: unsplash('1560518883-ce09059eeffa'), alt: 'Charming residential street', href: areaHref('Orange') },
  { title: 'San Francisco', text: 'Iconic city living', image: unsplash('1501594907352-04cda38ebc29'), alt: 'San Francisco skyline and bay', href: areaHref('San Francisco') },
  { title: 'San Jose & Silicon Valley', text: 'Tech-hub neighborhoods', image: unsplash('1449824913935-59a10b8d2000'), alt: 'City skyline at dusk', href: areaHref('Silicon Valley') },
];

const NEW_ITEMS = [
  { title: 'Irvine', text: 'Master-planned communities & top schools', image: 'uploads/areas/irvine.jpg', alt: 'Irvine Spectrum office towers', credit: 'Photo: Sewageboy, CC BY 4.0', href: areaHref('Irvine') },
  { title: 'Newport Beach', text: 'Coastal luxury & harbor living', image: 'uploads/areas/newport-beach.jpg', alt: 'Aerial view of Newport Beach, Balboa Peninsula and pier', credit: 'Photo: Don Ramey Logan, CC BY 4.0', href: areaHref('Newport Beach') },
  { title: 'Tustin', text: 'Old Town charm & the historic blimp hangars', image: 'uploads/areas/tustin.jpg', alt: 'Historic blimp hangar in Tustin', credit: 'Photo: Robert A. Estremo, CC BY-SA 2.0', href: areaHref('Tustin') },
  { title: 'Anaheim Hills', text: 'View homes & golf communities', image: 'uploads/areas/anaheim-hills.jpg', alt: 'Sunset over the Anaheim Hills', credit: 'Photo: Jordan Wozniak, CC0', href: areaHref('Anaheim Hills') },
  { title: 'Orange & Villa Park', text: 'Old Towne charm & estate lots', image: 'uploads/areas/orange.jpg', alt: 'Fountain at the Plaza in Old Towne Orange', credit: 'Photo: Jeaniac, CC BY-SA 3.0', href: areaHref('Orange') },
  { title: 'Garden Grove', text: 'Christ Cathedral & family neighborhoods', image: 'uploads/areas/garden-grove.jpg', alt: 'Christ Cathedral campus in Garden Grove', credit: 'Photo: Farragutful, CC BY-SA 4.0', href: areaHref('Garden Grove') },
  { title: 'Westminster (Little Saigon)', text: 'Heart of the Vietnamese-American community', image: 'uploads/areas/westminster.jpg', alt: 'Asian Garden Mall on Bolsa Avenue, Little Saigon', credit: 'Photo: Orange County Archives, CC BY 2.0', href: areaHref('Westminster') },
  { title: 'San Francisco', text: 'Iconic city living', image: unsplash('1501594907352-04cda38ebc29'), alt: 'Golden Gate Bridge, San Francisco', href: areaHref('San Francisco') },
  { title: 'San Jose & Silicon Valley', text: 'Tech-hub neighborhoods', image: 'uploads/areas/san-jose.jpg', alt: 'Downtown San Jose skyline at night', credit: 'Photo: Ben Loomis, CC BY 2.0', href: areaHref('Silicon Valley') },
];

const HOME_AREAS_FILTER =
  "`section_key` = 'areas' AND `page_id` = (SELECT `id` FROM `pages` WHERE `slug` = 'home' LIMIT 1)";

export class AreaCardsRealPhotos1792300900000 implements MigrationInterface {
  name = 'AreaCardsRealPhotos1792300900000';

  private setItems(queryRunner: QueryRunner, items: unknown[], markerImage: string) {
    return queryRunner.query(
      `UPDATE \`page_sections\` SET \`metadata\` = JSON_SET(\`metadata\`, '$.items', JSON_EXTRACT(?, '$')) WHERE ${HOME_AREAS_FILTER} AND CAST(\`metadata\` AS CHAR) LIKE ?`,
      [JSON.stringify(items), `%${markerImage}%`],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.setItems(queryRunner, NEW_ITEMS, OLD_IRVINE_IMAGE_ID);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.setItems(queryRunner, OLD_ITEMS, 'uploads/areas/irvine.jpg');
  }
}
