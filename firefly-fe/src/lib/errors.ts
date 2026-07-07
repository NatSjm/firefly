import axios from 'axios';

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

export function getErrorMessage(error: unknown, fallback = 'Не вдалося виконати дію. Спробуйте ще раз.') {
  if (axios.isAxiosError(error)) {
    return extractResponseMessage(error.response?.data) ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
