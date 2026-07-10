import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { adminDeleteComment } from '@/api/admin';
import { deleteMemory, getMemory, type Memory } from '@/api/memories';
import { addComment, createReport, deleteComment, getComments, toggleLike, type Comment } from '@/api/social';
import { Badge, Button, Message, Modal, Textarea, WarmthIcon } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  PAGE_WRAPPER_STYLE,
  SURFACE_STYLE,
  formatDate,
  formatYears,
  getErrorMessage,
  toPhotoUrl,
} from '@/pages/pageShared';

interface MemoryDetails {
  memory: Memory;
  comments: Comment[];
}

export function MemoryDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportError, setReportError] = useState('');
  const [commentReportTarget, setCommentReportTarget] = useState<number | null>(null);
  const [commentReportReason, setCommentReportReason] = useState('');
  const [commentReportError, setCommentReportError] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submittingCommentReport, setSubmittingCommentReport] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingLike, setUpdatingLike] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const memoryId = Number(id);

  const fetchDetails = useCallback(
    async (signal: AbortSignal) => {
      if (!Number.isFinite(memoryId)) {
        throw new Error(t('memory.invalidId'));
      }

      const [memoryResponse, commentsResponse] = await Promise.all([
        getMemory(memoryId, signal),
        getComments(memoryId, signal),
      ]);
      return { memory: memoryResponse.data, comments: commentsResponse.data };
    },
    [memoryId, t],
  );

  const { data, setData, loading, error, setError } = useAsyncData(fetchDetails, t('memory.loadError'));
  const memory = data?.memory ?? null;
  const comments = data?.comments ?? [];

  const updateDetails = useCallback(
    (updater: (current: MemoryDetails) => MemoryDetails) => {
      setData((current) => (current ? updater(current) : current));
    },
    [setData],
  );

  const isOwner = Boolean(user && memory && user.id === memory.userId);
  const years = useMemo(
    () => (memory ? formatYears(memory.yearFrom, memory.yearTo) : ''),
    [memory],
  );

  const handleToggleLike = async () => {
    if (!memory || !user || updatingLike) {
      return;
    }

    setUpdatingLike(true);

    try {
      const response = await toggleLike(memory.id);
      updateDetails((current) => ({
        ...current,
        memory: {
          ...current.memory,
          likedByMe: response.data.liked,
          likesCount: response.data.count,
        },
      }));
    } catch (toggleError) {
      setError(getErrorMessage(toggleError, t('memory.likeError')));
    } finally {
      setUpdatingLike(false);
    }
  };

  const handleAddComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!memory || !commentText.trim()) {
      return;
    }

    setSubmittingComment(true);
    setError('');

    try {
      const response = await addComment(memory.id, commentText.trim());
      updateDetails((current) => ({
        ...current,
        comments: [response.data, ...current.comments],
        memory: {
          ...current.memory,
          commentsCount: current.memory.commentsCount + 1,
        },
      }));
      setCommentText('');
    } catch (commentError) {
      setError(getErrorMessage(commentError, t('memory.comments.addError')));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!memory || !user) {
      return;
    }

    try {
      if (user.role === 'admin' && comment.userId !== user.id) {
        await adminDeleteComment(comment.id);
      } else {
        await deleteComment(memory.id, comment.id);
      }

      updateDetails((current) => ({
        ...current,
        comments: current.comments.filter((item) => item.id !== comment.id),
        memory: {
          ...current.memory,
          commentsCount: Math.max(0, current.memory.commentsCount - 1),
        },
      }));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, t('memory.comments.deleteError')));
    }
  };

  const handleDeleteMemory = async () => {
    if (!memory) {
      return;
    }

    setDeleting(true);

    try {
      await deleteMemory(memory.id);
      navigate('/dashboard', { replace: true });
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, t('memory.deleteModal.error')));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const handleReport = async () => {
    if (!memory || submittingReport) {
      return;
    }

    setSubmittingReport(true);
    setReportError('');

    try {
      await createReport('memory', memory.id, reportReason.trim() || undefined);
      setReportReason('');
      setReportOpen(false);
      setFeedback(t('memory.reportModal.sent'));
    } catch (reportError) {
      setReportError(getErrorMessage(reportError, t('memory.reportModal.error')));
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleReportComment = async () => {
    if (commentReportTarget === null || submittingCommentReport) {
      return;
    }

    setSubmittingCommentReport(true);
    setCommentReportError('');

    try {
      await createReport('comment', commentReportTarget, commentReportReason.trim() || undefined);
      setCommentReportReason('');
      setCommentReportTarget(null);
      setFeedback(t('memory.reportModal.sent'));
    } catch (err) {
      setCommentReportError(getErrorMessage(err, t('memory.reportModal.error')));
    } finally {
      setSubmittingCommentReport(false);
    }
  };

  if (loading) {
    return <div style={PAGE_WRAPPER_STYLE}>{t('memory.loading')}</div>;
  }

  if (error && !memory) {
    return (
      <div style={PAGE_WRAPPER_STYLE}>
        <Message tone="error">{error}</Message>
      </div>
    );
  }

  if (!memory) {
    return (
      <div style={PAGE_WRAPPER_STYLE}>
        <div style={SURFACE_STYLE}>{t('memory.notFound')}</div>
      </div>
    );
  }

  return (
    <div style={{ ...PAGE_WRAPPER_STYLE, maxWidth: 720 }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          border: 'none',
          background: 'none',
          padding: 0,
          marginBottom: 'var(--space-6)',
          fontFamily: 'var(--font-ui)',
          color: 'var(--text-link)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {t('memory.back')}
      </button>

      <article>
        {feedback ? (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Message tone="success" onDismiss={() => setFeedback('')}>
              {feedback}
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

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {memory.topicSlug ? (
            <Badge variant="topic">
              {memory.topicSlug}
            </Badge>
          ) : null}
          {memory.city ? (
            <Badge variant="city">
              {memory.city}
            </Badge>
          ) : null}
          <Badge variant={memory.isPublic ? 'privacy-public' : 'privacy-private'} />
        </div>

        <h1
          style={{
            margin: 'var(--space-4) 0 var(--space-2)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 600,
            lineHeight: 'var(--leading-tight)',
            color: 'var(--text-primary)',
          }}
        >
          {memory.title}
        </h1>
        <p
          style={{
            margin: '0 0 var(--space-6)',
            fontFamily: 'var(--font-ui)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
          }}
        >
          <b style={{ color: 'var(--text-secondary)' }}>{memory.authorName}</b>
          {years ? ` · ${years}` : ''}
          {` · ${formatDate(memory.createdAt)}`}
        </p>

        {memory.mediaUrls[0] ? (
          <img
            src={toPhotoUrl(memory.mediaUrls[0])}
            alt={memory.title}
            style={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
            }}
          />
        ) : null}

        <div
          style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-primary)',
            lineHeight: 'var(--leading-loose)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {memory.text}
        </div>

        {memory.type === 'recipe' && memory.ingredients ? (
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2
              style={{
                margin: '0 0 var(--space-3)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h3)',
                color: 'var(--text-primary)',
              }}
            >
              {t('memory.ingredients')}
            </h2>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)' }}>
              {memory.ingredients}
            </div>
          </section>
        ) : null}

        {memory.type === 'recipe' && memory.steps ? (
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2
              style={{
                margin: '0 0 var(--space-3)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-h3)',
                color: 'var(--text-primary)',
              }}
            >
              {t('memory.steps')}
            </h2>
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', lineHeight: 'var(--lh-body)' }}>
              {memory.steps}
            </div>
          </section>
        ) : null}

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginTop: 'var(--space-8)',
            paddingTop: 'var(--space-5)',
            borderTop: '1px solid var(--border-default)',
          }}
        >
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={!user || updatingLike}
            aria-pressed={memory.likedByMe}
            title={user ? undefined : t('memory.warmthSignInPrompt')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              border: `1px solid ${memory.likedByMe ? 'var(--accent)' : 'var(--border-strong)'}`,
              borderRadius: 'var(--radius-pill)',
              background: memory.likedByMe ? 'var(--accent-soft)' : 'transparent',
              color: memory.likedByMe ? 'var(--accent-text)' : 'var(--text-secondary)',
              boxShadow: memory.likedByMe ? 'var(--shadow-glow-sm)' : 'none',
              padding: '5px 14px',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              cursor: user ? 'pointer' : 'not-allowed',
            }}
          >
            <WarmthIcon size={15} color={memory.likedByMe ? 'var(--accent)' : 'var(--text-muted)'} />
            {t('memory.warmth', { total: memory.likesCount })}
          </button>
          <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
            {user ? t('memory.warmthHint') : t('memory.warmthSignInPrompt')}
          </span>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              {t('memory.commentsCount', { total: memory.commentsCount })}
            </span>
            {isOwner ? (
              <>
                <Button size="sm" variant="secondary" onClick={() => navigate(`/memories/${memory.id}/edit`)}>
                  {t('memory.edit')}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
                  {t('memory.delete')}
                </Button>
              </>
            ) : null}
            {!isOwner && user ? (
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-ui)',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {t('memory.report')}
              </button>
            ) : null}
          </div>
        </div>
      </article>

      <section style={{ marginTop: 'var(--space-10)' }}>
        <h2
          style={{
            margin: '0 0 var(--space-5)',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {t('memory.comments.heading')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {comments.length ? (
            comments.map((comment) => {
              const canDelete = Boolean(user && (user.id === comment.userId || user.role === 'admin'));

              return (
                <article
                  key={comment.id}
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-card)',
                    padding: 'var(--space-4) var(--space-5)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 'var(--space-4)',
                      flexWrap: 'wrap',
                      marginBottom: 4,
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>
                      <b style={{ color: 'var(--text-secondary)' }}>{comment.authorName}</b> · {formatDate(comment.createdAt)}
                    </span>
                    <span style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => void handleDeleteComment(comment)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--danger-text)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            padding: 0,
                          }}
                        >
                          {t('memory.comments.delete')}
                        </button>
                      ) : null}
                      {user && user.id !== comment.userId && user.role !== 'admin' ? (
                        <button
                          type="button"
                          onClick={() => setCommentReportTarget(comment.id)}
                          style={{
                            border: 'none',
                            background: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-ui)',
                            fontSize: 'var(--text-xs)',
                            textDecoration: 'underline',
                            padding: 0,
                          }}
                        >
                          {t('memory.comments.report')}
                        </button>
                      ) : null}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      lineHeight: 'var(--leading-normal)',
                    }}
                  >
                    {comment.text}
                  </p>
                </article>
              );
            })
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>{t('memory.comments.empty')}</div>
          )}
        </div>

        <div style={{ marginTop: 'var(--space-5)' }}>
          {user ? (
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={handleAddComment}>
              <Textarea
                rows={3}
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder={t('memory.comments.placeholder')}
                disabled={submittingComment}
              />
              <div>
                <Button type="submit" disabled={submittingComment || !commentText.trim()}>
                  {submittingComment ? t('memory.comments.submitting') : t('memory.comments.submit')}
                </Button>
              </div>
            </form>
          ) : (
            <div
              style={{
                padding: 'var(--space-4) var(--space-5)',
                background: 'var(--surface-sunken)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {t('memory.comments.signInPrompt')}
            </div>
          )}
        </div>
      </section>

      <Modal
        open={deleteOpen}
        title={t('memory.deleteModal.title')}
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger-solid" onClick={() => void handleDeleteMemory()} disabled={deleting}>
              {deleting ? t('memory.deleteModal.deleting') : t('memory.deleteModal.confirm')}
            </Button>
          </>
        }
      >
        {t('memory.deleteModal.body')}
      </Modal>

      <Modal
        open={reportOpen}
        title={t('memory.reportModal.title')}
        onClose={() => {
          setReportOpen(false);
          setReportError('');
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setReportOpen(false); setReportError(''); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => void handleReport()} disabled={submittingReport}>
              {submittingReport ? t('memory.reportModal.submitting') : t('memory.reportModal.submit')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {reportError ? <Message tone="error">{reportError}</Message> : null}
          <p style={{ margin: 0 }}>{t('memory.reportModal.body')}</p>
          <Textarea
            rows={4}
            value={reportReason}
            onChange={(event) => setReportReason(event.target.value)}
            aria-label={t('memory.reportModal.reasonLabel')}
            placeholder={t('memory.reportModal.reasonPlaceholder')}
            maxLength={500}
          />
        </div>
      </Modal>

      <Modal
        open={commentReportTarget !== null}
        title={t('memory.reportModal.commentTitle')}
        onClose={() => {
          setCommentReportTarget(null);
          setCommentReportError('');
        }}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCommentReportTarget(null); setCommentReportError(''); }}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => void handleReportComment()} disabled={submittingCommentReport}>
              {submittingCommentReport ? t('memory.reportModal.submitting') : t('memory.reportModal.submit')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {commentReportError ? <Message tone="error">{commentReportError}</Message> : null}
          <p style={{ margin: 0 }}>{t('memory.reportModal.body')}</p>
          <Textarea
            rows={4}
            value={commentReportReason}
            onChange={(event) => setCommentReportReason(event.target.value)}
            aria-label={t('memory.reportModal.reasonLabel')}
            placeholder={t('memory.reportModal.reasonPlaceholder')}
            maxLength={500}
          />
        </div>
      </Modal>
    </div>
  );
}
