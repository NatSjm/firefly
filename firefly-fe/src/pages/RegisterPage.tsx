import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Field, Message, TextInput } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FORM_STYLE, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, getErrorMessage } from '@/pages/pageShared';

export function RegisterPage() {
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
      setError('Пароль має містити щонайменше 8 символів.');
      return;
    }

    setSubmitting(true);

    try {
      await register(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Не вдалося створити профіль. Спробуйте ще раз.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '560px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>Реєстрація</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit}>
          {error ? <Message tone="error">{error}</Message> : null}
          <Field label="Ім’я" required>
            <TextInput
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Як до вас звертатися"
              required
              disabled={submitting}
            />
          </Field>
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
          <Field label="Пароль" required hint="Мінімум 8 символів">
            <TextInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Створіть пароль"
              required
              minLength={8}
              disabled={submitting}
            />
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Створюємо профіль…' : 'Створити профіль'}
            </Button>
            <p
              style={{
                margin: 0,
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-secondary)',
              }}
            >
              Уже маєте профіль?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Увійти
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
