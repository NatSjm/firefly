import type { CSSProperties } from 'react';
import { LOST_TYPES } from '@/design-system';
import i18n from '@/i18n';

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

export interface SelectOptionItem {
  value: string;
  label: string;
}

export function getCities() {
  return i18n.t('cities', { returnObjects: true }) as string[];
}

export function getTopics() {
  return i18n.t('topics', { returnObjects: true }) as string[];
}

export function getCityOptions(): SelectOptionItem[] {
  return getCities().map((city) => ({ value: city, label: city }));
}

export function getTopicOptions(): SelectOptionItem[] {
  return getTopics().map((topic) => ({ value: topic, label: topic }));
}

export function getLostTypeLabel(value: string) {
  return i18n.t(`lost.types.${value}`, { defaultValue: value });
}

export function getLostTypeOptions(): SelectOptionItem[] {
  return LOST_TYPES.map((value) => ({ value, label: getLostTypeLabel(value) }));
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
    return i18n.t('format.yearsFrom', { year: yearFrom });
  }

  if (yearTo) {
    return i18n.t('format.yearsTo', { year: yearTo });
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
