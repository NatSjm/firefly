import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, Message, TextInput } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FORM_STYLE, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, getErrorMessage } from '@/pages/pageShared';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'object' &&
    location.state.from &&
    'pathname' in location.state.from &&
    typeof location.state.from.pathname === 'string'
      ? {
          pathname: location.state.from.pathname,
          search:
            'search' in location.state.from && typeof location.state.from.search === 'string'
              ? location.state.from.search
              : '',
          hash:
            'hash' in location.state.from && typeof location.state.from.hash === 'string'
              ? location.state.from.hash
              : '',
        }
      : '/dashboard';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t('auth.login.missingFields'));
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('auth.login.error')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>{t('auth.login.title')}</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit} noValidate>
          {error ? <Message tone="error">{error}</Message> : null}
          <Field label={t('auth.email')} required>
            <TextInput
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              disabled={submitting}
            />
          </Field>
          <Field label={t('auth.password')} required>
            <TextInput
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.login.passwordPlaceholder')}
              required
              disabled={submitting}
            />
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-secondary)',
              }}
            >
              {t('auth.login.noProfile')}{' '}
              <Link to="/register" style={{ color: 'var(--text-link)', fontWeight: 600 }}>
                {t('auth.login.registerLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
