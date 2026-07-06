import React from "react";

export interface BadgeProps {
  variant?: "topic" | "privacy-public" | "privacy-private" | "warmth";
  /** Color family for a topic badge — alternate between the two so a feed of mixed topics doesn't read as one flat color. */
  tone?: "amber" | "moss";
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const TOPIC_COLORS: Record<"amber" | "moss", { bg: string; fg: string; border: string }> = {
  amber: { bg: "var(--primary-soft)", fg: "var(--primary-hover)", border: "var(--primary-soft-border)" },
  moss: { bg: "var(--accent-soft)", fg: "var(--accent)", border: "var(--accent-soft-border)" },
};

/**
 * Badge — small pill label used for topics, privacy state, and the "Warmth" count.
 */
export function Badge({ variant = "topic", tone = "amber", children, icon = null }: BadgeProps) {
  if (variant === "privacy-public" || variant === "privacy-private") {
    const isPublic = variant === "privacy-public";
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
        padding: "4px 10px", borderRadius: "var(--radius-pill)",
        background: isPublic ? "var(--accent-soft)" : "var(--bg-sunken)",
        color: isPublic ? "var(--accent)" : "var(--text-secondary)",
        border: `1px solid ${isPublic ? "var(--accent-soft-border)" : "var(--border-default)"}`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: isPublic ? "var(--accent)" : "var(--text-tertiary)" }} />
        {isPublic ? "Публічно" : "Тільки я"}
      </span>
    );
  }

  if (variant === "warmth") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600,
        padding: "5px 12px", borderRadius: "var(--radius-pill)",
        background: "var(--primary-soft)", color: "var(--primary-hover)",
        border: "1px solid var(--primary-soft-border)",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", boxShadow: "var(--shadow-glow-sm)" }} />
        {children}
      </span>
    );
  }

  const c = TOPIC_COLORS[tone ?? "amber"] ?? TOPIC_COLORS.amber;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600,
      padding: "4px 10px", borderRadius: "var(--radius-pill)",
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
    }}>
      {icon}
      {children}
    </span>
  );
}
