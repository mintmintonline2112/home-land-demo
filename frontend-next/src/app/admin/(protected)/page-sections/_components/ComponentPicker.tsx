'use client';

/**
 * Chọn loại khối bằng thẻ có hình minh hoạ bố cục (hero, slider, lưới thẻ, accordion…) + tên + key thay cho dropdown.
 * Dùng bởi: PageSectionForm.tsx.
 * Lưu ý: hình vẽ (khung 120×72) chọn theo sectionKey qua SKETCH_BY_KEY, key lạ dùng hình generic; section mới thì thêm
 * hình ở SKETCHES + SKETCH_BY_KEY (scripts/new-section.mjs nhắc bước này). genericValue = lựa chọn "không dùng component";
 * isLocked (sửa section) chỉ hiện thẻ đang dùng, không đổi được. Nhóm theo pageSlug, thứ tự nhóm theo GROUP_ORDER.
 */

import type { ReactNode } from 'react';
import type { SectionDefinition } from '@/app/admin/(protected)/page-sections/_lib/page-section.service';

const SKETCH_COLORS = { ink: '#14335C', soft: '#8E98B0', gold: '#2A5A96', line: '#DDE3EE' };

const drawRect = (x: number, y: number, width: number, height: number, fill: string, rx = 2) => (
  <rect key={`${x}-${y}-${width}-${height}-${fill}`} x={x} y={y} width={width} height={height} rx={rx} fill={fill} />
);

const drawDot = (cx: number, cy: number, radius: number, fill: string) => (
  <circle key={`${cx}-${cy}-${radius}-${fill}`} cx={cx} cy={cy} r={radius} fill={fill} />
);

