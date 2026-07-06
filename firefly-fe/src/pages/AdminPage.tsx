import { useEffect, useState } from 'react';
import { adminDeleteComment, adminDeleteMemory, banUser, getAdminUsers, getReports, type AdminReport, type AdminUser } from '@/api/admin';
import { Button, Message } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, formatDate, getErrorMessage } from '@/pages/pageShared';

type AdminTab = 'reports' | 'users';

export function AdminPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('reports');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadAdminData = async () => {
      setLoading(true);
      setError('');

      try {
        const [reportsResponse, usersResponse] = await Promise.all([getReports(), getAdminUsers()]);
        if (active) {
          setReports(reportsResponse.data);
          setUsers(usersResponse.data);
        }
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError, 'Не вдалося завантажити дані адмін-панелі.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadAdminData();

    return () => {
      active = false;
    };
  }, []);

  const handleModerateReport = async (report: AdminReport) => {
    try {
      if (report.targetType === 'memory') {
        await adminDeleteMemory(report.targetId);
      } else if (report.targetType === 'comment') {
        await adminDeleteComment(report.targetId);
      } else {
        setError('Невідомий тип цілі для видалення.');
        return;
      }

      setReports((current) => current.filter((item) => item.id !== report.id));
      setMessage('Контент видалено.');
    } catch (actionError) {
      setError(getErrorMessage(actionError, 'Не вдалося видалити контент.'));
    }
  };

  const handleToggleBan = async (userId: number) => {
    try {
      const response = await banUser(userId);
      setUsers((current) =>
        current.map((item) => (item.id === userId ? { ...item, isBanned: response.data.banned } : item)),
      );
      setMessage(response.data.banned ? 'Користувача заблоковано.' : 'Користувача розблоковано.');
    } catch (actionError) {
      setError(getErrorMessage(actionError, 'Не вдалося змінити статус користувача.'));
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>Адмін-панель</h1>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {[
          { key: 'reports', label: 'Скарги' },
          { key: 'users', label: 'Користувачі' },
        ].map((tab) => {
          const active = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as AdminTab)}
              style={{
                border: active ? '1px solid transparent' : '1px solid var(--border-default)',
                borderRadius: 'var(--radius-pill)',
                background: active ? 'var(--primary)' : 'var(--bg-surface)',
                color: active ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                padding: 'var(--space-3) var(--space-5)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {message ? (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Message tone="success" onDismiss={() => setMessage('')}>
            {message}
          </Message>
        </div>
      ) : null}
      {error ? (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Message tone="error" onDismiss={() => setError('')}>
            {error}
          </Message>
        </div>
      ) : null}

      <div style={{ ...SURFACE_STYLE, overflowX: 'auto' }}>
        {loading ? (
          <div>Завантажуємо дані…</div>
        ) : activeTab === 'reports' ? (
          reports.length ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Тип</th>
                  <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Ціль</th>
                  <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Причина</th>
                  <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Дата</th>
                  <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Дія</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>{report.targetType}</td>
                    <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>{report.targetId}</td>
                    <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                      {report.reason || 'Причину не вказано'}
                    </td>
                    <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                      {formatDate(report.createdAt)}
                    </td>
                    <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                      <Button size="sm" variant="danger" onClick={() => void handleModerateReport(report)}>
                        Видалити
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>Скарг поки немає.</div>
          )
        ) : users.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Ім’я</th>
                <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Email</th>
                <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Роль</th>
                <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Статус</th>
                <th style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>Дія</th>
              </tr>
            </thead>
            <tbody>
              {users.map((adminUser) => {
                const isProtectedAccount = adminUser.role === 'admin' || adminUser.id === currentUser?.id;

                return (
                <tr key={adminUser.id}>
                  <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>{adminUser.name}</td>
                  <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>{adminUser.email}</td>
                  <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>{adminUser.role}</td>
                  <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {adminUser.isBanned ? 'Заблоковано' : 'Активний'}
                  </td>
                  <td style={{ padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <Button
                      size="sm"
                      variant={adminUser.isBanned ? 'secondary' : 'danger'}
                      onClick={() => void handleToggleBan(adminUser.id)}
                      disabled={isProtectedAccount}
                    >
                      {isProtectedAccount ? 'Захищений' : adminUser.isBanned ? 'Розблокувати' : 'Заблокувати'}
                    </Button>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        ) : (
          <div>Користувачів поки немає.</div>
        )}
      </div>
    </div>
  );
}
