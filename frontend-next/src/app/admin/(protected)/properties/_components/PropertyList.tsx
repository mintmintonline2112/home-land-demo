'use client';

/**
 * Bảng danh sách nhà đăng bán: ảnh bìa, tên, khu vực, giá, nổi bật, ẩn / hiện, thứ tự; lọc theo loại, vùng, nổi bật, hiện; sửa, xoá.
 * Dùng bởi: properties/page.tsx.
 * Lưu ý: bộ lọc boolean gửi 1 / 0 vì cột tinyint của MySQL không so được với chuỗi "true" / "false".
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/app/admin/_components/data-table/DataTable';
import type { TableColumn, TableActionEvent, TableFilterOption } from '@/app/admin/_components/data-table/types';
import { confirmAction } from '@/app/admin/_lib/confirm';
import { ACTIVE_STATUS_CONFIG } from '@/app/admin/_lib/publish-status';
import {
  PROPERTY_QUERY_KEY,
  PROPERTY_REGION_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  formatUsd,
  labelOf,
  propertyService,
  type Property,
} from '@/app/admin/(protected)/properties/_lib/property.service';
import { adminRoutes } from '@/config/routes';

const YES_NO_OPTIONS = [
  { label: 'Có', value: '1' },
  { label: 'Không', value: '0' },
];

export function PropertyList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const columns: TableColumn<Property>[] = useMemo(
    () => [
      { key: 'sortOrder', label: 'Thứ tự', type: 'sort', align: 'center' },
      { key: 'cover', label: 'Ảnh', type: 'image', align: 'center', value: (row) => row.images?.[0]?.src ?? null },
      {
        key: 'title',
        label: 'Tên nhà',
        type: 'text',
        align: 'left',
        link: (row) => adminRoutes.properties.edit(row.id),
      },
      {
        key: 'city',
        label: 'Khu vực',
        type: 'custom',
        align: 'left',
        render: (row) => `${row.city} · ${labelOf(PROPERTY_REGION_OPTIONS, row.region)}`,
      },
      {
        key: 'type',
        label: 'Loại',
        type: 'custom',
        align: 'center',
        render: (row) => labelOf(PROPERTY_TYPE_OPTIONS, row.type),
      },
      { key: 'price', label: 'Giá', type: 'custom', align: 'right', render: (row) => formatUsd(row.price) },
      { key: 'isFeatured', label: 'Nổi bật', type: 'custom', align: 'center', render: (row) => (row.isFeatured ? '★' : '—') },
      { key: 'isActive', label: 'Hiển thị', type: 'status', align: 'center', statusConfig: ACTIVE_STATUS_CONFIG },
      { key: 'actions', label: 'Thao tác', type: 'action', align: 'center' },
    ],
    [],
  );

  const filters: TableFilterOption[] = useMemo(
    () => [
      { key: 'type', label: 'Tất cả loại nhà', options: PROPERTY_TYPE_OPTIONS },
      { key: 'region', label: 'Tất cả vùng', options: PROPERTY_REGION_OPTIONS },
      { key: 'isFeatured', label: 'Nổi bật?', options: YES_NO_OPTIONS },
      { key: 'isActive', label: 'Đang hiện?', options: YES_NO_OPTIONS },
    ],
    [],
  );

  async function handleAction(event: TableActionEvent<Property>) {
    const item = event.item;
    switch (event.action) {
      case 'add':
        router.push(adminRoutes.properties.create);
        break;
      case 'edit':
        if (item?.id) router.push(adminRoutes.properties.edit(item.id));
        break;
      case 'sort':
        if (item?.id && event.value) {
          await propertyService.sort(item.id, event.value);
          queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEY });
        }
        break;
      case 'toggle':
        if (item?.id) {
          await propertyService.edit(item.id, { isActive: !item.isActive });
          queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEY });
        }
        break;
      case 'delete':
        if (item?.id) {
          await confirmAction(
            {
              title: 'Xóa nhà này?',
              text: `"${item.title}" sẽ bị gỡ khỏi website. Thao tác này không thể hoàn tác.`,
              confirmButtonText: 'Xóa',
            },
            () => propertyService.remove(item.id),
          );
          queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEY });
        }
        break;
    }
  }

  return (
    <DataTable<Property>
      title="Nhà đăng bán"
      subtitle="Danh sách nhà hiển thị ở trang Property Search và mục Featured Homes"
      queryKey={[...PROPERTY_QUERY_KEY]}
      columns={columns}
      fetcher={(params) => propertyService.paginate(params)}
      addLabel="Đăng nhà mới"
      searchPlaceholder="Tìm theo tên nhà, thành phố, mã tin…"
      filters={filters}
      enabledActions={['toggle', 'edit', 'delete']}
      onAction={handleAction}
    />
  );
}