const SKETCHES: Record<string, ReactNode> = {
  hero: <>{drawRect(8, 12, 54, 8, SKETCH_COLORS.ink)}{drawRect(8, 24, 40, 5, SKETCH_COLORS.soft)}{drawRect(8, 36, 22, 8, SKETCH_COLORS.gold)}{drawRect(8, 52, 10, 10, SKETCH_COLORS.line)}{drawRect(22, 52, 10, 10, SKETCH_COLORS.line)}{drawRect(36, 52, 10, 10, SKETCH_COLORS.line)}{drawRect(70, 8, 42, 56, SKETCH_COLORS.line, 3)}</>,
  heroSlider: <>{drawRect(8, 8, 104, 56, SKETCH_COLORS.line, 3)}{drawRect(16, 20, 44, 8, SKETCH_COLORS.ink)}{drawRect(16, 32, 34, 5, SKETCH_COLORS.soft)}{drawRect(16, 44, 20, 8, SKETCH_COLORS.gold)}{drawDot(100, 24, 3, SKETCH_COLORS.gold)}{drawDot(100, 34, 3, SKETCH_COLORS.soft)}{drawDot(100, 44, 3, SKETCH_COLORS.soft)}</>,
  map: <>{drawRect(8, 8, 104, 44, SKETCH_COLORS.ink, 3)}{drawDot(30, 28, 3, SKETCH_COLORS.gold)}{drawDot(58, 22, 3, SKETCH_COLORS.gold)}{drawDot(78, 32, 3, SKETCH_COLORS.gold)}{drawDot(94, 24, 3, SKETCH_COLORS.gold)}{drawRect(24, 58, 20, 6, SKETCH_COLORS.line, 3)}{drawRect(50, 58, 20, 6, SKETCH_COLORS.line, 3)}{drawRect(76, 58, 20, 6, SKETCH_COLORS.line, 3)}</>,
  mapList: <>{drawRect(8, 10, 34, 8, SKETCH_COLORS.ink)}{drawRect(8, 22, 34, 8, SKETCH_COLORS.line)}{drawRect(8, 34, 34, 8, SKETCH_COLORS.line)}{drawRect(8, 46, 34, 8, SKETCH_COLORS.line)}{drawRect(50, 8, 62, 56, SKETCH_COLORS.ink, 3)}{drawDot(70, 30, 3, SKETCH_COLORS.gold)}{drawDot(88, 24, 3, SKETCH_COLORS.gold)}{drawDot(100, 36, 3, SKETCH_COLORS.gold)}</>,
  bigCards: <>{drawRect(8, 8, 50, 26, SKETCH_COLORS.ink, 4)}{drawRect(62, 8, 50, 26, SKETCH_COLORS.soft, 4)}{drawRect(8, 38, 50, 26, SKETCH_COLORS.soft, 4)}{drawRect(62, 38, 50, 26, SKETCH_COLORS.ink, 4)}{drawRect(13, 13, 9, 4, '#FFFFFF', 2)}{drawRect(67, 13, 9, 4, '#FFFFFF', 2)}{drawRect(13, 43, 9, 4, '#FFFFFF', 2)}{drawRect(67, 43, 9, 4, '#FFFFFF', 2)}{drawRect(13, 26, 18, 4, SKETCH_COLORS.gold, 2)}{drawRect(67, 26, 18, 4, SKETCH_COLORS.gold, 2)}{drawRect(13, 56, 18, 4, SKETCH_COLORS.gold, 2)}{drawRect(67, 56, 18, 4, SKETCH_COLORS.gold, 2)}</>,
  photos: <>{drawDot(22, 24, 12, SKETCH_COLORS.line)}{drawDot(52, 24, 12, SKETCH_COLORS.line)}{drawDot(82, 24, 12, SKETCH_COLORS.line)}{drawRect(12, 44, 20, 5, SKETCH_COLORS.soft)}{drawRect(42, 44, 20, 5, SKETCH_COLORS.soft)}{drawRect(72, 44, 20, 5, SKETCH_COLORS.soft)}{drawRect(20, 56, 80, 8, SKETCH_COLORS.ink, 3)}</>,
  listIcon: <>{drawDot(18, 18, 7, SKETCH_COLORS.gold)}{drawRect(32, 14, 70, 8, SKETCH_COLORS.line)}{drawDot(18, 38, 7, SKETCH_COLORS.gold)}{drawRect(32, 34, 70, 8, SKETCH_COLORS.line)}{drawDot(18, 58, 7, SKETCH_COLORS.gold)}{drawRect(32, 54, 70, 8, SKETCH_COLORS.line)}</>,
  slider: <>{drawRect(8, 8, 104, 34, SKETCH_COLORS.line, 3)}{drawDot(16, 25, 4, SKETCH_COLORS.ink)}{drawDot(104, 25, 4, SKETCH_COLORS.ink)}{drawRect(10, 50, 18, 14, SKETCH_COLORS.gold, 2)}{drawRect(32, 50, 18, 14, SKETCH_COLORS.ink, 2)}{drawRect(54, 50, 18, 14, SKETCH_COLORS.ink, 2)}{drawRect(76, 50, 18, 14, SKETCH_COLORS.ink, 2)}{drawRect(98, 50, 14, 14, SKETCH_COLORS.ink, 2)}</>,
  steps: <>{drawDot(20, 30, 10, SKETCH_COLORS.gold)}{drawDot(50, 30, 10, SKETCH_COLORS.line)}{drawDot(80, 30, 10, SKETCH_COLORS.line)}{drawDot(106, 30, 8, SKETCH_COLORS.line)}{drawRect(30, 29, 10, 2, SKETCH_COLORS.soft)}{drawRect(60, 29, 10, 2, SKETCH_COLORS.soft)}{drawRect(90, 29, 8, 2, SKETCH_COLORS.soft)}{drawRect(12, 50, 16, 5, SKETCH_COLORS.soft)}{drawRect(42, 50, 16, 5, SKETCH_COLORS.soft)}{drawRect(72, 50, 16, 5, SKETCH_COLORS.soft)}</>,
  docs: <>{drawRect(8, 14, 34, 6, SKETCH_COLORS.line)}{drawRect(8, 30, 34, 6, SKETCH_COLORS.line)}{drawRect(8, 46, 34, 6, SKETCH_COLORS.line)}{drawDot(60, 33, 16, SKETCH_COLORS.ink)}{drawRect(78, 14, 34, 6, SKETCH_COLORS.line)}{drawRect(78, 30, 34, 6, SKETCH_COLORS.line)}{drawRect(78, 46, 34, 6, SKETCH_COLORS.line)}</>,
  marquee: <>{drawRect(6, 20, 40, 10, SKETCH_COLORS.ink, 5)}{drawRect(52, 20, 28, 10, SKETCH_COLORS.line, 5)}{drawRect(86, 20, 30, 10, SKETCH_COLORS.ink, 5)}{drawRect(0, 42, 32, 10, SKETCH_COLORS.line, 5)}{drawRect(38, 42, 40, 10, SKETCH_COLORS.ink, 5)}{drawRect(84, 42, 30, 10, SKETCH_COLORS.line, 5)}</>,
  cards: <>{drawRect(8, 10, 32, 24, SKETCH_COLORS.ink, 3)}{drawRect(44, 10, 32, 24, SKETCH_COLORS.ink, 3)}{drawRect(80, 10, 32, 24, SKETCH_COLORS.ink, 3)}{drawRect(8, 40, 32, 24, SKETCH_COLORS.ink, 3)}{drawRect(44, 40, 32, 24, SKETCH_COLORS.ink, 3)}</>,
  form: <>{drawRect(8, 12, 44, 8, SKETCH_COLORS.ink)}{drawRect(8, 26, 36, 5, SKETCH_COLORS.soft)}{drawRect(8, 38, 30, 5, SKETCH_COLORS.soft)}{drawRect(8, 50, 30, 5, SKETCH_COLORS.soft)}{drawRect(62, 8, 50, 56, SKETCH_COLORS.line, 3)}{drawRect(68, 16, 38, 6, '#FFFFFF')}{drawRect(68, 28, 38, 6, '#FFFFFF')}{drawRect(68, 46, 24, 10, SKETCH_COLORS.gold)}</>,
  accordionImage: <>{drawRect(8, 8, 46, 8, SKETCH_COLORS.ink)}{drawRect(8, 22, 46, 10, SKETCH_COLORS.line, 3)}{drawRect(8, 36, 46, 10, SKETCH_COLORS.line, 3)}{drawRect(8, 50, 46, 10, SKETCH_COLORS.line, 3)}{drawRect(12, 26, 5, 2, SKETCH_COLORS.gold)}{drawRect(12, 40, 5, 2, SKETCH_COLORS.gold)}{drawRect(12, 54, 5, 2, SKETCH_COLORS.gold)}{drawRect(62, 8, 50, 56, SKETCH_COLORS.ink, 4)}</>,
  accordion: <>{drawRect(8, 10, 48, 12, SKETCH_COLORS.line, 3)}{drawRect(8, 26, 48, 12, SKETCH_COLORS.line, 3)}{drawRect(8, 42, 48, 12, SKETCH_COLORS.line, 3)}{drawRect(64, 10, 48, 12, SKETCH_COLORS.line, 3)}{drawRect(64, 26, 48, 12, SKETCH_COLORS.ink, 3)}{drawRect(64, 42, 48, 12, SKETCH_COLORS.line, 3)}{drawRect(12, 15, 6, 2, SKETCH_COLORS.gold)}{drawRect(68, 31, 6, 2, SKETCH_COLORS.gold)}</>,
  strip: <>{drawRect(8, 14, 32, 34, SKETCH_COLORS.line, 3)}{drawRect(44, 14, 32, 34, SKETCH_COLORS.line, 3)}{drawRect(80, 14, 32, 34, SKETCH_COLORS.line, 3)}{drawRect(12, 52, 24, 4, SKETCH_COLORS.soft)}{drawRect(48, 52, 24, 4, SKETCH_COLORS.soft)}{drawRect(84, 52, 24, 4, SKETCH_COLORS.soft)}{drawRect(44, 60, 32, 6, SKETCH_COLORS.ink, 3)}</>,
  numberedList: <>{drawRect(8, 14, 34, 7, SKETCH_COLORS.ink)}{drawRect(8, 26, 30, 3, SKETCH_COLORS.soft)}{drawRect(8, 32, 26, 3, SKETCH_COLORS.soft)}{drawRect(8, 44, 22, 7, SKETCH_COLORS.line, 2)}{drawRect(52, 16, 8, 5, SKETCH_COLORS.gold, 1)}{drawRect(63, 17, 22, 3, SKETCH_COLORS.ink)}{drawRect(52, 25, 30, 1, SKETCH_COLORS.line, 0)}{drawRect(88, 16, 8, 5, SKETCH_COLORS.gold, 1)}{drawRect(99, 17, 14, 3, SKETCH_COLORS.ink)}{drawRect(52, 31, 8, 5, SKETCH_COLORS.gold, 1)}{drawRect(63, 32, 20, 3, SKETCH_COLORS.ink)}{drawRect(52, 40, 30, 1, SKETCH_COLORS.line, 0)}{drawRect(88, 31, 8, 5, SKETCH_COLORS.gold, 1)}{drawRect(99, 32, 13, 3, SKETCH_COLORS.ink)}{drawRect(52, 46, 8, 5, SKETCH_COLORS.gold, 1)}{drawRect(63, 47, 24, 3, SKETCH_COLORS.ink)}{drawRect(52, 55, 30, 1, SKETCH_COLORS.line, 0)}{drawRect(88, 46, 8, 5, SKETCH_COLORS.gold, 1)}{drawRect(99, 47, 12, 3, SKETCH_COLORS.ink)}</>,
  specSheet: <>{drawRect(30, 6, 48, 6, SKETCH_COLORS.ink)}{drawRect(38, 15, 32, 3, SKETCH_COLORS.soft)}{drawRect(8, 24, 70, 40, '#FFFFFF', 3)}{drawDot(15, 30, 3, SKETCH_COLORS.gold)}{drawRect(21, 29, 16, 3, SKETCH_COLORS.ink)}{drawRect(42, 29, 32, 3, SKETCH_COLORS.soft)}{drawRect(8, 35, 70, 7, SKETCH_COLORS.line, 0)}{drawDot(15, 38.5, 3, SKETCH_COLORS.gold)}{drawRect(21, 37, 16, 3, SKETCH_COLORS.ink)}{drawRect(42, 37, 26, 3, SKETCH_COLORS.soft)}{drawDot(15, 48, 3, SKETCH_COLORS.gold)}{drawRect(21, 47, 16, 3, SKETCH_COLORS.ink)}{drawRect(42, 47, 30, 3, SKETCH_COLORS.soft)}{drawRect(8, 53, 70, 7, SKETCH_COLORS.line, 0)}{drawDot(15, 56.5, 3, SKETCH_COLORS.gold)}{drawRect(21, 55, 16, 3, SKETCH_COLORS.ink)}{drawRect(42, 55, 22, 3, SKETCH_COLORS.soft)}{drawRect(84, 24, 28, 40, SKETCH_COLORS.line, 3)}{drawDot(86, 62, 6, SKETCH_COLORS.gold)}</>,
  mediaTabs: <>{drawRect(8, 12, 22, 3, SKETCH_COLORS.gold, 1.5)}{drawRect(36, 12, 22, 3, SKETCH_COLORS.soft, 1.5)}{drawRect(64, 12, 22, 3, SKETCH_COLORS.soft, 1.5)}{drawRect(92, 12, 20, 3, SKETCH_COLORS.soft, 1.5)}{drawRect(8, 17, 104, 1, SKETCH_COLORS.line, 0)}{drawRect(8, 24, 48, 40, SKETCH_COLORS.line, 3)}{drawRect(64, 26, 44, 7, SKETCH_COLORS.ink)}{drawRect(64, 37, 36, 4, SKETCH_COLORS.soft)}{drawRect(64, 45, 44, 3, SKETCH_COLORS.line)}{drawRect(64, 51, 40, 3, SKETCH_COLORS.line)}{drawRect(64, 57, 22, 7, SKETCH_COLORS.ink, 1)}</>,
  photoSlider: <>{drawRect(20, 12, 24, 30, SKETCH_COLORS.line, 3)}{drawRect(48, 12, 24, 30, SKETCH_COLORS.line, 3)}{drawRect(76, 12, 24, 30, SKETCH_COLORS.line, 3)}{drawDot(10, 27, 5, SKETCH_COLORS.ink)}{drawDot(110, 27, 5, SKETCH_COLORS.ink)}{drawRect(23, 46, 18, 4, SKETCH_COLORS.soft)}{drawRect(51, 46, 18, 4, SKETCH_COLORS.soft)}{drawRect(79, 46, 18, 4, SKETCH_COLORS.soft)}{drawRect(50, 56, 8, 3, SKETCH_COLORS.gold, 1.5)}{drawDot(63, 57.5, 1.5, SKETCH_COLORS.soft)}{drawDot(69, 57.5, 1.5, SKETCH_COLORS.soft)}{drawRect(44, 63, 32, 5, SKETCH_COLORS.ink, 2.5)}</>,
  sizesBand: <>{drawRect(8, 12, 104, 50, SKETCH_COLORS.ink, 4)}{drawDot(22, 30, 7, SKETCH_COLORS.gold)}{drawDot(44, 31, 6, SKETCH_COLORS.gold)}{drawDot(64, 32, 5, SKETCH_COLORS.gold)}{drawDot(82, 33, 4, SKETCH_COLORS.gold)}{drawDot(98, 33, 3, SKETCH_COLORS.gold)}{drawRect(16, 46, 88, 1, SKETCH_COLORS.gold)}{drawRect(40, 52, 40, 3, SKETCH_COLORS.gold)}</>,
  sizes: <>{drawDot(20, 40, 14, SKETCH_COLORS.gold)}{drawDot(48, 42, 11, SKETCH_COLORS.gold)}{drawDot(72, 44, 9, SKETCH_COLORS.gold)}{drawDot(92, 45, 7, SKETCH_COLORS.gold)}{drawDot(108, 46, 5, SKETCH_COLORS.gold)}{drawRect(8, 58, 104, 2, SKETCH_COLORS.soft)}</>,
  checklist: <>{drawDot(14, 18, 5, SKETCH_COLORS.gold)}{drawRect(24, 15, 32, 6, SKETCH_COLORS.line)}{drawDot(14, 36, 5, SKETCH_COLORS.gold)}{drawRect(24, 33, 32, 6, SKETCH_COLORS.line)}{drawDot(14, 54, 5, SKETCH_COLORS.gold)}{drawRect(24, 51, 32, 6, SKETCH_COLORS.line)}{drawDot(70, 18, 5, SKETCH_COLORS.gold)}{drawRect(80, 15, 32, 6, SKETCH_COLORS.line)}{drawDot(70, 36, 5, SKETCH_COLORS.gold)}{drawRect(80, 33, 32, 6, SKETCH_COLORS.line)}</>,
  contact: <>{drawDot(16, 18, 6, SKETCH_COLORS.gold)}{drawRect(28, 15, 30, 6, SKETCH_COLORS.line)}{drawDot(16, 36, 6, SKETCH_COLORS.gold)}{drawRect(28, 33, 30, 6, SKETCH_COLORS.line)}{drawDot(16, 54, 6, SKETCH_COLORS.gold)}{drawRect(28, 51, 30, 6, SKETCH_COLORS.line)}{drawRect(66, 8, 46, 56, SKETCH_COLORS.ink, 3)}</>,
  stats: <>{drawRect(8, 12, 60, 8, SKETCH_COLORS.ink)}{drawRect(8, 34, 24, 14, SKETCH_COLORS.gold, 2)}{drawRect(48, 34, 24, 14, SKETCH_COLORS.gold, 2)}{drawRect(88, 34, 24, 14, SKETCH_COLORS.gold, 2)}{drawRect(8, 54, 24, 4, SKETCH_COLORS.soft)}{drawRect(48, 54, 24, 4, SKETCH_COLORS.soft)}{drawRect(88, 54, 24, 4, SKETCH_COLORS.soft)}</>,
  banner: <>{drawRect(8, 18, 104, 36, SKETCH_COLORS.ink, 2)}{drawRect(16, 28, 44, 7, '#FFFFFF')}{drawRect(16, 39, 34, 4, SKETCH_COLORS.soft)}{drawRect(80, 31, 24, 10, '#FFFFFF', 1)}</>,
  quotes: <>{drawRect(8, 12, 32, 48, SKETCH_COLORS.line, 2)}{drawRect(44, 12, 32, 48, SKETCH_COLORS.line, 2)}{drawRect(80, 12, 32, 48, SKETCH_COLORS.line, 2)}{drawRect(12, 18, 6, 6, SKETCH_COLORS.soft)}{drawRect(48, 18, 6, 6, SKETCH_COLORS.soft)}{drawRect(84, 18, 6, 6, SKETCH_COLORS.soft)}{drawRect(12, 50, 18, 4, SKETCH_COLORS.ink)}{drawRect(48, 50, 18, 4, SKETCH_COLORS.ink)}{drawRect(84, 50, 18, 4, SKETCH_COLORS.ink)}</>,
  generic: <>{drawRect(8, 12, 60, 8, SKETCH_COLORS.ink)}{drawRect(8, 28, 104, 5, SKETCH_COLORS.line)}{drawRect(8, 40, 104, 5, SKETCH_COLORS.line)}{drawRect(8, 52, 70, 5, SKETCH_COLORS.line)}</>,
};

