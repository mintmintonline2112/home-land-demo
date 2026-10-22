/**
 * Danh mục component section (khuôn form cho admin: nhãn, mô tả, field, bố cục) — nguồn chân lý do code quản lý.
 * Dùng bởi: database/seeding/seeding.service.ts; sectionKey = key registry frontend-next/src/app/(site)/_components/sections/index.ts = tên file component.
 * Lưu ý: một component = một BỐ CỤC đặt theo hình dạng (hero, faq…), biến thể = field `layout`, dùng được mọi trang (pageSlug `shared`).
 * Seed ghi đè label / mô tả / spec mỗi lần chạy và XOÁ HẲN component không còn trong code (bảng chỉ là khuôn form, không bảng nào
 * tham chiếu; section dùng tên cũ vẫn render nhờ LEGACY_COMPONENTS ở frontend). Dữ liệu section của admin không bị đụng tới.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import {
  SectionDefinition,
  SectionFieldSpec,
} from 'src/modules/admin/pages/entities/section-definition.entity';

type DefinitionSeed = {
  pageSlug: string;
  sectionKey: string;
  label: string;
  description: string;
  fields: SectionFieldSpec[];
  sortOrder: number;
};

const IMAGE_HINT =
  'Ảnh: bấm "Thư viện" để chọn ảnh đã upload, hoặc dán link ảnh (https://...).';
const ICON_HINT =
  'Icon (tuỳ chọn) — tên trong bộ icon chung: pin, shield, chat, dollar, home, chart, users, file, wrench, globe, bed, bath, area, car, check, phone, mail, clock, link, calendar. Trống thì xoay vòng theo thứ tự.';
const CTA_HINT = 'Chữ trên nút để trống thì ẩn nút. Link: /duong-dan (VD /properties, /contact?topic=sell) hoặc #tên-section trên cùng trang.';

const buildLayoutField = (
  options: Array<{ value: string; label: string; hint?: string }>,
): SectionFieldSpec => ({
  key: 'layout',
  label: 'Bố cục',
  type: 'select',
  options,
  hint: 'Đổi bố cục thì dữ liệu bên dưới giữ nguyên — chỉ cách hiển thị thay đổi.',
});

const BACKGROUND_FIELD: SectionFieldSpec = {
  key: 'background',
  label: 'Nền',
  type: 'select',
  options: [
    { value: 'plain', label: 'Trắng' },
    { value: 'tint', label: 'Xám nhạt' },
  ],
  hint: 'Để trống thì nền tự xen kẽ trắng / xám theo vị trí section trên trang.',
};

const BACKGROUND_WITH_DARK_FIELD: SectionFieldSpec = {
  ...BACKGROUND_FIELD,
  options: [...(BACKGROUND_FIELD.options ?? []), { value: 'dark', label: 'Navy (chữ sáng)' }],
};

const buildStringListField = (key: string, label: string, hint?: string, layouts?: string[]): SectionFieldSpec => ({
  key, label, type: 'stringList', ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

const buildImageField = (key: string, label: string, hint?: string, layouts?: string[], positionKey?: string): SectionFieldSpec => ({
  key, label, type: 'image', hint: hint ?? IMAGE_HINT, ...(layouts ? { layouts } : {}), ...(positionKey ? { positionKey } : {}),
});

const buildTextMapField = (
  label: string,
  fields: Array<{ name: string; label: string }>,
  hint?: string,
  layouts?: string[],
): SectionFieldSpec => ({
  key: '__self__', label, type: 'textMap', fields, ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

type ItemField = { name: string; label: string; kind: 'text' | 'textarea' | 'image' };
const buildItemListField = (
  key: string,
  label: string,
  itemFields: ItemField[],
  hint?: string,
  layouts?: string[],
): SectionFieldSpec => ({
  key, label, type: 'itemList', itemFields, ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

const CTA_FIELDS = [
  { name: 'ctaLabel', label: 'Chữ trên nút' },
  { name: 'ctaHref', label: 'Link của nút' },
];

const DEFINITIONS: DefinitionSeed[] = [
  {
    pageSlug: 'shared', sectionKey: 'hero', sortOrder: 1,
    label: 'Hero (đầu trang)',
    description: 'Hero.tsx — ảnh nền tràn màn hình phủ navy, eyebrow (Subheading), tiêu đề h1 (Heading), mô tả (Nội dung). Bố cục "Ô tìm nhà" thêm thanh tìm kiếm gửi sang /properties; bố cục "Nút" thêm 2 nút.',
    fields: [
      buildLayoutField([
        { value: 'search', label: 'Ô tìm nhà', hint: 'Từ khoá, khu vực, loại nhà, khoảng giá' },
        { value: 'plain', label: 'Nút', hint: 'Hai nút bên dưới tiêu đề' },
      ]),
      buildImageField('image', 'Ảnh nền', undefined, undefined, 'imagePosition'),
      buildTextMapField('Ảnh', [{ name: 'imageAlt', label: 'Mô tả ảnh (alt)' }]),
      buildTextMapField('Nhãn ô tìm nhà', [
        { name: 'keywordLabel', label: 'Nhãn ô từ khoá (VD: Keyword)' },
        { name: 'keywordPlaceholder', label: 'Chữ mờ ô từ khoá (VD: Community, street, ZIP...)' },
        { name: 'areaLabel', label: 'Nhãn ô khu vực (VD: Area)' },
        { name: 'anyAreaLabel', label: 'Lựa chọn "tất cả khu vực" (VD: All Areas)' },
        { name: 'typeLabel', label: 'Nhãn ô loại nhà (VD: Property Type)' },
        { name: 'anyTypeLabel', label: 'Lựa chọn "tất cả loại" (VD: All Types)' },
        { name: 'priceLabel', label: 'Nhãn ô giá (VD: Price Range)' },
        { name: 'anyPriceLabel', label: 'Lựa chọn "mọi mức giá" (VD: Any)' },
        { name: 'searchLabel', label: 'Chữ trên nút tìm (VD: Search)' },
      ], 'Danh sách khu vực / loại nhà / khoảng giá lấy từ cấu hình website (frontend-next/src/config/property-search.ts).', ['search']),
      buildTextMapField('Nút', [
        { name: 'ctaLabel', label: 'Nút 1 — chữ' },
        { name: 'ctaHref', label: 'Nút 1 — link' },
        { name: 'cta2Label', label: 'Nút 2 — chữ' },
        { name: 'cta2Href', label: 'Nút 2 — link' },
      ], CTA_HINT, ['plain']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'stats', sortOrder: 2,
    label: 'Dải số liệu',
    description: 'Stats.tsx — dải navy, mỗi cột một con số lớn + nhãn chữ hoa + dòng mô tả nhỏ (số ở đầu tự chạy đếm từ 0 khi cuộn tới). Heading / Nội dung để trống thì chỉ có dải số.',
    fields: [
      buildItemListField('stats', 'Số liệu', [
        { name: 'value', label: 'Giá trị (VD: 350+, 2,000+ hoặc chữ như EN · VI)', kind: 'text' },
        { name: 'label', label: 'Nhãn (VD: Families Guided Home)', kind: 'text' },
        { name: 'note', label: 'Dòng mô tả nhỏ dưới nhãn (tuỳ chọn)', kind: 'text' },
      ], 'Giá trị bắt đầu bằng số sẽ tự chạy hiệu ứng đếm.'),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'property-grid', sortOrder: 3,
    label: 'Lưới nhà nổi bật',
    description: 'PropertyGrid.tsx — lưới thẻ nhà (giá, phòng ngủ, phòng tắm, diện tích) lấy các nhà đánh dấu nổi bật, có tab lọc theo vùng và nút xem tất cả.',
    fields: [
      buildTextMapField('Hiển thị', [
        { name: 'limit', label: 'Số thẻ tối đa (mặc định 6)' },
        { name: 'allLabel', label: 'Chữ tab "tất cả" (VD: All) — trống thì ẩn hàng tab vùng' },
      ]),
      buildTextMapField('Nút cuối khối', CTA_FIELDS, CTA_HINT),
      BACKGROUND_FIELD,
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'media-cards', sortOrder: 4,
    label: 'Lưới thẻ ảnh có link',
    description: 'MediaCards.tsx — thẻ ảnh 3 cột, dưới ảnh là tên + mô tả ngắn và ô mũi tên (VD khu vực phục vụ).',
    fields: [
      buildItemListField('items', 'Thẻ', [
        { name: 'title', label: 'Tên', kind: 'text' },
        { name: 'text', label: 'Mô tả ngắn', kind: 'text' },
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'alt', label: 'Mô tả ảnh (alt; trống thì dùng Tên)', kind: 'text' },
        { name: 'credit', label: 'Nguồn ảnh (VD Photo: Tên tác giả, CC BY 4.0 — bắt buộc với ảnh Wikimedia)', kind: 'text' },
        { name: 'href', label: 'Link khi bấm (VD /properties?keyword=Irvine)', kind: 'text' },
      ]),
      buildTextMapField('Cuối khối', [{ name: 'note', label: 'Dòng ghi chú' }, ...CTA_FIELDS], CTA_HINT),
      BACKGROUND_FIELD,
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'feature-cards', sortOrder: 5,
    label: 'Lưới thẻ icon',
    description: 'FeatureCards.tsx — các mục icon + tiêu đề + mô tả (VD lý do chọn Sean, mạng lưới đối tác). Bố cục "Thẻ" (4 thẻ thì 4 cột), "Chia đôi" (tiêu đề trái, mục đánh số phải), "Khung chia ô".',
    fields: [
      buildLayoutField([
        { value: 'cards', label: 'Thẻ', hint: 'Lưới thẻ viền mảnh căn giữa, ô icon vuông' },
        { value: 'split', label: 'Chia đôi', hint: 'Tiêu đề bên trái, mục đánh số 01, 02… 2 cột bên phải' },
        { value: 'rows', label: 'Khung chia ô', hint: 'Một khung trắng chia ô bằng đường kẻ mảnh, icon nền navy' },
      ]),
      buildItemListField('items', 'Thẻ', [
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT),
      buildTextMapField('Cuối khối', [{ name: 'note', label: 'Dòng ghi chú' }, ...CTA_FIELDS], CTA_HINT),
      BACKGROUND_FIELD,
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'cta-banner', sortOrder: 6,
    label: 'Băng kêu gọi hành động',
    description: 'CtaBanner.tsx — băng navy: tiêu đề (Heading) + mô tả (Nội dung) bên trái, nút sáng bên phải. Đặt ngay sau một section khác.',
    fields: [buildTextMapField('Nút', CTA_FIELDS, CTA_HINT)],
  },
  {
    pageSlug: 'shared', sectionKey: 'profile', sortOrder: 7,
    label: 'Giới thiệu người (môi giới)',
    description: 'Profile.tsx — ảnh chân dung có khung bên trái; eyebrow (Subheading), tên (Heading), chức danh, giới thiệu (Nội dung), danh sách điểm nổi bật có tick và 2 nút bên phải.',
    fields: [
      buildImageField('image', 'Ảnh chân dung', undefined, undefined, 'imagePosition'),
      buildTextMapField('Thông tin', [
        { name: 'role', label: 'Chức danh dưới tên (VD: Realtor® · First Team Real Estate)' },
        { name: 'imageAlt', label: 'Mô tả ảnh (alt)' },
      ]),
      buildStringListField('highlights', 'Điểm nổi bật (có dấu tick, 2 cột)'),
      buildTextMapField('Nút', [
        { name: 'ctaLabel', label: 'Nút đặc — chữ' },
        { name: 'ctaHref', label: 'Nút đặc — link' },
        { name: 'cta2Label', label: 'Nút viền — chữ' },
        { name: 'cta2Href', label: 'Nút viền — link' },
      ], CTA_HINT),
      BACKGROUND_FIELD,
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'testimonials', sortOrder: 8,
    label: 'Cảm nhận khách hàng',
    description: 'Testimonials.tsx — cảm nhận khách: bố cục "Thẻ" (lưới thẻ trích dẫn) hoặc "Nổi bật" (lời đầu tiên in lớn bên trái, còn lại xếp dọc bên phải; hợp nền Navy).',
    fields: [
      buildLayoutField([
        { value: 'cards', label: 'Thẻ', hint: 'Lưới thẻ trích dẫn' },
        { value: 'spotlight', label: 'Nổi bật', hint: 'Lời trích đầu tiên in lớn, các lời còn lại bên phải' },
      ]),
      buildItemListField('items', 'Cảm nhận', [
        { name: 'text', label: 'Lời trích (không cần ngoặc kép)', kind: 'textarea' },
        { name: 'title', label: 'Tên khách (VD: The Nguyen Family)', kind: 'text' },
        { name: 'label', label: 'Mô tả (VD: Buyers · Irvine, CA)', kind: 'text' },
      ]),
      BACKGROUND_WITH_DARK_FIELD,
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'post-cards', sortOrder: 9,
    label: 'Bài viết mới nhất',
    description: 'PostCards.tsx — thẻ các bài blog mới nhất (ảnh bìa, ngày, tiêu đề, tóm tắt, link đọc tiếp), lấy tự động từ mục Bài viết.',
    fields: [
      buildTextMapField('Hiển thị', [
        { name: 'limit', label: 'Số bài (mặc định 3)' },
        { name: 'moreLabel', label: 'Chữ link trên thẻ (VD: Continue) — trống thì ẩn' },
      ]),
      buildTextMapField('Nút cuối khối', CTA_FIELDS, CTA_HINT),
      BACKGROUND_FIELD,
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'contact', sortOrder: 10,
    label: 'Liên hệ + form tư vấn',
    description: 'Contact.tsx — trái: thẻ văn phòng / điện thoại / email / giờ làm việc (lấy từ Admin → Trang Liên hệ); phải: khung form (Heading = tiêu đề form, Nội dung = câu mở đầu); dưới: bản đồ.',
    fields: [
      buildTextMapField('Nhãn thẻ thông tin', [
        { name: 'labelOffice', label: 'Nhãn thẻ văn phòng (VD: Office)' },
        { name: 'labelPhone', label: 'Nhãn thẻ điện thoại (VD: Phone)' },
        { name: 'phoneNote', label: 'Dòng dưới số điện thoại (VD: Calls & texts welcome)' },
        { name: 'labelEmail', label: 'Nhãn thẻ email (VD: Email)' },
        { name: 'labelHours', label: 'Nhãn thẻ giờ làm việc (VD: Availability)' },
      ], 'Giờ làm việc nhiều dòng: ngăn cách bằng " · " trong Admin → Trang Liên hệ.'),
      buildItemListField('topics', 'Chủ đề ô "I\'m Interested In"', [
        { name: 'label', label: 'Chữ hiển thị (VD: Seller Consultation)', kind: 'text' },
        { name: 'value', label: 'Mã trên link (VD: sell → /contact?topic=sell chọn sẵn chủ đề này)', kind: 'text' },
      ]),
      buildTextMapField('Form', [
        { name: 'messagePlaceholder', label: 'Chữ mờ ô lời nhắn' },
        { name: 'submitLabel', label: 'Chữ trên nút gửi (VD: Send Message)' },
      ]),
      BACKGROUND_FIELD,
    ],
  },
];

export const SECTION_COMPONENT_KEYS = DEFINITIONS.map(
  (definition) => definition.sectionKey,
);

@Injectable()
export class SectionDefinitionSeed {
  constructor(
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {}

  async run(): Promise<void> {
    let upsertedCount = 0;
    for (const definition of DEFINITIONS) {
      const existing = await this.definitionRepo.findOne({
        where: { sectionKey: definition.sectionKey },
        withDeleted: true,
      });
      if (existing) {
        existing.pageSlug = definition.pageSlug;
        existing.label = definition.label;
        existing.description = definition.description;
        existing.fields = definition.fields;
        existing.sortOrder = definition.sortOrder;
        existing.deletedAt = null;
        await this.definitionRepo.save(existing);
      } else {
        await this.definitionRepo.save(this.definitionRepo.create(definition));
      }
      upsertedCount++;
    }

    const staleDefinitions = await this.definitionRepo.find({
      where: { sectionKey: Not(In(SECTION_COMPONENT_KEYS)) },
      withDeleted: true,
    });
    if (staleDefinitions.length > 0)
      await this.definitionRepo.remove(staleDefinitions);

    console.log(
      `--- [Seed] Section definitions: synced ${upsertedCount} definition(s)` +
        (staleDefinitions.length > 0
          ? `, removed ${staleDefinitions.length} old one(s).`
          : '.'),
    );
  }
}
