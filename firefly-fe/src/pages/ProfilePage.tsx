import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '@/api/auth';
import { Button, Field, Message, TextInput, Textarea } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FORM_STYLE, PAGE_HEADING_STYLE, PAGE_WRAPPER_STYLE, SURFACE_STYLE, getErrorMessage } from '@/pages/pageShared';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setBio(user.bio ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
  }, [user]);

  if (!user) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      await refreshUser();
      setEditing(false);
      setMessage(t('profile.updated'));
    } catch (submitError) {
      setError(getErrorMessage(submitError, t('profile.error')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={PAGE_WRAPPER_STYLE}>
      <div style={{ ...SURFACE_STYLE, maxWidth: '760px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-6)',
          }}
        >
          <h1 style={PAGE_HEADING_STYLE}>{t('profile.title')}</h1>
          {!editing ? <Button variant="secondary" onClick={() => setEditing(true)}>{t('profile.edit')}</Button> : null}
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

        <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid var(--border-default)',
                }}
              />
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'var(--primary-soft)',
                  color: 'var(--action-primary)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-h3)',
                }}
              >
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-h3)', color: 'var(--text-primary)' }}>
                {user.name}
              </strong>
              <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>{user.email}</span>
              <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-tertiary)' }}>
                {t('profile.role', { role: user.role })}
              </span>
            </div>
          </div>

          {editing ? (
            <form style={FORM_STYLE} onSubmit={handleSubmit}>
              <Field label={t('profile.name')} required>
                <TextInput value={name} onChange={(event) => setName(event.target.value)} disabled={submitting} />
              </Field>
              <Field label={t('profile.bio')}>
                <Textarea rows={5} value={bio} onChange={(event) => setBio(event.target.value)} disabled={submitting} />
              </Field>
              <Field label={t('profile.avatarUrl')}>
                <TextInput value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} disabled={submitting} />
              </Field>
              <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('profile.saving') : t('profile.save')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name);
                    setBio(user.bio ?? '');
                    setAvatarUrl(user.avatarUrl ?? '');
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              <div>
                <h2
                  style={{
                    margin: '0 0 var(--space-2)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-h3)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t('profile.bioHeading')}
                </h2>
                <p style={{ margin: 0, fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)' }}>
                  {user.bio || t('profile.emptyBio')}
                </p>
              </div>
              <div>
                <h2
                  style={{
                    margin: '0 0 var(--space-2)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-h3)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {t('profile.avatarHeading')}
                </h2>
                <p style={{ margin: 0, fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
                  {user.avatarUrl || t('profile.emptyAvatar')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
