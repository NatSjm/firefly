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
  success: { bg: "var(--success-bg)", fg: "var(--success-strong)" },
  warning: { bg: "var(--warning-bg)", fg: "var(--warning-strong)" },
  error: { bg: "var(--error-bg)", fg: "var(--error-strong)" },
};

/** Message — inline success/warning/error banner, calm tone, no icons of alarm. */
export function Message({ tone = "success", children, onDismiss }: MessageProps) {
  const t = TONE[tone];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      background: t.bg, color: t.fg, border: `1px solid ${t.fg}`,
      borderRadius: "var(--radius-md)", padding: "12px 16px",
      fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500,
    }}>
      <span>{children}</span>
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
        position: "fixed", inset: 0, background: "oklch(20% 0.02 60 / 45%)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30,
        fontFamily: "var(--font-ui)",
      }}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
        width: 380, maxWidth: "90%", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: 16,
      }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: "var(--lh-body)" }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>{footer}</div>}
      </div>
    </div>
  );
}