const SKETCH_BY_KEY: Record<string, keyof typeof SKETCHES> = {
  hero: 'heroSlider',
  stats: 'stats',
  'property-grid': 'cards',
  'media-cards': 'strip',
  'feature-cards': 'listIcon',
  'cta-banner': 'banner',
  profile: 'accordionImage',
  testimonials: 'quotes',
  'post-cards': 'strip',
  contact: 'contact',
};

function Sketch({ sectionKey }: { sectionKey: string }) {
  const kind = SKETCH_BY_KEY[sectionKey] ?? 'generic';
  return (
    <svg className="cp-sketch" viewBox="0 0 120 72" role="img" aria-hidden="true">
      <rect x="0" y="0" width="120" height="72" rx="4" fill="#FFFFFF" />
      {SKETCHES[kind]}
    </svg>
  );
}

const GROUP_TITLES: Record<string, string> = {
  shared: 'Thư viện component chung',
  home: 'Component của trang Home',
  properties: 'Component của trang Properties',
  contact: 'Component của trang Contact',
};
const GROUP_ORDER = ['shared', 'home', 'properties', 'contact'];

function groupDefinitions(definitions: SectionDefinition[]) {
  const groups = new Map<string, SectionDefinition[]>();
  for (const definition of definitions) {
    const pageDefinitions = groups.get(definition.pageSlug) ?? [];
    pageDefinitions.push(definition);
    groups.set(definition.pageSlug, pageDefinitions);
  }
  const groupRankOf = (slug: string) => {
    const orderIndex = GROUP_ORDER.indexOf(slug);
    return orderIndex < 0 ? GROUP_ORDER.length : orderIndex;
  };
  return [...groups.entries()]
    .sort(([slugA], [slugB]) => groupRankOf(slugA) - groupRankOf(slugB) || slugA.localeCompare(slugB))
    .map(([slug, pageDefinitions]) => ({
      slug,
      title: GROUP_TITLES[slug] ?? `Component của trang ${slug}`,
      definitions: pageDefinitions.slice().sort((definitionA, definitionB) => definitionA.sortOrder - definitionB.sortOrder),
    }));
}

