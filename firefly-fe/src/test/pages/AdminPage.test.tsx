import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminReport, AdminUser } from '@/api/admin';
import { AdminPage } from '@/pages/AdminPage';

// @trace FR-MOD-03, FR-MOD-04

const apiMocks = vi.hoisted(() => ({
  getReports: vi.fn(),
  getAdminUsers: vi.fn(),
  adminDeleteMemory: vi.fn(),
  adminDeleteComment: vi.fn(),
  banUser: vi.fn(),
}));

const authState = vi.hoisted(() => ({
  user: { id: 1, name: 'Адмін', email: 'admin@example.com', role: 'admin' },
}));

vi.mock('@/api/admin', () => ({
  getReports: apiMocks.getReports,
  getAdminUsers: apiMocks.getAdminUsers,
  adminDeleteMemory: apiMocks.adminDeleteMemory,
  adminDeleteComment: apiMocks.adminDeleteComment,
  banUser: apiMocks.banUser,
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

const reportFixture = (overrides: Partial<AdminReport> = {}): AdminReport => ({
  id: 11,
  targetType: 'memory',
  targetId: 42,
  reason: 'Образливий вміст',
  createdAt: '2026-07-01T10:00:00Z',
  ...overrides,
});

const userFixture = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  id: 2,
  name: 'Марина',
  email: 'marina@example.com',
  role: 'user',
  isBanned: false,
  ...overrides,
});

function renderAdminPage() {
  return render(
    <MemoryRouter>
      <AdminPage />
    </MemoryRouter>,
  );
}

async function openUsersTab() {
  const user = userEvent.setup();
  await screen.findByRole('button', { name: 'Користувачі' });
  await user.click(screen.getByRole('button', { name: 'Користувачі' }));
  return user;
}

describe('AdminPage', () => {
  beforeEach(() => {
    Object.values(apiMocks).forEach((mock) => mock.mockReset());
    apiMocks.getReports.mockResolvedValue({ data: [] });
    apiMocks.getAdminUsers.mockResolvedValue({ data: [] });
  });

  // @trace FR-MOD-03
  it('renders a report row with type, target, reason, and date', async () => {
    apiMocks.getReports.mockResolvedValue({ data: [reportFixture()] });

    renderAdminPage();

    const reason = await screen.findByText('Образливий вміст');
    const row = reason.closest('tr');
    expect(row).not.toBeNull();
    const scoped = within(row as HTMLElement);
    expect(scoped.getByText('memory')).toBeInTheDocument();
    expect(scoped.getByText('42')).toBeInTheDocument();
    expect(scoped.getByRole('button', { name: 'Видалити' })).toBeInTheDocument();
  });

  // @trace FR-MOD-03
  it('falls back to an explicit label when the report has no reason', async () => {
    apiMocks.getReports.mockResolvedValue({ data: [reportFixture({ reason: undefined })] });

    renderAdminPage();

    expect(await screen.findByText('Причину не вказано')).toBeInTheDocument();
  });

  // @trace FR-MOD-03
  it('shows an empty state when there are no reports', async () => {
    renderAdminPage();

    expect(await screen.findByText('Скарг поки немає.')).toBeInTheDocument();
  });

  // @trace FR-MOD-03
  it('shows an error message when loading the panel data fails', async () => {
    apiMocks.getReports.mockRejectedValue(new Error('boom'));

    renderAdminPage();

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
  });

  // @trace FR-MOD-04
  it('deletes a reported memory, removes all sibling rows for that target, and confirms', async () => {
    const user = userEvent.setup();
    apiMocks.getReports.mockResolvedValue({
      data: [
        reportFixture({ id: 11, targetType: 'memory', targetId: 42, reason: 'Скарга 1' }),
        reportFixture({ id: 12, targetType: 'memory', targetId: 42, reason: 'Скарга 2' }),
      ],
    });
    apiMocks.adminDeleteMemory.mockResolvedValue({});

    renderAdminPage();
    // Click delete on the first row
    await user.click((await screen.findAllByRole('button', { name: 'Видалити' }))[0]);

    expect(apiMocks.adminDeleteMemory).toHaveBeenCalledWith(42);
    expect(await screen.findByText('Контент видалено.')).toBeInTheDocument();
    // Both sibling rows for targetId=42 must be removed
    expect(screen.queryByText('Скарга 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Скарга 2')).not.toBeInTheDocument();
    expect(screen.getByText('Скарг поки немає.')).toBeInTheDocument();
  });

  // @trace FR-MOD-04
  it('routes comment reports to the comment delete endpoint', async () => {
    const user = userEvent.setup();
    apiMocks.getReports.mockResolvedValue({
      data: [reportFixture({ targetType: 'comment', targetId: 7 })],
    });
    apiMocks.adminDeleteComment.mockResolvedValue({});

    renderAdminPage();
    await user.click(await screen.findByRole('button', { name: 'Видалити' }));

    expect(apiMocks.adminDeleteComment).toHaveBeenCalledWith(7);
    expect(apiMocks.adminDeleteMemory).not.toHaveBeenCalled();
  });

  // @trace FR-MOD-04
  it('shows an error when deleting the reported content fails', async () => {
    const user = userEvent.setup();
    apiMocks.getReports.mockResolvedValue({ data: [reportFixture()] });
    apiMocks.adminDeleteMemory.mockRejectedValue(new Error('boom'));

    renderAdminPage();
    await user.click(await screen.findByRole('button', { name: 'Видалити' }));

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
    expect(screen.getByText('Образливий вміст')).toBeInTheDocument();
  });

  // @trace FR-MOD-04
  it('disables the delete button while deletion is in flight', async () => {
    let resolve!: () => void;
    apiMocks.getReports.mockResolvedValue({ data: [reportFixture()] });
    apiMocks.adminDeleteMemory.mockImplementation(() => new Promise<void>((res) => { resolve = res; }));

    const user = userEvent.setup();
    renderAdminPage();
    const btn = await screen.findByRole('button', { name: 'Видалити' });
    await user.click(btn);

    expect(btn).toBeDisabled();
    resolve();
    await screen.findByText('Контент видалено.');
    expect(btn).not.toBeInTheDocument(); // row removed
  });

  // @trace FR-MOD-04
  it('renders users with status and toggles a ban', async () => {
    apiMocks.getAdminUsers.mockResolvedValue({ data: [userFixture()] });
    apiMocks.banUser.mockResolvedValue({ data: { banned: true } });

    renderAdminPage();
    const user = await openUsersTab();

    const row = screen.getByText('marina@example.com').closest('tr') as HTMLElement;
    expect(within(row).getByText('Марина')).toBeInTheDocument();
    expect(within(row).getByText('Активний')).toBeInTheDocument();

    await user.click(within(row).getByRole('button', { name: 'Заблокувати' }));

    expect(apiMocks.banUser).toHaveBeenCalledWith(2);
    expect(await screen.findByText('Користувача заблоковано.')).toBeInTheDocument();
    expect(within(row).getByText('Заблоковано')).toBeInTheDocument();
    expect(within(row).getByRole('button', { name: 'Розблокувати' })).toBeInTheDocument();
  });

  // @trace FR-MOD-04
  it('disables the ban button for admin accounts and for the signed-in admin', async () => {
    apiMocks.getAdminUsers.mockResolvedValue({
      data: [
        userFixture({ id: 1, name: 'Адмін', email: 'admin@example.com', role: 'admin' }),
        userFixture({ id: 3, name: 'Інший адмін', email: 'admin2@example.com', role: 'admin' }),
      ],
    });

    renderAdminPage();
    await openUsersTab();

    const buttons = screen.getAllByRole('button', { name: 'Захищений' });
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toBeDisabled());
  });

  // @trace FR-MOD-04
  it('clears error when a subsequent action succeeds', async () => {
    const user = userEvent.setup();
    apiMocks.getReports.mockResolvedValue({ data: [reportFixture()] });
    apiMocks.adminDeleteMemory.mockRejectedValueOnce(new Error('Помилка')).mockResolvedValueOnce({});

    renderAdminPage();
    const btn = await screen.findByRole('button', { name: 'Видалити' });
    await user.click(btn);
    expect(await screen.findByText(/Помилка/i)).toBeInTheDocument();

    // Re-setup fresh data and click again
    apiMocks.getReports.mockResolvedValue({ data: [reportFixture()] });
    // The row is still there after first failure; click again
    await user.click(screen.getByRole('button', { name: 'Видалити' }));
    expect(await screen.findByText('Контент видалено.')).toBeInTheDocument();
    expect(screen.queryByText(/Помилка/i)).not.toBeInTheDocument();
  });
});
