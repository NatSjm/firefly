import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../badges/Badge";

const PLACEHOLDER_PATTERN = "url('/design-system/assets/placeholder-pattern.svg')";

/** WarmthIcon — the layered glowing-dot mark for the Warmth (Тепло) count. */
export function WarmthIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill={color} opacity="0.18" />
      <circle cx="10" cy="10" r="5.5" fill={color} opacity="0.35" />
      <circle cx="10" cy="10" r="3" fill={color} />
    </svg>
  );
}

export interface MemoryCardProps {
  title: string;
  excerpt: string;
  author: string;
  city?: string;
  topic?: string;
  photo?: boolean;
  /** Real photo URL; when absent but photo=true the striped placeholder shows. */
  photoUrl?: string;
  /** Formatted year range, e.g. "1994–1999". */
  years?: string;
  /** Memory kind — "recipe" gets the neutral «Рецепт» chip. */
  kind?: string;
  warmth?: number;
  comments?: number;
  /** Shown in dashboard; omit on public feed. */
  privacy?: "public" | "private";
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * MemoryCard — a story or recipe as it appears in the public feed / dashboard list.
 */
export function MemoryCard({
  title,
  excerpt,
  author,
  city,
  topic,
  photo = true,
  photoUrl,
  years,
  kind,
  warmth = 0,
  comments = 0,
  privacy,
  onClick,
}: MemoryCardProps) {
  const { t } = useTranslation();
  const [hover, setHover] = React.useState(false);
  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        background: "var(--surface-card)",
        border: `1px solid ${hover ? "var(--border-strong)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hover ? "var(--shadow-raised)" : "var(--shadow-card)",
        transition: "box-shadow var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)",
        fontFamily: "var(--font-ui)",
      }}
    >
      {photo && photoUrl && (
        <img
          src={photoUrl}
          alt={title}
          style={{ height: 160, width: "100%", objectFit: "cover", borderRadius: "var(--radius-md)" }}
        />
      )}
      {photo && !photoUrl && (
        <div style={{
          height: 160, backgroundImage: PLACEHOLDER_PATTERN, backgroundSize: "72px 72px",
          backgroundColor: "var(--surface-sunken)", borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text-muted)", background: "var(--surface-card)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
            {t("cards.photoPlaceholder")}
          </span>
        </div>
      )}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {topic && <Badge variant="topic">{topic}</Badge>}
        {city && <Badge variant="city">{city}</Badge>}
        {kind === "recipe" && <Badge variant="neutral">{t("memory.form.recipe")}</Badge>}
        {privacy && <Badge variant={privacy === "public" ? "privacy-public" : "privacy-private"} />}
      </div>
      <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "var(--text-xl)", fontWeight: 600, lineHeight: "var(--leading-tight)", color: "var(--text-primary)" }}>
        {title}
      </h3>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)", margin: 0 }}>
        {excerpt}
      </p>
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-4)",
        marginTop: "auto", paddingTop: "var(--space-2)",
        fontSize: "var(--text-xs)", color: "var(--text-muted)",
      }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{author}</span>
        {years && <span>{years}</span>}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, color: "var(--accent-text)", fontWeight: 700 }}>
          <WarmthIcon size={13} color="var(--accent)" /> {warmth}
        </span>
        <span>💬 {comments}</span>
      </div>
    </article>
  );
}

export interface LostRequestCardProps {
  city: string;
  /** Backend value; unknown values fall back to being shown verbatim. */
  type?: string;
  years?: string;
  description: string;
  author: string;
  date: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * LostRequestCard — a request in the "Lost Fireflies" (Загублені світлячки) section.
 */
export function LostRequestCard({ city, type = "other", years, description, author, date, onClick }: LostRequestCardProps) {
  const { t } = useTranslation();
  const [hover, setHover] = React.useState(false);
  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", gap: "var(--space-3)",
        background: "var(--surface-card)",
        border: `1px solid ${hover ? "var(--border-strong)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hover ? "var(--shadow-raised)" : "var(--shadow-card)",
        transition: "box-shadow var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)",
        fontFamily: "var(--font-ui)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", alignItems: "center" }}>
        <Badge variant="city">{city}</Badge>
        <Badge variant="neutral">{t(`lost.types.${type}`, { defaultValue: type })}</Badge>
        {years && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{years}</span>}
      </div>
      <p style={{ fontSize: "var(--text-md)", color: "var(--text-primary)", lineHeight: "var(--leading-normal)", margin: 0 }}>
        {description}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", paddingTop: "var(--space-2)", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
        <span>
          <b style={{ color: "var(--text-secondary)" }}>{author}</b> · {date}
        </span>
        {onClick && (
          <button
            type="button"
            onClick={onClick}
            style={{
              marginLeft: "auto",
              background: "transparent",
              color: "var(--action-primary)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-pill)",
              padding: "5px 14px",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("lost.respond")}
          </button>
        )}
      </div>
    </article>
  );
}
