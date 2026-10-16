'use client';

/**
 * Form tạo / sửa nhà đăng bán: thông tin chính + bộ ảnh + mô tả + tiện ích, rồi các nhóm Địa chỉ, Thông số, SEO.
 * Dùng bởi: properties/create/page.tsx, properties/edit/[id]/page.tsx.
 * Lưu ý: ô chữ tuỳ chọn bị xoá trắng thì gửi null để backend xoá giá trị cũ (NULLABLE_KEYS); ô số để trống thì gửi 0 (năm xây trống = null).
 * Tiện ích nhập dạng thẻ, lưu thành mảng chuỗi; mô tả là văn bản thường, mỗi đoạn cách nhau một dòng trống. Toạ độ để trống thì backend
 * tự lấy từ địa chỉ khi lưu (ghim nhà trên bản đồ website).
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import type { GalleryImage } from '@/app/admin/_components/generic-form/GalleryInput';
import type { GenericFormField, GenericFormGroup } from '@/app/admin/_components/generic-form/types';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import { toDateInputValue } from '@/app/admin/_lib/format-date';
import {
  PROPERTY_QUERY_KEY,
  PROPERTY_REGION_OPTIONS,
  PROPERTY_STATUS_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  propertyService,
} from '@/app/admin/(protected)/properties/_lib/property.service';
import { adminRoutes } from '@/config/routes';

interface FormValues {
  title: string;
  status: string;
  type: string;
  typeLabel: string;
  region: string;
  price: number | string;
  listedAt: string;
  isFeatured: boolean;
  isActive: boolean;
  images: GalleryImage[];
  description: string;
  amenities: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  latitude: string;
  longitude: string;
  beds: number | string;
  baths: number | string;
  sqft: number | string;
  garage: number | string;
  stories: number | string;
  yearBuilt: number | string;
  lotSize: string;
  facing: string;
  hoa: string;
  listingId: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
}

const EMPTY_FORM_VALUES: FormValues = {
  title: '',
  status: 'For Sale',
  type: 'house',
  typeLabel: '',
  region: 'orange-county',
  price: '',
  listedAt: '',
  isFeatured: false,
  isActive: true,
  images: [],
  description: '',
  amenities: '',
  address: '',
  neighborhood: '',
  city: '',
  state: 'CA',
  zip: '',
  latitude: '',
  longitude: '',
  beds: '',
  baths: '',
  sqft: '',
  garage: '',
  stories: 1,
  yearBuilt: '',
  lotSize: '',
  facing: '',
  hoa: '',
  listingId: '',
  slug: '',
  metaTitle: '',
  metaDescription: '',
};

const NULLABLE_KEYS = [
  'typeLabel',
  'listedAt',
  'description',
  'amenities',
  'images',
  'address',
  'neighborhood',
  'zip',
  'latitude',
  'longitude',
  'yearBuilt',
  'lotSize',
  'facing',
  'hoa',
  'listingId',
  'metaTitle',
  'metaDescription',
];

const GROUPS: GenericFormGroup[] = [
  { id: 'location', title: 'Địa chỉ', description: 'Thành phố / khu phố dùng cho bộ lọc khu vực; toạ độ dùng để ghim nhà trên bản đồ' },
  { id: 'specs', title: 'Thông số', description: 'Hiện ở mục Overview và Property Details của trang chi tiết' },
  { id: 'seo', title: 'SEO', collapsed: true },
];

const toWholeNumber = (value: number | string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
};

const toNullableText = (value: string) => value.trim() || null;

const toCoordinate = (value: string, limit: number) => {
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return value.trim() && Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
};

export function PropertyForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY_FORM_VALUES);
  const [formKey, setFormKey] = useState(0);

  const { data } = useQuery({
    queryKey: [...PROPERTY_QUERY_KEY, 'detail', id],
    queryFn: () => propertyService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!data) return;
    setInitialValues({
      title: data.title ?? '',
      status: data.status ?? 'For Sale',
      type: data.type ?? 'house',
      typeLabel: data.typeLabel ?? '',
      region: data.region ?? 'orange-county',
      price: data.price ?? '',
      listedAt: toDateInputValue(data.listedAt),
      isFeatured: Boolean(data.isFeatured),
      isActive: data.isActive !== false,
      images: data.images ?? [],
      description: data.description ?? '',
      amenities: (data.amenities ?? []).join(', '),
      address: data.address ?? '',
      neighborhood: data.neighborhood ?? '',
      city: data.city ?? '',
      state: data.state ?? 'CA',
      zip: data.zip ?? '',
      latitude: data.latitude != null ? String(data.latitude) : '',
      longitude: data.longitude != null ? String(data.longitude) : '',
      beds: data.beds ?? '',
      baths: data.baths ?? '',
      sqft: data.sqft ?? '',
      garage: data.garage ?? '',
      stories: data.stories ?? 1,
      yearBuilt: data.yearBuilt ?? '',
      lotSize: data.lotSize ?? '',
      facing: data.facing ?? '',
      hoa: data.hoa ?? '',
      listingId: data.listingId ?? '',
      slug: data.slug ?? '',
      metaTitle: data.metaTitle ?? '',
      metaDescription: data.metaDescription ?? '',
    });
    setFormKey((previousKey) => previousKey + 1);
  }, [data]);

  const fields: GenericFormField[] = useMemo(
    () => [
      { key: 'title', label: 'Tên nhà', type: 'text', required: true, placeholder: 'VD: Turtle Rock Estate' },
      { key: 'price', label: 'Giá (USD)', type: 'number', required: true, placeholder: 'VD: 1850000' },
      { key: 'status', label: 'Trạng thái bán', type: 'select', required: true, options: PROPERTY_STATUS_OPTIONS },
      {
        key: 'type',
        label: 'Loại nhà',
        type: 'select',
        required: true,
        options: PROPERTY_TYPE_OPTIONS,
        hint: 'Dùng cho bộ lọc "Property Type" ngoài website',
      },
      { key: 'typeLabel', label: 'Tên loại hiển thị', type: 'text', placeholder: 'VD: Single-Family Estate, Condominium' },
      {
        key: 'region',
        label: 'Vùng',
        type: 'select',
        required: true,
        options: PROPERTY_REGION_OPTIONS,
        hint: 'Dùng cho tab Orange County / Bay Area ở mục Featured Homes',
      },
      { key: 'listedAt', label: 'Ngày đăng', type: 'date', hint: 'Sắp xếp "Newest First" theo ngày này' },
      { key: 'isFeatured', label: 'Nổi bật', type: 'checkbox', hint: 'Hiện ở mục Featured Homes trang chủ' },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Bỏ tick để ẩn nhà khỏi website' },
      { key: 'images', label: 'Bộ ảnh', type: 'gallery', hint: 'Ảnh đầu tiên là ảnh bìa trên thẻ nhà. Dùng nút mũi tên để đổi thứ tự.' },
      {
        key: 'description',
        label: 'Mô tả',
        type: 'textarea',
        placeholder: 'Mỗi đoạn cách nhau một dòng trống',
      },
      { key: 'amenities', label: 'Tiện ích', type: 'tags', placeholder: 'Gõ rồi Enter, VD: Pool & Spa' },

      { key: 'address', label: 'Địa chỉ (số nhà, đường)', type: 'text', group: 'location', placeholder: 'VD: 12 Sendero' },
      { key: 'neighborhood', label: 'Khu phố', type: 'text', group: 'location', placeholder: 'VD: Turtle Rock (không bắt buộc)' },
      { key: 'city', label: 'Thành phố', type: 'text', required: true, group: 'location', placeholder: 'VD: Irvine' },
      { key: 'state', label: 'Bang', type: 'text', group: 'location', placeholder: 'CA' },
      { key: 'zip', label: 'ZIP', type: 'text', group: 'location', placeholder: 'VD: 92603' },
      {
        key: 'latitude',
        label: 'Vĩ độ (latitude)',
        type: 'text',
        group: 'location',
        placeholder: 'VD: 33.6412',
        hint: 'Để trống thì khi lưu hệ thống tự tìm toạ độ từ địa chỉ; không tìm thấy thì ghim ở giữa thành phố. Lấy toạ độ chính xác: chuột phải vào nhà trên Google Maps.',
      },
      { key: 'longitude', label: 'Kinh độ (longitude)', type: 'text', group: 'location', placeholder: 'VD: -117.7997' },

      { key: 'beds', label: 'Phòng ngủ', type: 'number', group: 'specs' },
      { key: 'baths', label: 'Phòng tắm', type: 'number', step: 0.25, group: 'specs' },
      { key: 'sqft', label: 'Diện tích (sqft)', type: 'number', group: 'specs' },
      { key: 'garage', label: 'Chỗ đậu xe trong garage', type: 'number', group: 'specs' },
      { key: 'stories', label: 'Số tầng', type: 'number', group: 'specs' },
      { key: 'yearBuilt', label: 'Năm xây', type: 'number', group: 'specs' },
      { key: 'lotSize', label: 'Diện tích lô đất', type: 'text', group: 'specs', placeholder: 'VD: 0.30 acres' },
      { key: 'facing', label: 'Hướng nhà', type: 'text', group: 'specs', placeholder: 'VD: Southeast' },
      { key: 'hoa', label: 'Phí HOA', type: 'text', group: 'specs', placeholder: 'VD: $250 / month' },
      { key: 'listingId', label: 'Mã tin (Listing ID)', type: 'text', group: 'specs', placeholder: 'VD: ST-2026-0812' },

      { key: 'slug', label: 'Slug (đường dẫn)', type: 'text', group: 'seo', placeholder: 'Để trống để tự sinh từ tên nhà' },
      { key: 'metaTitle', label: 'Meta Title', type: 'text', group: 'seo', placeholder: 'Trống thì dùng "Tên nhà, Thành phố"' },
      { key: 'metaDescription', label: 'Meta Description', type: 'textarea', group: 'seo' },
    ],
    [],
  );

  async function handleSubmit(values: FormValues) {
    if (toWholeNumber(values.price) <= 0) {
      toast.error('Giá phải lớn hơn 0');
      return;
    }
    setIsSubmitting(true);
    try {
      const amenities = values.amenities
        .split(',')
        .map((amenity) => amenity.trim())
        .filter(Boolean);
      const images = (values.images ?? []).map((image) => ({ src: image.src, alt: image.alt.trim() }));
      const yearBuilt = toWholeNumber(values.yearBuilt);
      const payload = buildPayload(
        {
          title: values.title.trim(),
          slug: values.slug.trim() || undefined,
          status: values.status,
          type: values.type,
          typeLabel: toNullableText(values.typeLabel),
          region: values.region,
          price: toWholeNumber(values.price),
          listedAt: values.listedAt || null,
          isFeatured: Boolean(values.isFeatured),
          isActive: Boolean(values.isActive),
          images: images.length > 0 ? images : null,
          description: toNullableText(values.description),
          amenities: amenities.length > 0 ? amenities : null,
          address: toNullableText(values.address),
          neighborhood: toNullableText(values.neighborhood),
          city: values.city.trim(),
          state: values.state.trim().toUpperCase() || 'CA',
          zip: toNullableText(values.zip),
          latitude: toCoordinate(values.latitude, 90),
          longitude: toCoordinate(values.longitude, 180),
          beds: toWholeNumber(values.beds),
          baths: Math.max(0, Math.round((Number(values.baths) || 0) * 100) / 100),
          sqft: toWholeNumber(values.sqft),
          garage: toWholeNumber(values.garage),
          stories: toWholeNumber(values.stories) || 1,
          yearBuilt: yearBuilt >= 1800 ? yearBuilt : null,
          lotSize: toNullableText(values.lotSize),
          facing: toNullableText(values.facing),
          hoa: toNullableText(values.hoa),
          listingId: toNullableText(values.listingId),
          metaTitle: toNullableText(values.metaTitle),
          metaDescription: toNullableText(values.metaDescription),
        },
        { keepNull: isEdit ? NULLABLE_KEYS : [] },
      );

      if (isEdit) await propertyService.edit(id!, payload);
      else await propertyService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật nhà' : 'Đã đăng nhà mới');
      router.push(adminRoutes.properties.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa nhà đăng bán' : 'Đăng nhà mới'}
      subtitle={isEdit ? 'Cập nhật thông tin, ảnh, giá của căn nhà' : 'Thêm một căn nhà vào trang Property Search'}
      breadcrumbs={[
        { label: 'Nhà đăng bán', link: adminRoutes.properties.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={GROUPS}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Đăng nhà'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.properties.list)}
    />
  );
}
