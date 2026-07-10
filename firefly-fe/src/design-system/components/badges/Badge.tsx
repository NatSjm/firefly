import React from "react";
import { useTranslation } from "react-i18next";

export interface BadgeProps {
  variant?: "topic" | "privacy-public" | "privacy-private" | "warmth";
  /** Color family for a topic badge: "amber" for topics, "moss" (legacy name) renders the indigo city chip. */
  tone?: "amber" | "moss";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const TOPIC_COLORS: Record<"amber" | "moss", { bg: string; fg: string }> = {
  amber: { bg: "var(--accent-soft)", fg: "var(--accent-text)" },
  /* legacy "moss" tone is the city chip — night-indigo family in the rebrand */
  moss: { bg: "var(--indigo-100)", fg: "var(--indigo-800)" },
};

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
 * Badge — small pill label used for topics, cities, privacy state, and the
 * "Warmth" count (the only badge allowed to glow).
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

  const c = TOPIC_COLORS[tone ?? "amber"] ?? TOPIC_COLORS.amber;
  return (
    <span style={{ ...badgeBase, background: c.bg, color: c.fg }}>
      {icon}
      {children}
    </span>
  );
}
