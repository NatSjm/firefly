import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from '@/pages/RegisterPage';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    ...authMocks,
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    authMocks.login.mockReset();
    authMocks.register.mockReset();
    authMocks.logout.mockReset();
    authMocks.refreshUser.mockReset();
  });

  // @trace FR-AUTH-01
  it('renders name email and password fields', () => {
    renderPage();

    expect(screen.getByLabelText(/Ім’я/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/)).toBeInTheDocument();
  });

  // @trace FR-AUTH-01
  it('renders submit button', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Створити профіль' })).toBeInTheDocument();
  });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );
}
