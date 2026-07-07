import axios from 'axios';
import i18n from '@/i18n';

function extractResponseMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') {
    return record.message;
  }

  if (typeof record.error === 'string') {
    return record.error;
  }

  return undefined;
}

export function getErrorMessage(error: unknown, fallback = i18n.t('errors.generic')) {
  if (axios.isAxiosError(error)) {
    return extractResponseMessage(error.response?.data) ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
