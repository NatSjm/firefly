import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminDeleteComment, adminDeleteMemory, banUser, getAdminUsers, getReports, type AdminReport } from '@/api/admin';
import { Button, Message } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, formatDate, getErrorMessage } from '@/pages/pageShared';

type AdminTab = 'reports' | 'users';

const TAB_KEYS: AdminTab[] = ['reports', 'users'];

const CELL_STYLE = { padding: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' } as const;

const fetchAdminData = async (signal: AbortSignal) => {
  const [reportsResponse, usersResponse] = await Promise.all([getReports(signal), getAdminUsers(signal)]);
  return { reports: reportsResponse.data, users: usersResponse.data };
};

export function AdminPage() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('reports');
  const [message, setMessage] = useState('');

  const { data, setData, loading, error, setError } = useAsyncData(fetchAdminData, t('admin.loadError'));
  const reports = data?.reports ?? [];
  const users = data?.users ?? [];

  const handleModerateReport = useCallback(
    async (report: AdminReport) => {
      try {
        if (report.targetType === 'memory') {
          await adminDeleteMemory(report.targetId);
        } else if (report.targetType === 'comment') {
          await adminDeleteComment(report.targetId);
        } else {
          setError(t('admin.reports.unknownTarget'));
          return;
        }

        setData((current) =>
          current ? { ...current, reports: current.reports.filter((item) => item.id !== report.id) } : current,
        );
        setMessage(t('admin.reports.deleted'));
      } catch (actionError) {
        setError(getErrorMessage(actionError, t('admin.reports.deleteError')));
      }
    },
    [setData, setError, t],
  );

  const handleToggleBan = useCallback(
    async (userId: number) => {
      try {
        const response = await banUser(userId);
        setData((current) =>
          current
            ? {
                ...current,
                users: current.users.map((item) =>
                  item.id === userId ? { ...item, isBanned: response.data.banned } : item,
                ),
              }
            : current,
        );
        setMessage(response.data.banned ? t('admin.users.bannedMsg') : t('admin.users.unbannedMsg'));
      } catch (actionError) {
        setError(getErrorMessage(actionError, t('admin.users.banError')));
      }
    },
    [setData, setError, t],
  );

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <h1 style={PAGE_HEADING_STYLE}>{t('admin.title')}</h1>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {TAB_KEYS.map((tab) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
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
              {t(`admin.tabs.${tab}`)}
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
          <div>{t('admin.loading')}</div>
        ) : activeTab === 'reports' ? (
          reports.length ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={CELL_STYLE}>{t('admin.reports.type')}</th>
                  <th style={CELL_STYLE}>{t('admin.reports.target')}</th>
                  <th style={CELL_STYLE}>{t('admin.reports.reason')}</th>
                  <th style={CELL_STYLE}>{t('admin.reports.date')}</th>
                  <th style={CELL_STYLE}>{t('admin.reports.action')}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td style={CELL_STYLE}>{report.targetType}</td>
                    <td style={CELL_STYLE}>{report.targetId}</td>
                    <td style={CELL_STYLE}>{report.reason || t('admin.reports.noReason')}</td>
                    <td style={CELL_STYLE}>{formatDate(report.createdAt)}</td>
                    <td style={CELL_STYLE}>
                      <Button size="sm" variant="danger" onClick={() => void handleModerateReport(report)}>
                        {t('admin.reports.delete')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>{t('admin.reports.empty')}</div>
          )
        ) : users.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={CELL_STYLE}>{t('admin.users.name')}</th>
                <th style={CELL_STYLE}>{t('admin.users.email')}</th>
                <th style={CELL_STYLE}>{t('admin.users.role')}</th>
                <th style={CELL_STYLE}>{t('admin.users.status')}</th>
                <th style={CELL_STYLE}>{t('admin.users.action')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((adminUser) => {
                const isProtectedAccount = adminUser.role === 'admin' || adminUser.id === currentUser?.id;

                return (
                  <tr key={adminUser.id}>
                    <td style={CELL_STYLE}>{adminUser.name}</td>
                    <td style={CELL_STYLE}>{adminUser.email}</td>
                    <td style={CELL_STYLE}>{adminUser.role}</td>
                    <td style={CELL_STYLE}>{adminUser.isBanned ? t('admin.users.banned') : t('admin.users.active')}</td>
                    <td style={CELL_STYLE}>
                      <Button
                        size="sm"
                        variant={adminUser.isBanned ? 'secondary' : 'danger'}
                        onClick={() => void handleToggleBan(adminUser.id)}
                        disabled={isProtectedAccount}
                      >
                        {isProtectedAccount
                          ? t('admin.users.protected')
                          : adminUser.isBanned
                            ? t('admin.users.unban')
                            : t('admin.users.ban')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div>{t('admin.users.empty')}</div>
        )}
      </div>
    </div>
  );
}
