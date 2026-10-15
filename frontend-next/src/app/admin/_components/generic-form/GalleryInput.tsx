'use client';

/**
 * Ô nhập bộ ảnh (field `gallery` của GenericForm): danh sách ảnh có xem trước, ô mô tả (alt), nút lên / xuống / xoá, thêm ảnh từ Thư viện hoặc dán link.
 * Dùng bởi: GenericForm.tsx (PropertyForm.tsx dùng cho ảnh nhà).
 * Lưu ý: giá trị là mảng {src, alt}; ảnh đầu tiên là ảnh bìa ngoài website. Ảnh chọn từ Thư viện được rút về "uploads/..." (không dính domain).
 */

import { useState } from 'react';
import { ArrowDown, ArrowUp, Image as ImageIcon, Plus, X } from 'lucide-react';
import { LibraryPicker } from '@/app/admin/_components/library-picker/LibraryPicker';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';

export type GalleryImage = { src: string; alt: string };

const toStoredPath = (url: string) =>
  /\/uploads\//.test(url) ? url.replace(/^https?:\/\/[^/]+\//i, '').replace(/^\//, '') : url.trim();

export function GalleryInput({
  value,
  onChange,
  disabled,
}: {
  value: GalleryImage[];
  onChange: (value: GalleryImage[]) => void;
  disabled?: boolean;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const images = Array.isArray(value) ? value : [];

  function addImage(src: string) {
    const path = toStoredPath(src);
    if (!path || images.some((image) => image.src === path)) return;
    onChange([...images, { src: path, alt: '' }]);
  }

  function updateAlt(index: number, alt: string) {
    onChange(images.map((image, imageIndex) => (imageIndex === index ? { ...image, alt } : image)));
  }

  function moveImage(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  }

  return (
    <div className="gf-gallery">
      {images.length > 0 ? (
        <ol className="gf-gallery-list">
          {images.map((image, index) => (
            <li key={image.src} className="gf-gallery-item">
              <div className="gf-gallery-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resolveImageUrl(image.src) ?? image.src} alt="" />
                {index === 0 ? <span className="gf-gallery-badge">Ảnh bìa</span> : null}
              </div>
              <input
                className="gf-control"
                value={image.alt}
                onChange={(e) => updateAlt(index, e.target.value)}
                placeholder="Mô tả ảnh (VD: Kitchen, Pool and backyard)"
                disabled={disabled}
              />
              <div className="gf-gallery-actions">
                <button type="button" className="adm-btn adm-btn--sm" onClick={() => moveImage(index, -1)} disabled={disabled || index === 0} aria-label="Đưa lên">
                  <ArrowUp size={14} />
                </button>
                <button type="button" className="adm-btn adm-btn--sm" onClick={() => moveImage(index, 1)} disabled={disabled || index === images.length - 1} aria-label="Đưa xuống">
                  <ArrowDown size={14} />
                </button>
                <button type="button" className="adm-btn adm-btn--sm" onClick={() => removeImage(index)} disabled={disabled} aria-label="Xoá ảnh">
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="gf-hint">Chưa có ảnh nào.</p>
      )}

      {!disabled && (
        <div className="gf-imageurl-row">
          <button type="button" className="adm-btn" onClick={() => setIsPickerOpen(true)}>
            <ImageIcon size={14} />
            Thêm từ Thư viện
          </button>
          <input
            className="gf-control"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="hoặc dán link ảnh https://..."
          />
          <button
            type="button"
            className="adm-btn"
            onClick={() => {
              addImage(linkText);
              setLinkText('');
            }}
            disabled={!linkText.trim()}
          >
            <Plus size={14} />
            Thêm
          </button>
        </div>
      )}

      <LibraryPicker isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={addImage} />
    </div>
  );
}
