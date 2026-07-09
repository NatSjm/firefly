import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as lostApi from '@/api/lost';
import { LostDetailPage } from '@/pages/LostDetailPage';

// @trace FR-LOST-05

vi.mock('@/api/lost');

const mockGetLostRequest = vi.mocked(lostApi.getLostRequest);

function renderDetail(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/lost/${id}`]}>
      <Routes>
        <Route path="/lost/:id" element={<LostDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const lostRequestFixture = (overrides: Partial<lostApi.LostRequest> = {}): lostApi.LostRequest => ({
  id: 1,
  userId: 2,
  authorName: 'Марина',
  city: 'Маріуполь',
  type: 'school',
  years: '1998-2003',
  description: 'Це довгий опис того, кого саме я шукаю зі школи №5 і чому це важливо для мене.',
  contactEmail: 'marina@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('LostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // @trace FR-LOST-05
  it('renders the full description, contact email, and mailto button', async () => {
    mockGetLostRequest.mockResolvedValue({ data: lostRequestFixture() } as never);

    renderDetail();

    expect(
      await screen.findByText(
        'Це довгий опис того, кого саме я шукаю зі школи №5 і чому це важливо для мене.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('marina@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Написати автору' })).toBeInTheDocument();
  });

  // @trace FR-LOST-05
  it('clicking the contact button navigates to a mailto link addressed to the contact email', async () => {
    mockGetLostRequest.mockResolvedValue({ data: lostRequestFixture({ contactEmail: 'author@example.com' }) } as never);

    const originalLocation = window.location;
    // jsdom doesn't allow setting window.location.href directly without this workaround
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, href: '' },
    });

    renderDetail();

    const button = await screen.findByRole('button', { name: 'Написати автору' });
    button.click();

    expect(window.location.href).toBe('mailto:author@example.com');

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  // @trace FR-LOST-05
  it('shows an error message when the fetch fails', async () => {
    mockGetLostRequest.mockRejectedValue(new Error('Network error'));

    renderDetail();

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  // @trace FR-LOST-05
  it('shows a not-found message for an invalid id', async () => {
    renderDetail('not-a-number');

    expect(await screen.findByText('Некоректний ідентифікатор запиту.')).toBeInTheDocument();
  });
});
