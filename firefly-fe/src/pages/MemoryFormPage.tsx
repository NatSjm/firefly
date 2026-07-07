import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { createMemory, getMemory, updateMemory, type MemoryRequest } from '@/api/memories';
import { Button, Field, Message, Select, TextInput, Textarea } from '@/design-system';
import {
  FORM_STYLE,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  getCityOptions,
  getErrorMessage,
  getTopicOptions,
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<MemoryFormState>(INITIAL_FORM);
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const cityOptions = useMemo(() => getCityOptions(), []);
  const topicOptions = useMemo(() => getTopicOptions(), []);
  const typeOptions = useMemo(
    () => [
      { value: 'story', label: t('memory.form.story') },
      { value: 'recipe', label: t('memory.form.recipe') },
    ],
    [t],
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    const loadMemory = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getMemory(Number(id), controller.signal);
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
          setError(getErrorMessage(loadError, t('memory.form.loadError')));
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
      controller.abort();
    };
  }, [id, t]);

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
      setError(t('memory.form.missingFields'));
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
      setError(getErrorMessage(submitError, t('memory.form.saveError')));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={PAGE_WRAPPER_STYLE}>{t('memory.form.loading')}</div>;
  }

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>{isEdit ? t('memory.form.editTitle') : t('memory.form.newTitle')}</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit}>
          {error ? <Message tone="error">{error}</Message> : null}

          <Field label={t('memory.form.format')}>
            <Select
              value={form.type}
              onChange={(event) => handleChange('type', event.target.value as MemoryType)}
              options={typeOptions}
            />
          </Field>

          <Field label={t('memory.form.title')} required>
            <TextInput value={form.title} onChange={(event) => handleChange('title', event.target.value)} />
          </Field>

          <Field label={t('memory.form.text')} required>
            <Textarea rows={8} value={form.text} onChange={(event) => handleChange('text', event.target.value)} />
          </Field>

          {form.type === 'recipe' ? (
            <>
              <Field label={t('memory.form.ingredients')}>
                <Textarea rows={5} value={form.ingredients} onChange={(event) => handleChange('ingredients', event.target.value)} />
              </Field>
              <Field label={t('memory.form.steps')}>
                <Textarea rows={6} value={form.steps} onChange={(event) => handleChange('steps', event.target.value)} />
              </Field>
            </>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)' }}>
            <Field label={t('memory.form.city')}>
              <Select
                value={form.city}
                onChange={(event) => handleChange('city', event.target.value)}
                placeholder={t('memory.form.cityPlaceholder')}
                options={cityOptions}
              />
            </Field>
            <Field label={t('memory.form.topic')}>
              <Select
                value={form.topicSlug}
                onChange={(event) => handleChange('topicSlug', event.target.value)}
                placeholder={t('memory.form.topicPlaceholder')}
                options={topicOptions}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-5)' }}>
            <Field label={t('memory.form.yearFrom')}>
              <TextInput
                value={form.yearFrom}
                onChange={(event) => handleChange('yearFrom', event.target.value)}
                placeholder={t('memory.form.yearFromPlaceholder')}
                inputMode="numeric"
              />
            </Field>
            <Field label={t('memory.form.yearTo')}>
              <TextInput
                value={form.yearTo}
                onChange={(event) => handleChange('yearTo', event.target.value)}
                placeholder={t('memory.form.yearToPlaceholder')}
                inputMode="numeric"
              />
            </Field>
          </div>

          <Field label={t('memory.form.photo')}>
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt={t('memory.form.currentPhotoAlt')}
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
            {t('memory.form.isPublic')}
          </label>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('memory.form.submitting') : isEdit ? t('memory.form.update') : t('memory.form.create')}
            </Button>
            <Button variant="ghost" onClick={() => navigate(isEdit && id ? `/memories/${id}` : '/dashboard')} type="button">
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
