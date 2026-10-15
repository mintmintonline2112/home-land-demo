'use client';

/**
 * Form tạo / sửa mục menu website: tên, đường dẫn, menu cha, thứ tự, hiển thị, mở khung submenu, bản dịch tiếng Trung.
 * Dùng bởi: menus/create/page.tsx, menus/edit/[id]/page.tsx.
 * Lưu ý: chỉ menu gốc (parentId null) được chọn làm menu cha, nên menu chỉ có 2 cấp.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import type { GenericFormField, GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import {
  VI_TRANSLATION_GROUP,
  buildViFields,
  viValuesFrom,
  buildViTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import { menuItemService, MENU_ITEM_QUERY_KEY } from '@/app/admin/(protected)/menus/_lib/menu-item.service';
import { adminRoutes } from '@/config/routes';

interface FormValues {
  label: string;
  href: string;
  parentId: string;
  description: string;
  isActive: boolean;
  showSubmenu: boolean;
  sortOrder: number;
  zh_label: string;
}

const ZH_KEYS = ['label'] as const;

const EMPTY_FORM_VALUES: FormValues = {
  label: '',
  href: '',
  parentId: '',
  description: '',
  isActive: true,
  showSubmenu: true,
  sortOrder: 1,
  zh_label: '',
};

export function MenuItemForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY_FORM_VALUES);
  const [formKey, setFormKey] = useState(0);

  const { data: allItems } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'options'],
    queryFn: () => menuItemService.paginate({ limit: 1000 }),
  });

  const parentOptions: GenericSelectOption[] = useMemo(
    () =>
      (allItems?.data ?? [])
        .filter((item) => item.parentId == null && item.id !== id)
        .map((item) => ({ label: item.label, value: item.id })),
    [allItems, id],
  );

  const { data } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'detail', id],
    queryFn: () => menuItemService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        label: data.label ?? '',
        href: data.href ?? '',
        parentId: data.parentId != null ? String(data.parentId) : '',
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        showSubmenu: data.showSubmenu ?? true,
        sortOrder: data.sortOrder ?? 1,
        ...viValuesFrom(data.translations, ZH_KEYS),
      });
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const fields: GenericFormField[] = useMemo(
    () => [
      { key: 'label', label: 'Tên hiển thị', type: 'text', required: true, placeholder: 'VD: Giải pháp điều trị' },
      { key: 'href', label: 'Đường dẫn', type: 'text', required: true, placeholder: '/properties hoặc /#featured', hint: 'Đường dẫn nội bộ (bắt đầu bằng /) hoặc link ngoài (https://...)' },
      { key: 'parentId', label: 'Thuộc menu', type: 'select', placeholder: '— Menu gốc (hiện trên header) —', options: parentOptions, hint: 'Chọn menu cha để biến mục này thành submenu' },
      { key: 'description', label: 'Ghi chú', type: 'text', placeholder: 'Ghi chú nội bộ (không hiển thị ngoài site)' },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 1, message: 'Tối thiểu là 1' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Cho phép hiển thị trên website' },
      { key: 'showSubmenu', label: 'Mở khung danh mục con', type: 'checkbox', hint: 'Bật: bấm menu mở khung danh mục bên phải. Tắt: bấm là đi thẳng tới trang (chỉ áp dụng menu gốc có submenu)' },
      ...buildViFields([{ key: 'label', label: 'Tên hiển thị', type: 'text' }]),
    ],
    [parentOptions],
  );

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        {
          label: values.label,
          href: values.href,
          description: values.description,
          isActive: values.isActive,
          showSubmenu: values.showSubmenu,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          parentId: values.parentId ? Number(values.parentId) : null,
          translations: buildViTranslationsPayload(values, ZH_KEYS, data?.translations),
        },
        { keepNull: ['parentId', 'translations'] },
      );

      if (isEdit) await menuItemService.edit(id!, payload);
      else await menuItemService.add(payload);

      await queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật menu' : 'Đã tạo menu');
      router.push(adminRoutes.menus.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa menu' : 'Tạo menu'}
      subtitle={isEdit ? 'Cập nhật mục menu website' : 'Thêm mục menu cho website'}
      breadcrumbs={[
        { label: 'Menu website', link: adminRoutes.menus.list },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={[VI_TRANSLATION_GROUP]}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(adminRoutes.menus.list)}
    />
  );
}
