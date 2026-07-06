import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createMemory, getMemory, updateMemory, type MemoryRequest } from '@/api/memories';
import { Button, Field, Message, Select, TextInput, Textarea } from '@/design-system';
import {
  CITIES,
  FORM_STYLE,
  MEMORY_TOPIC_OPTIONS,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  getErrorMessage,
  toPhotoUrl,
} from '@/pages/pageShared';

type MemoryType = 'story' | 'recipe';

interface MemoryFormState {
  type: MemoryType;
  title: string;
  text: string;
  ingredients: string;
  steps: string;
  city: string;
  topicSlug: string;
  yearFrom: string;
  yearTo: string;
  isPublic: boolean;
}

const CITY_OPTIONS = CITIES.map((city) => ({ value: city, label: city }));
const TYPE_OPTIONS = [
  { value: 'story', label: 'Історія' },
  { value: 'recipe', label: 'Рецепт' },
] as const;

const INITIAL_FORM: MemoryFormState = {
  type: 'story',
  title: '',
  text: '',
  ingredients: '',
  steps: '',
  city: '',
  topicSlug: '',
  yearFrom: '',
  yearTo: '',
  isPublic: true,
};

export function MemoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<MemoryFormState>(INITIAL_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    const loadMemory = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMemory(Number(id));
        if (!active) {
          return;
        }

        const memory = response.data;
        setForm({
          type: memory.type === 'recipe' ? 'recipe' : 'story',
          title: memory.title,
          text: memory.text,
          ingredients: memory.ingredients ?? '',
          steps: memory.steps ?? '',
          city: memory.city ?? '',
          topicSlug: memory.topicSlug ?? '',
          yearFrom: memory.yearFrom ? String(memory.yearFrom) : '',
          yearTo: memory.yearTo ? String(memory.yearTo) : '',
          isPublic: memory.isPublic,
        });
        setCurrentPhotoUrl(memory.mediaUrls[0] ? toPhotoUrl(memory.mediaUrls[0]) : '');
      } catch (loadError) {
        if (active) {
          setError(getErrorMessage(loadError, 'Не вдалося завантажити спогад.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMemory();

    return () => {
      active = false;
    };
  }, [id]);

  const topicOptions = useMemo(() => MEMORY_TOPIC_OPTIONS, []);

  const handleChange = <K extends keyof MemoryFormState>(key: K, value: MemoryFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoto(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim() || !form.text.trim()) {
      setError('Заповніть назву та основний текст спогаду.');
      return;
    }

    const payload: MemoryRequest = {
      type: form.type,
      title: form.title.trim(),
      text: form.text.trim(),
      ingredients: form.type === 'recipe' && form.ingredients.trim() ? form.ingredients.trim() : undefined,
      steps: form.type === 'recipe' && form.steps.trim() ? form.steps.trim() : undefined,
      city: form.city || undefined,
      topicSlug: form.topicSlug || undefined,
      yearFrom: form.yearFrom ? Number(form.yearFrom) : undefined,
      yearTo: form.yearTo ? Number(form.yearTo) : undefined,
      isPublic: form.isPublic,
    };

    setSubmitting(true);

    try {
      const response = isEdit && id
        ? await updateMemory(Number(id), payload, photo ?? undefined)
        : await createMemory(payload, photo ?? undefined);

      navigate(`/memories/${response.data.id}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Не вдалося зберегти спогад.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={PAGE_WRAPPER_STYLE}>Завантажуємо форму спогаду…</div>;
  }

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>{isEdit ? 'Редагувати спогад' : 'Новий спогад'}</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit}>
          {error ? <Message tone="error">{error}</Message> : null}

          <Field label="Формат">
            <Select
              value={form.type}
              onChange={(event) => handleChange('type', event.target.value as MemoryType)}
              options={TYPE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
            />
          </Field>

          <Field label="Назва" required>
            <TextInput value={form.title} onChange={(event) => handleChange('title', event.target.value)} />
          </Field>

          <Field label="Текст" required>
            <Textarea rows={8} value={form.text} onChange={(event) => handleChange('text', event.target.value)} />
          </Field>

          {form.type === 'recipe' ? (
            <>
              <Field label="Інгредієнти">
                <Textarea rows={5} value={form.ingredients} onChange={(event) => handleChange('ingredients', event.target.value)} />
              </Field>
              <Field label="Кроки приготування">
                <Textarea rows={6} value={form.steps} onChange={(event) => handleChange('steps', event.target.value)} />
              </Field>
            </>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
            <Field label="Місто">
              <Select
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder="Оберіть місто"
                options={CITY_OPTIONS}
              />
            </Field>
            <Field label="Тема">
              <Select
                value={form.topicSlug}
                onChange={(event) => handleChange('topicSlug', event.target.value)}
                placeholder="Оберіть тему"
                options={topicOptions}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-5)' }}>
            <Field label="Рік від">
              <TextInput
                value={form.yearFrom}
                onChange={(event) => handleChange('yearFrom', event.target.value)}
                placeholder="Наприклад, 1998"
                inputMode="numeric"
              />
            </Field>
            <Field label="Рік до">
              <TextInput
                value={form.yearTo}
                onChange={(event) => handleChange('yearTo', event.target.value)}
                placeholder="Наприклад, 2004"
                inputMode="numeric"
              />
            </Field>
          </div>

          <Field label="Фото">
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt="Поточне фото спогаду"
                  style={{
                    width: '100%',
                    maxWidth: '320px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    objectFit: 'cover',
                  }}
                />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-secondary)',
                }}
              />
              {photo ? (
                <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>{photo.name}</span>
              ) : null}
            </div>
          </Field>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontFamily: 'var(--font-ui)',
              color: 'var(--text-primary)',
            }}
          >
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) => handleChange('isPublic', event.target.checked)}
            />
            Показувати спогад у публічній стрічці
          </label>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Зберігаємо…' : isEdit ? 'Оновити спогад' : 'Створити спогад'}
            </Button>
            <Button variant="ghost" onClick={() => navigate(isEdit && id ? `/memories/${id}` : '/dashboard')} type="button">
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

