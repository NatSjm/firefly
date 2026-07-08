import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createLostRequest } from '@/api/lost';
import { Button, Field, Message, Select, TextInput, Textarea } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import {
  FORM_STYLE,
  PAGE_HEADING_STYLE,
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  getCityOptions,
  getErrorMessage,
  getLostTypeOptions,
} from '@/pages/pageShared';

export function LostNewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity] = useState('');
  const [type, setType] = useState('other');
  const [years, setYears] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    city?: string;
    description?: string;
    contactEmail?: string;
    years?: string;
  }>({});

  const cityOptions = useMemo(() => getCityOptions(), []);
  const typeOptions = useMemo(() => getLostTypeOptions(), []);

  useEffect(() => {
    if (user?.email) {
      setContactEmail(user.email);
    }
  }, [user?.email]);

  const isBackwardsYearRange = (value: string) => {
    const match = value.trim().match(/^(\d{4})\s*[-–—]\s*(\d{4})$/);
    if (!match) {
      return false;
    }
    const [, from, to] = match;
    return Number(from) > Number(to);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const nextFieldErrors: typeof fieldErrors = {};
    if (!city) {
      nextFieldErrors.city = t('lost.new.cityRequired');
    }
    if (!description.trim()) {
      nextFieldErrors.description = t('lost.new.descriptionRequired');
    }
    if (!contactEmail.trim()) {
      nextFieldErrors.contactEmail = t('lost.new.contactEmailRequired');
    }
    if (years.trim() && isBackwardsYearRange(years)) {
      nextFieldErrors.years = t('lost.new.yearsInvalidRange');
    }
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) {
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
      setError(getErrorMessage(submitError, t('lost.new.error')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '760px', margin: '0 auto' }}>
        <h1 style={PAGE_HEADING_STYLE}>{t('lost.new.title')}</h1>
        <form style={FORM_STYLE} onSubmit={handleSubmit}>
          {error ? <Message tone="error">{error}</Message> : null}
          <Field label={t('lost.new.city')} required error={fieldErrors.city}>
            <Select
              value={city}
              error={fieldErrors.city}
              onChange={(event) => {
                setCity(event.target.value);
                setFieldErrors((current) => ({ ...current, city: undefined }));
              }}
              options={cityOptions}
              placeholder={t('lost.new.cityPlaceholder')}
            />
          </Field>
          <Field label={t('lost.new.type')}>
            <Select value={type} onChange={(event) => setType(event.target.value)} options={typeOptions} />
          </Field>
          <Field label={t('lost.new.years')} error={fieldErrors.years}>
            <TextInput
              value={years}
              error={fieldErrors.years}
              onChange={(event) => {
                setYears(event.target.value);
                setFieldErrors((current) => ({ ...current, years: undefined }));
              }}
              placeholder={t('lost.new.yearsPlaceholder')}
            />
          </Field>
          <Field label={t('lost.new.description')} required error={fieldErrors.description}>
            <Textarea
              rows={7}
              value={description}
              error={fieldErrors.description}
              onChange={(event) => {
                setDescription(event.target.value);
                setFieldErrors((current) => ({ ...current, description: undefined }));
              }}
            />
          </Field>
          <Field label={t('lost.new.contactEmail')} required error={fieldErrors.contactEmail}>
            <TextInput
              type="email"
              value={contactEmail}
              error={fieldErrors.contactEmail}
              onChange={(event) => {
                setContactEmail(event.target.value);
                setFieldErrors((current) => ({ ...current, contactEmail: undefined }));
              }}
              placeholder={t('auth.emailPlaceholder')}
            />
          </Field>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('lost.new.submitting') : t('lost.new.submit')}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/lost')} type="button">
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