const stripPagePrefix = (label: string) => label.replace(/^[^·]*·\s*/, '');

export function ComponentPicker({
  definitions,
  value,
  onChange,
  genericValue,
  isLocked = false,
  isLoading = false,
}: {
  definitions: SectionDefinition[];
  value: string;
  onChange: (key: string) => void;
  genericValue: string;
  isLocked?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading) return <p className="gf-hint">Đang tải danh sách component…</p>;

  if (isLocked) {
    const currentDefinition = definitions.find((definition) => definition.sectionKey === value);
    return (
      <div className="cp-grid is-locked">
        <div className="cp-card is-active" aria-disabled="true">
          <Sketch sectionKey={currentDefinition?.sectionKey ?? '__generic'} />
          <span className="cp-name">{currentDefinition ? stripPagePrefix(currentDefinition.label) : 'Không dùng component'}</span>
          <span className="cp-key">{currentDefinition?.sectionKey ?? 'khối generic'}</span>
        </div>
      </div>
    );
  }

  const renderCard = (definition: SectionDefinition) => {
    const isActive = definition.sectionKey === value;
    return (
      <button
        key={definition.sectionKey}
        type="button"
        role="radio"
        aria-checked={isActive}
        className={`cp-card${isActive ? ' is-active' : ''}`}
        onClick={() => onChange(definition.sectionKey)}
      >
        <Sketch sectionKey={definition.sectionKey} />
        <span className="cp-name">{stripPagePrefix(definition.label)}</span>
        <span className="cp-key">{definition.sectionKey}</span>
      </button>
    );
  };

  const genericCard = (
    <button
      type="button"
      role="radio"
      aria-checked={value === genericValue}
      className={`cp-card${value === genericValue ? ' is-active' : ''}`}
      onClick={() => onChange(genericValue)}
    >
      <Sketch sectionKey="__generic" />
      <span className="cp-name">Không dùng component</span>
      <span className="cp-key">khối generic</span>
    </button>
  );

  const groups = groupDefinitions(definitions);
  const hasSingleGroup = groups.length <= 1;

  if (hasSingleGroup) {
    return (
      <div className="cp-grid" role="radiogroup" aria-label="Chọn component">
        {definitions.map(renderCard)}
        {genericCard}
      </div>
    );
  }

  return (
    <div className="cp-groups" role="radiogroup" aria-label="Chọn component">
      {groups.map((group) => (
        <section className="cp-group" key={group.slug}>
          <h4 className="cp-group-title">
            {group.title} <span>{group.definitions.length}</span>
          </h4>
          <div className="cp-grid">{group.definitions.map(renderCard)}</div>
        </section>
      ))}
      <section className="cp-group">
        <h4 className="cp-group-title">Khác</h4>
        <div className="cp-grid">{genericCard}</div>
      </section>
    </div>
  );
}
