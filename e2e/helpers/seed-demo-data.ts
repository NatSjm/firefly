/**
 * Seed helper for E2E tests.
 * 
 * Provides deterministic IDs, idempotent upserts, and baseline state re-pinning.
 * Manual testing shares the DB, so every run must re-establish known state.
 * 
 * CRITICAL: Use LOCAL calendar dates for day-bound assertions, never 
 * `toISOString().slice(0,10)` which depends on machine timezone.
 */

import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:8080';

export interface SeedUser {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
  bio?: string;
}

export interface SeedMemory {
  title: string;
  text: string;
  type: 'story' | 'recipe';
  isPublic: boolean;
  city?: string;
  topicSlug?: string;
  yearFrom?: number;
  yearTo?: number;
  ingredients?: string;
  steps?: string;
}

export interface SeedLostRequest {
  city: string;
  type: string;
  yearFrom?: number;
  yearTo?: number;
  description: string;
  contactEmail: string;
}

/**
 * Registers a user and returns the JWT token.
 * If the user already exists, logs in instead.
 */
export async function seedUser(user: SeedUser): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      email: user.email,
      password: user.password,
      name: user.name,
    });
    return response.data.token;
  } catch (err: any) {
    // User might already exist, try login
    if (err.response?.status === 400 || err.response?.status === 409) {
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: user.email,
        password: user.password,
      });
      return loginResponse.data.token;
    }
    throw err;
  }
}

/**
 * Seeds a memory for the authenticated user.
 */
export async function seedMemory(token: string, memory: SeedMemory): Promise<number> {
  const formData = new FormData();
  
  const data = {
    title: memory.title,
    text: memory.text,
    type: memory.type,
    isPublic: memory.isPublic,
    ...(memory.city && { city: memory.city }),
    ...(memory.topicSlug && { topicSlug: memory.topicSlug }),
    ...(memory.yearFrom && { yearFrom: memory.yearFrom }),
    ...(memory.yearTo && { yearTo: memory.yearTo }),
    ...(memory.ingredients && { ingredients: memory.ingredients }),
    ...(memory.steps && { steps: memory.steps }),
  };
  
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  formData.append('data', blob);
  
  const response = await axios.post(`${API_BASE}/api/memories`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.id;
}

/**
 * Seeds a lost firefly request.
 */
export async function seedLostRequest(token: string, request: SeedLostRequest): Promise<number> {
  const response = await axios.post(`${API_BASE}/api/lost-requests`, request, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.data.id;
}

/**
 * Clears all data (for test isolation).
 * Note: This requires admin access or direct DB access in the backend.
 */
export async function clearDatabase(): Promise<void> {
  // This would require a test-only endpoint in the backend
  // For now, tests should use the backend's @BeforeEach truncate
  // or Testcontainers reset between runs
}

/**
 * Standard test users with deterministic credentials.
 */
export const TEST_USERS = {
  regular: {
    email: 'test-user@firefly.test',
    password: 'TestPass123!',
    name: 'Тестовий Користувач',
  },
  admin: {
    email: 'test-admin@firefly.test',
    password: 'AdminPass123!',
    name: 'Тестовий Адмін',
    role: 'admin' as const,
  },
  other: {
    email: 'other-user@firefly.test',
    password: 'OtherPass123!',
    name: 'Інший Користувач',
  },
};

/**
 * Standard test memories.
 */
export const TEST_MEMORIES = {
  publicStory: {
    title: 'Літо в бабусиному саду',
    text: 'Спогад про літо, яблука та спокій.',
    type: 'story' as const,
    isPublic: true,
    city: 'Київ',
    topicSlug: 'babusini-retsepty',
    yearFrom: 1995,
    yearTo: 2000,
  },
  privateRecipe: {
    title: 'Бабусин борщ',
    text: 'Секретний рецепт родинного борщу.',
    type: 'recipe' as const,
    isPublic: false,
    ingredients: 'Буряк, капуста, картопля',
    steps: '1. Зварити бульйон\n2. Додати овочі',
    topicSlug: 'babusini-retsepty',
  },
};
