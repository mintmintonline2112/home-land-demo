/**
 * Nhóm field "Bản dịch tiếng Việt" dùng chung cho form CMS: dựng field `zh_<key>`, đọc giá trị từ translations.vi, gom lại thành payload.
 * Dùng bởi: BlogCategoryForm, BlogPostForm, MenuItemForm, PageSectionForm, PageForm trong app/admin/(protected).
 * Lưu ý: backend nhận `translations: { vi: { field } }`; trường để trống thì site (?lang=vi) dùng bản tiếng Anh. Richtext chỉ có <p></p> coi là rỗng;
 * key cũ không nằm trong danh sách được giữ nguyên; trả null khi không còn bản dịch nào (gửi translations: null để xóa).
 */
import type { GenericFormField, GenericFormGroup } from '@/app/admin/_components/generic-form/types';

export const VI_TRANSLATION_GROUP: GenericFormGroup = {
  id: 'zh',
  title: 'Bản dịch tiếng Việt',
  description: 'Để trống trường nào thì website hiển thị bản tiếng Anh của trường đó.',
  collapsed: true,
};

export type ViFieldSpec = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext';
  placeholder?: string;
};

export const viFieldKey = (key: string) => `zh_${key}`;

export function buildViFields(specs: ViFieldSpec[]): GenericFormField[] {
  return specs.map((spec) => ({
    key: viFieldKey(spec.key),
    label: `${spec.label} (Tiếng Việt)`,
    type: spec.type,
    group: VI_TRANSLATION_GROUP.id,
    placeholder: spec.placeholder,
  }));
}

function viTranslationOf(translations: unknown): Record<string, unknown> {
  if (!translations || typeof translations !== 'object') return {};
  const viTranslation = (translations as Record<string, unknown>).vi;
  if (!viTranslation || typeof viTranslation !== 'object' || Array.isArray(viTranslation)) return {};
  return viTranslation as Record<string, unknown>;
}

export type ViValues<K extends string> = { [P in K as `zh_${P}`]: string };

export function viValuesFrom<K extends string>(
  translations: unknown,
  keys: readonly K[],
): ViValues<K> {
  const viTranslation = viTranslationOf(translations);
  const values: Record<string, string> = {};
  for (const key of keys) {
    const value = viTranslation[key];
    values[viFieldKey(key)] = typeof value === 'string' ? value : value == null ? '' : String(value);
  }
  return values as ViValues<K>;
}

const EMPTY_RICHTEXT_PATTERN = /^(\s*<p>\s*<\/p>\s*)+$/;

function toCleanTranslation(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || EMPTY_RICHTEXT_PATTERN.test(trimmed)) return null;
  return trimmed;
}

export function buildViTranslationsPayload(
  values: object,
  keys: readonly string[],
  existing?: unknown,
): Record<string, Record<string, unknown>> | null {
  const viTranslation: Record<string, unknown> = {};
  const source = values as Record<string, unknown>;

  for (const [key, value] of Object.entries(viTranslationOf(existing))) {
    if (!keys.includes(key)) viTranslation[key] = value;
  }

  for (const key of keys) {
    const cleaned = toCleanTranslation(source[viFieldKey(key)]);
    if (cleaned !== null) viTranslation[key] = cleaned;
  }

  return Object.keys(viTranslation).length > 0 ? { vi: viTranslation } : null;
}
