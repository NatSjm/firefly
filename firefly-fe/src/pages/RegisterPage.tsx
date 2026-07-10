import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, Message, TextInput } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FORM_STYLE, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, getErrorMessage } from '@/pages/pageShared';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (password.trim().length < 8) {
      setError(t('auth.register.passwordTooShort'));
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('auth.register.error')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>{t('auth.register.title')}</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit}>
          {error ? <Message tone="error">{error}</Message> : null}
          <Field label={t('auth.register.name')} required>
            <TextInput
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t('auth.register.namePlaceholder')}
              required
              disabled={submitting}
            />
          </Field>
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
          <Field label={t('auth.password')} required hint={t('auth.register.passwordHint')}>
            <TextInput
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.register.passwordPlaceholder')}
              required
              minLength={8}
              disabled={submitting}
            />
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-secondary)',
              }}
            >
              {t('auth.register.haveProfile')}{' '}
              <Link to="/login" style={{ color: 'var(--text-link)', fontWeight: 600 }}>
                {t('auth.register.loginLink')}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
