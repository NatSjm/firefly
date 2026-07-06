import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Field, Message, TextInput } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FORM_STYLE, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, getErrorMessage } from '@/pages/pageShared';

export function LoginPage() {
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
      setError('Вкажіть email і пароль.');
      return;
    }

    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Не вдалося увійти. Перевірте дані та спробуйте ще раз.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>Вхід</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit} noValidate>
          {error ? <Message tone="error">{error}</Message> : null}
          <Field label="Email" required>
            <TextInput
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={submitting}
            />
          </Field>
          <Field label="Пароль" required>
            <TextInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Ваш пароль"
              required
              disabled={submitting}
            />
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Входимо…' : 'Увійти'}
            </Button>
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-secondary)',
              }}
            >
              Ще не маєте профілю?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Зареєструватися
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
