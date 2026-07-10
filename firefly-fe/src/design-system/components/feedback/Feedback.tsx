import React from "react";

export interface MessageProps {
  tone?: "success" | "warning" | "error";
  children: React.ReactNode;
  onDismiss?: () => void;
}

export interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  footer?: React.ReactNode;
}

const TONE: Record<"success" | "warning" | "error", { bg: string; fg: string }> = {
  success: { bg: "var(--success-bg)", fg: "var(--success-text)" },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning-text)" },
  error: { bg: "var(--danger-bg)", fg: "var(--danger-text)" },
};

const TONE_ICON: Record<"success" | "warning" | "error", React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 2L14.5 13.5H1.5L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.9" fill="currentColor" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5v4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.3" r="0.9" fill="currentColor" />
    </svg>
  ),
};

/** Message — inline success/warning/error banner with a thin-line icon; calm tone. */
export function Message({ tone = "success", children, onDismiss }: MessageProps) {
  const t = TONE[tone];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      background: t.bg, color: t.fg, border: "1px solid transparent",
      borderRadius: "var(--radius-md)", padding: "12px 16px",
      fontFamily: "var(--font-ui)", fontSize: "var(--text-sm)", fontWeight: 500,
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {TONE_ICON[tone]}
        <span>{children}</span>
      </span>
      {onDismiss && (
        <button onClick={onDismiss} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 16, lineHeight: 1, opacity: 0.7 }}>×</button>
      )}
    </div>
  );
}

/** Modal — centered dialog for confirmations (delete) and reporting content. */
export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(28, 33, 64, 0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        padding: "var(--space-6)", fontFamily: "var(--font-ui)",
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title} style={{
        background: "var(--surface-card)", border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-modal)",
        width: 440, maxWidth: "100%", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: 16,
      }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>{footer}</div>}
      </div>
    </div>
  );
}
