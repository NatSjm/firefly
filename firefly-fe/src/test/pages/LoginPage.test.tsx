import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';

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

describe('LoginPage', () => {
  beforeEach(() => {
    authMocks.login.mockReset();
    authMocks.register.mockReset();
    authMocks.logout.mockReset();
    authMocks.refreshUser.mockReset();
  });

  // @trace FR-AUTH-02
  it('renders email and password fields', () => {
    renderPage();

    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Пароль/)).toBeInTheDocument();
  });

  // @trace FR-AUTH-02
  it('renders submit button', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Увійти' })).toBeInTheDocument();
  });

  // @trace FR-AUTH-02
  it('shows validation error on empty submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Увійти' }));

    expect(screen.getByText('Вкажіть email і пароль.')).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });
});

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}
