'use client';

/**
 * Màn hình Admin → Trang Liên hệ: gom mọi nội dung khách tự chỉnh của trang Liên hệ (tiêu đề, mạng xã hội, công ty, form) về một chỗ.
 * Dùng bởi: contact-page/page.tsx.
 * Lưu ý: lưu vào site_settings key `contactPage` (1 JSON), website đọc qua getSiteSettings().contactPage; trường trống thì
 * website dùng mặc định. Thứ tự khối trùng thứ tự hiển thị ngoài trang. Lưu kèm socialLinks = contactPage.social.
 */

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { settingsService, SETTINGS_QUERY_KEY } from '@/app/admin/(protected)/settings/_lib/settings.service';
import { SITE_CONTACT } from '@/config/contact';
import { siteRoutes } from '@/config/routes';
import type { ContactInterest, ContactPageConfig } from '@/settings/contact-page';
import { DEFAULT_INTERESTS } from '@/settings/contact-page';

type Hero = { eyebrow: string; title: string; lead: string; zhEyebrow: string; zhTitle: string; zhLead: string };
type Social = { facebook: string; youtube: string; instagram: string; tiktok: string };
type Company = {
  name: string; location: string; address: string; phone: string; email: string; hours: string;
  mapUrl: string; zhName: string; zhLocation: string; zhAddress: string;
};
type FormConfig = { enabled: boolean; kicker: string; title: string; note: string; zhKicker: string; zhTitle: string; zhNote: string };
type Interest = { value: string; zh: string };

const EMPTY_HERO: Hero = { eyebrow: '', title: '', lead: '', zhEyebrow: '', zhTitle: '', zhLead: '' };
const EMPTY_SOCIAL: Social = { facebook: '', youtube: '', instagram: '', tiktok: '' };
const EMPTY_COMPANY: Company = {
  name: '', location: '', address: '', phone: '', email: '', hours: '', mapUrl: '',
  zhName: '', zhLocation: '', zhAddress: '',
};
const EMPTY_FORM: FormConfig = { enabled: true, kicker: '', title: '', note: '', zhKicker: '', zhTitle: '', zhNote: '' };

