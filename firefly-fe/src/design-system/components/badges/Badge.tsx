import React from "react";
import { useTranslation } from "react-i18next";

export interface BadgeProps {
  variant?: "topic" | "city" | "neutral" | "privacy-public" | "privacy-private" | "warmth";
  /** Legacy color family for a topic badge: "moss" renders the indigo city chip (same as variant="city"). */
  tone?: "amber" | "moss";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const badgeBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontFamily: "var(--font-ui)",
  fontSize: "var(--text-xs)",
  fontWeight: 700,
  padding: "3px 12px",
  borderRadius: "var(--radius-pill)",
  border: "1px solid transparent",
};

/**
 * Badge — small pill label used for topics (amber), cities (indigo), neutral
 * chips (kind/type), privacy state, and the "Warmth" count (the only badge
 * allowed to glow).
 */
export function Badge({ variant = "topic", tone = "amber", children, icon = null }: BadgeProps) {
  const { t } = useTranslation();
  if (variant === "privacy-public" || variant === "privacy-private") {
    const isPublic = variant === "privacy-public";
    return (
      <span style={{
        ...badgeBase,
        background: isPublic ? "var(--success-bg)" : "var(--surface-sunken)",
        color: isPublic ? "var(--success-text)" : "var(--text-secondary)",
        borderColor: isPublic ? "transparent" : "var(--border-default)",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: isPublic ? "var(--success-text)" : "var(--text-muted)" }} />
        {isPublic ? t("badge.public") : t("badge.private")}
      </span>
    );
  }

  if (variant === "warmth") {
    return (
      <span style={{
        ...badgeBase,
        padding: "5px 12px",
        background: "transparent",
        color: "var(--accent-text)",
        borderColor: "var(--border-default)",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", boxShadow: "var(--shadow-glow-sm)" }} />
        {children}
      </span>
    );
  }

  if (variant === "neutral") {
    return (
      <span style={{
        ...badgeBase,
        background: "var(--surface-sunken)",
        color: "var(--text-secondary)",
        borderColor: "var(--border-default)",
      }}>
        {icon}
        {children}
      </span>
    );
  }

  const isCity = variant === "city" || tone === "moss";
  return (
    <span style={{
      ...badgeBase,
      background: isCity ? "var(--indigo-100)" : "var(--accent-soft)",
      color: isCity ? "var(--indigo-800)" : "var(--accent-text)",
    }}>
      {icon}
      {children}
    </span>
  );
}
