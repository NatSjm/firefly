import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLostRequest } from '@/api/lost';
import { Button, Field, Message, Select, TextInput, Textarea } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import {
  CITIES,
  FORM_STYLE,
  LOST_TYPE_OPTIONS,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  getErrorMessage,
} from '@/pages/pageShared';

const CITY_OPTIONS = CITIES.map((city) => ({ value: city, label: city }));

export function LostNewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [type, setType] = useState('other');
  const [years, setYears] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setContactEmail(user.email);
    }
  }, [user?.email]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!city || !description.trim() || !contactEmail.trim()) {
      setError('Заповніть місто, опис і контактний email.');
      return;
    }

    setSubmitting(true);

    try {
      await createLostRequest({
        city,
        type,
        years: years.trim() || undefined,
        description: description.trim(),
        contactEmail: contactEmail.trim(),
      });
      navigate('/lost');
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Не вдалося створити запит.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>Новий запит</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit}>
          {error ? <Message tone="error">{error}</Message> : null}
          <Field label="Місто" required>
            <Select value={city} onChange={(event) => setCity(event.target.value)} options={CITY_OPTIONS} placeholder="Оберіть місто" />
          </Field>
          <Field label="Тип місця">
            <Select value={type} onChange={(event) => setType(event.target.value)} options={LOST_TYPE_OPTIONS} />
          </Field>
          <Field label="Роки">
            <TextInput
              value={years}
              onChange={(event) => setYears(event.target.value)}
              placeholder="Наприклад, 1998–2003"
            />
          </Field>
          <Field label="Що саме шукаєте" required>
            <Textarea rows={7} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <Field label="Контактний email" required>
            <TextInput
              type="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Зберігаємо…' : 'Опублікувати запит'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/lost')} type="button">
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

