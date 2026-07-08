import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LostNewPage } from '@/pages/LostNewPage';

// @trace FR-LOST-02

const apiMocks = vi.hoisted(() => ({
  createLostRequest: vi.fn(),
}));

const authState = vi.hoisted(() => ({
  user: null as { id: number; name: string; email: string; role: string } | null,
}));

vi.mock('@/api/lost', () => ({
  createLostRequest: apiMocks.createLostRequest,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: authState.user,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LostNewPage />
    </MemoryRouter>,
  );
}

describe('LostNewPage', () => {
  beforeEach(() => {
    apiMocks.createLostRequest.mockReset();
    authState.user = { id: 1, name: 'Марина', email: 'marina@example.com', role: 'user' };
  });

  // @trace FR-LOST-02
  it('renders city, type, years, description, and contact email fields', () => {
    renderPage();

    expect(screen.getByLabelText(/Місто/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Тип місця/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Роки/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Що саме шукаєте/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Контактний email/)).toBeInTheDocument();
  });

  // @trace FR-LOST-02
  it('pre-fills contact email from the logged-in user', () => {
    renderPage();

    expect(screen.getByLabelText(/Контактний email/)).toHaveValue('marina@example.com');
  });

  // @trace FR-LOST-02
  it('blocks submission and shows inline per-field messages when city, description, and contact email are blank', async () => {
    const user = userEvent.setup();
    renderPage();

    // clear the pre-filled contact email so the form is fully blank
    await user.clear(screen.getByLabelText(/Контактний email/));
    await user.click(screen.getByRole('button', { name: 'Опублікувати запит' }));

    expect(screen.getByText('Оберіть місто.')).toBeInTheDocument();
    expect(screen.getByText('Опишіть, що саме шукаєте.')).toBeInTheDocument();
    expect(screen.getByText('Вкажіть контактний email.')).toBeInTheDocument();
    expect(apiMocks.createLostRequest).not.toHaveBeenCalled();
  });

  // @trace FR-LOST-02
  it('blocks submission when description is blank even if city and email are filled', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText(/Місто/), 'Київ');
    await user.click(screen.getByRole('button', { name: 'Опублікувати запит' }));

    expect(screen.getByText('Опишіть, що саме шукаєте.')).toBeInTheDocument();
    expect(screen.queryByText('Оберіть місто.')).not.toBeInTheDocument();
    expect(apiMocks.createLostRequest).not.toHaveBeenCalled();
  });

  // @trace FR-LOST-02
  it('blocks submission with an inline message when years is a backwards range', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(screen.getByLabelText(/Місто/), 'Київ');
    await user.type(screen.getByLabelText(/Роки/), '2025-1990');
    await user.type(screen.getByLabelText(/Що саме шукаєте/), 'Шукаю однокласників');

    await user.click(screen.getByRole('button', { name: 'Опублікувати запит' }));

    expect(
      screen.getByText('Перевірте діапазон років — кінцевий рік не може бути раніше початкового.'),
    ).toBeInTheDocument();
    expect(apiMocks.createLostRequest).not.toHaveBeenCalled();
  });

  // @trace FR-LOST-02
  it('calls createLostRequest with trimmed values on valid submit', async () => {
    const user = userEvent.setup();
    apiMocks.createLostRequest.mockResolvedValue({ data: { id: 1 } });
    renderPage();

    await user.selectOptions(screen.getByLabelText(/Місто/), 'Київ');
    await user.selectOptions(screen.getByLabelText(/Тип місця/), 'school');
    await user.type(screen.getByLabelText(/Роки/), '  1998-2003  ');
    await user.type(screen.getByLabelText(/Що саме шукаєте/), '  Шукаю однокласників  ');
    await user.clear(screen.getByLabelText(/Контактний email/));
    await user.type(screen.getByLabelText(/Контактний email/), '  marina@example.com  ');

    await user.click(screen.getByRole('button', { name: 'Опублікувати запит' }));

    expect(apiMocks.createLostRequest).toHaveBeenCalledWith({
      city: 'Київ',
      type: 'school',
      years: '1998-2003',
      description: 'Шукаю однокласників',
      contactEmail: 'marina@example.com',
    });
  });
});
