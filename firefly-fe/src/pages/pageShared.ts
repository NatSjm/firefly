import type { CSSProperties } from 'react';
import { LOST_TYPE_LABEL } from '@/design-system';

export { getErrorMessage } from '@/lib/errors';

export const PAGE_WRAPPER_STYLE: CSSProperties = {
  maxWidth: 'var(--content-max)',
  margin: '0 auto',
  padding: 'var(--space-8) var(--gutter)',
};

export const PAGE_HEADING_STYLE: CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'var(--text-h2)',
  fontWeight: 700,
  color: 'var(--text-primary)',
  margin: '0 0 var(--space-6)',
};

export const CARD_GRID_STYLE: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 'var(--space-5)',
};

export const FORM_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-5)',
};

export const SURFACE_STYLE: CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-sm)',
  padding: 'var(--space-6)',
};

export const CITIES = ['Київ', 'Львів', 'Одеса', 'Харків', 'Маріуполь', 'Дніпро', 'Запоріжжя', 'Миколаїв'];

export const TOPICS = ['Океан Ельзи', 'Бабусині рецепти', "Комп'ютерні ігри", 'Тамагочі', 'Дворові ігри'];

export const MEMORY_TOPIC_OPTIONS = TOPICS.map((topic) => ({ value: topic, label: topic }));

export const LOST_TYPE_LABELS = LOST_TYPE_LABEL;

export const LOST_TYPE_OPTIONS = Object.entries(LOST_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export const LOST_TYPE_FILTER_OPTIONS = LOST_TYPE_OPTIONS.map((option) => option.label);

export const LOST_TYPE_VALUE_BY_LABEL = Object.fromEntries(
  LOST_TYPE_OPTIONS.map((option) => [option.label, option.value]),
) as Record<string, string>;

export function getLostTypeLabel(value: string) {
  return LOST_TYPE_LABELS[value] ?? value;
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('uk-UA', { dateStyle: 'long' }).format(date);
}

export function formatYears(yearFrom?: number, yearTo?: number) {
  if (yearFrom && yearTo) {
    return `${yearFrom}–${yearTo}`;
  }

  if (yearFrom) {
    return `від ${yearFrom}`;
  }

  if (yearTo) {
    return `до ${yearTo}`;
  }

  return '';
}

export function getMemoryExcerpt(text: string, limit = 140) {
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trim()}…`;
}

export function toPhotoUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
    return url;
  }

  return `/${url}`;
}