const toText = (value: unknown) => (typeof value === 'string' ? value : '');
const dropEmptyFields = <T extends Record<string, unknown>>(source: T): Partial<T> | undefined => {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') { if (value.trim()) kept[key] = value.trim(); }
    else if (value !== undefined && value !== null && !(typeof value === 'object' && !Object.keys(value as object).length)) kept[key] = value;
  }
  return Object.keys(kept).length ? (kept as Partial<T>) : undefined;
};
const removeUndefinedKeys = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function ContactPageScreen() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [hero, setHero] = useState<Hero>(EMPTY_HERO);
  const [social, setSocial] = useState<Social>(EMPTY_SOCIAL);
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);
  const [form, setForm] = useState<FormConfig>(EMPTY_FORM);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newInterest, setNewInterest] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [...SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.get(),
  });

  useEffect(() => {
    if (!data) return;
    const config = (data.contactPage ?? {}) as ContactPageConfig;
    setHero({
      eyebrow: toText(config.hero?.eyebrow), title: toText(config.hero?.title), lead: toText(config.hero?.lead),
      zhEyebrow: toText(config.hero?.vi?.eyebrow), zhTitle: toText(config.hero?.vi?.title), zhLead: toText(config.hero?.vi?.lead),
    });
    const savedSocial = config.social ?? data.socialLinks ?? {};
    setSocial({ facebook: toText(savedSocial.facebook), youtube: toText(savedSocial.youtube), instagram: toText(savedSocial.instagram), tiktok: toText(savedSocial.tiktok) });
    setCompany({
      name: toText(config.company?.name), location: toText(config.company?.location),
      address: toText(config.company?.address), phone: toText(config.company?.phone),
      email: toText(config.company?.email), hours: toText(config.company?.hours), mapUrl: toText(config.company?.mapUrl),
      zhName: toText(config.company?.vi?.name), zhLocation: toText(config.company?.vi?.location),
      zhAddress: toText(config.company?.vi?.address),
    });
    setForm({
      enabled: config.form?.enabled !== false,
      kicker: toText(config.form?.kicker), title: toText(config.form?.title), note: toText(config.form?.note),
      zhKicker: toText(config.form?.vi?.kicker), zhTitle: toText(config.form?.vi?.title), zhNote: toText(config.form?.vi?.note),
    });
    const savedInterests = config.form?.interests?.length ? config.form.interests : DEFAULT_INTERESTS;
    setInterests(savedInterests.map((interest: ContactInterest) => ({ value: toText(interest.value), zh: toText(interest.vi) })));
  }, [data]);

  function moveInterest(index: number, direction: -1 | 1) {
    setInterests((currentInterests) => {
      const next = [...currentInterests];
      const target = index + direction;
      if (target < 0 || target >= next.length) return currentInterests;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addInterest() {
    const value = newInterest.trim();
    if (!value) return;
    if (interests.some((interest) => interest.value.toLowerCase() === value.toLowerCase())) {
      toast.error('Nhu cầu này đã có trong danh sách');
      return;
    }
    setInterests((currentInterests) => [...currentInterests, { value, zh: '' }]);
    setNewInterest('');
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const contactPage: ContactPageConfig = {
        hero: dropEmptyFields({
          eyebrow: hero.eyebrow, title: hero.title, lead: hero.lead,
          vi: dropEmptyFields({ eyebrow: hero.zhEyebrow, title: hero.zhTitle, lead: hero.zhLead }),
        }),
        social: dropEmptyFields({ ...social }),
        company: dropEmptyFields({
          name: company.name, location: company.location, address: company.address,
          phone: company.phone, email: company.email, hours: company.hours, mapUrl: company.mapUrl,
          vi: dropEmptyFields({ name: company.zhName, location: company.zhLocation, address: company.zhAddress }),
        }),
        form: dropEmptyFields({
          enabled: form.enabled,
          kicker: form.kicker, title: form.title, note: form.note,
          interests: interests
            .map((interest) => ({ value: interest.value.trim(), ...(interest.zh.trim() ? { vi: interest.zh.trim() } : {}) }))
            .filter((interest) => interest.value),
          vi: dropEmptyFields({ kicker: form.zhKicker, title: form.zhTitle, note: form.zhNote }),
        }),
      };
      const payload = removeUndefinedKeys({ contactPage, socialLinks: contactPage.social ?? null });
      await settingsService.update(payload);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      toast.success('Đã lưu — trang Liên hệ cập nhật ngay');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="dt-empty">Đang tải cấu hình…</p>;

  const renderTextField = (
    label: string, value: string, onChange: (nextValue: string) => void,
    options: { placeholder?: string; hint?: string; rows?: number; type?: string } = {},
  ) => (
    <div>
      <label className="gf-label">{label}</label>
      {options.rows ? (
        <textarea className="gf-control" rows={options.rows} value={value} placeholder={options.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="gf-control" type={options.type ?? 'text'} value={value} placeholder={options.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {options.hint && <p className="gf-hint">{options.hint}</p>}
    </div>
  );

  return (
    <div className="st-screen">
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Trang Liên hệ</h1>
          <p className="adm-page-subtitle">
            Tiêu đề, mạng xã hội, thông tin công ty và form báo giá hiển thị tại trang Liên hệ
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="adm-btn" href={siteRoutes.contact} target="_blank" rel="noopener noreferrer">
            Xem trang ↗
          </a>
          <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave} disabled={isSaving}>
            {isSaving && <span className="adm-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Tiêu đề trang</h2>
        {renderTextField('Dòng nhỏ phía trên (eyebrow)', hero.eyebrow, (value) => setHero({ ...hero, eyebrow: value }), { placeholder: 'Kết nối' })}
        {renderTextField('Tiêu đề', hero.title, (value) => setHero({ ...hero, title: value }), { placeholder: 'Liên hệ tư vấn' })}
        {renderTextField('Đoạn dẫn', hero.lead, (value) => setHero({ ...hero, lead: value }), {
          rows: 2, placeholder: 'Chia sẻ tình trạng và nhu cầu của bạn để nhận hướng dẫn cho bước thăm khám phù hợp.',
          hint: 'Để trống thì dùng nội dung mặc định.',
        })}
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong><small>Để trống thì website dùng bản tiếng Anh.</small></summary>
          <div className="gf-group-body">
            {renderTextField('Eyebrow (Tiếng Việt)', hero.zhEyebrow, (value) => setHero({ ...hero, zhEyebrow: value }), { placeholder: '联系我们' })}
            {renderTextField('Tiêu đề (Tiếng Việt)', hero.zhTitle, (value) => setHero({ ...hero, zhTitle: value }), { placeholder: '联系咨询' })}
            {renderTextField('Đoạn dẫn (Tiếng Việt)', hero.zhLead, (value) => setHero({ ...hero, zhLead: value }), { rows: 2 })}
          </div>
        </details>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Mạng xã hội</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Các khung nằm dưới hotline và Zalo trong mục &ldquo;Kết nối với chúng tôi&rdquo;. Để trống mạng nào thì ẩn mạng đó.
        </p>
        {(
          [
            ['facebook', 'Facebook', 'https://facebook.com/ten-trang'],
            ['youtube', 'YouTube', 'https://youtube.com/@kenh'],
            ['instagram', 'Instagram', 'https://instagram.com/tai-khoan'],
            ['tiktok', 'TikTok', 'https://tiktok.com/@tai-khoan'],
          ] as const
        ).map(([key, label, placeholder]) => (
          <div key={key}>
            {renderTextField(label, social[key], (value) => setSocial({ ...social, [key]: value }), { placeholder, type: 'url' })}
          </div>
        ))}
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Thông tin công ty</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Hiện ở trang Liên hệ, chân trang và thanh trên cùng (điện thoại, email). Để trống ô nào
          thì website dùng giá trị mặc định trong code (chữ mờ trong ô).
        </p>
        {renderTextField('Tên công ty', company.name, (value) => setCompany({ ...company, name: value }), { placeholder: 'Sean Truong' })}
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{renderTextField('Thành phố, bang, ZIP', company.location, (value) => setCompany({ ...company, location: value }), { placeholder: SITE_CONTACT.location })}</div>
          <div style={{ flex: 1 }}>{renderTextField('Điện thoại', company.phone, (value) => setCompany({ ...company, phone: value }), { placeholder: SITE_CONTACT.phone, type: 'tel' })}</div>
        </div>
        {renderTextField('Địa chỉ', company.address, (value) => setCompany({ ...company, address: value }), { rows: 2, placeholder: SITE_CONTACT.address })}
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{renderTextField('Email', company.email, (value) => setCompany({ ...company, email: value }), { placeholder: SITE_CONTACT.email, type: 'email' })}</div>
          <div style={{ flex: 1 }}>{renderTextField('Giờ mở cửa', company.hours, (value) => setCompany({ ...company, hours: value }), { placeholder: SITE_CONTACT.hours })}</div>
        </div>
        {renderTextField('Link Google Maps (tùy chọn)', company.mapUrl, (value) => setCompany({ ...company, mapUrl: value }), { placeholder: 'https://maps.app.goo.gl/...', type: 'url' })}
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong><small>Điện thoại / email dùng chung, chỉ dịch tên và địa chỉ.</small></summary>
          <div className="gf-group-body">
            {renderTextField('Tên công ty (Tiếng Việt)', company.zhName, (value) => setCompany({ ...company, zhName: value }))}
            {renderTextField('Quốc gia / khu vực (Tiếng Việt)', company.zhLocation, (value) => setCompany({ ...company, zhLocation: value }))}
            {renderTextField('Địa chỉ (Tiếng Việt)', company.zhAddress, (value) => setCompany({ ...company, zhAddress: value }), { rows: 2 })}
          </div>
        </details>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Form tư vấn</h2>
        <label className="gf-check st-feature">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <span>
            <strong>Hiện form gửi yêu cầu tư vấn</strong>
            <small>Yêu cầu gửi về mục Khách hàng → Liên hệ và chuông thông báo. Tắt thì trang chỉ còn thông tin + mạng xã hội.</small>
          </span>
        </label>
        {renderTextField('Dòng nhỏ phía trên', form.kicker, (value) => setForm({ ...form, kicker: value }), { placeholder: 'Đặt lịch tư vấn' })}
        {renderTextField('Tiêu đề khối', form.title, (value) => setForm({ ...form, title: value }), { placeholder: 'Gửi yêu cầu cho liên hệ' })}
        {renderTextField('Ghi chú dưới nút gửi', form.note, (value) => setForm({ ...form, note: value }), {
          rows: 2, placeholder: 'Thông tin của bạn chỉ dùng để liên hệ liên hệ tư vấn, không chia sẻ cho bên thứ ba.',
        })}

        <div>
          <label className="gf-label">Danh sách &ldquo;Nhu cầu quan tâm&rdquo;</label>
          <p className="gf-hint" style={{ marginTop: 0 }}>
            Các lựa chọn trong ô chọn dịch vụ của form. Cột 中文 là nhãn hiện ở bản tiếng Trung (để trống thì dùng tiếng Việt).
          </p>
          <div className="cp-interests">
            {interests.map((item, index) => (
              <div className="cp-interest-row" key={`${item.value}-${index}`}>
                <input
                  className="gf-control"
                  value={item.value}
                  onChange={(e) => setInterests((currentInterests) => currentInterests.map((interest, i) => (i === index ? { ...interest, value: e.target.value } : interest)))}
                  placeholder="Tên nhu cầu (tiếng Việt)"
                />
                <input
                  className="gf-control"
                  value={item.zh}
                  onChange={(e) => setInterests((currentInterests) => currentInterests.map((interest, i) => (i === index ? { ...interest, zh: e.target.value } : interest)))}
                  placeholder="中文"
                />
                <div className="cp-interest-actions">
                  <button type="button" className="adm-icon-btn" title="Lên" disabled={index === 0} onClick={() => moveInterest(index, -1)}><ArrowUp size={15} /></button>
                  <button type="button" className="adm-icon-btn" title="Xuống" disabled={index === interests.length - 1} onClick={() => moveInterest(index, 1)}><ArrowDown size={15} /></button>
                  <button type="button" className="adm-icon-btn is-danger" title="Xóa" onClick={() => setInterests((currentInterests) => currentInterests.filter((_, i) => i !== index))}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            <div className="cp-interest-row is-new">
              <input
                className="gf-control"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                placeholder="Thêm nhu cầu mới, ví dụ: Tư vấn cấy ghép Implant"
              />
              <button type="button" className="adm-btn" onClick={addInterest}><Plus size={15} /> Thêm</button>
            </div>
          </div>
        </div>

        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Việt</strong></summary>
          <div className="gf-group-body">
            {renderTextField('Dòng nhỏ (Tiếng Việt)', form.zhKicker, (value) => setForm({ ...form, zhKicker: value }), { placeholder: '预约咨询' })}
            {renderTextField('Tiêu đề khối (Tiếng Việt)', form.zhTitle, (value) => setForm({ ...form, zhTitle: value }), { placeholder: '向诊所发送预约请求' })}
            {renderTextField('Ghi chú (Tiếng Việt)', form.zhNote, (value) => setForm({ ...form, zhNote: value }), { rows: 2 })}
          </div>
        </details>
      </section>

    </div>
  );
}
