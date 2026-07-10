import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../badges/Badge";

const PLACEHOLDER_PATTERN = "url('/design-system/assets/placeholder-pattern.svg')";

export interface MemoryCardProps {
  title: string;
  excerpt: string;
  author: string;
  city?: string;
  topic?: string;
  photo?: boolean;
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
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hover ? "translateY(-2px)" : "none",
        transition: "box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)",
        fontFamily: "var(--font-ui)",
      }}
    >
      {photo && (
        <div style={{
          height: 160, backgroundImage: PLACEHOLDER_PATTERN, backgroundSize: "72px 72px",
          backgroundColor: "var(--bg-sunken)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-surface)", padding: "3px 8px", borderRadius: "var(--radius-sm)" }}>
            {t("cards.photoPlaceholder")}
          </span>
        </div>
      )}
      <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {topic && <Badge variant="topic" tone="amber">{topic}</Badge>}
          {city && <Badge variant="topic" tone="moss">{city}</Badge>}
          {privacy && <Badge variant={privacy === "public" ? "privacy-public" : "privacy-private"} />}
        </div>
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-xl)", fontWeight: 600, lineHeight: "var(--leading-tight)", color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)", margin: 0 }}>
          {excerpt}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, fontSize: 13, color: "var(--text-tertiary)" }}>
          <span>{author}</span>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Badge variant="warmth">{warmth}</Badge>
            <span>💬 {comments}</span>
          </div>
        </div>
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
        display: "flex", flexDirection: "column", gap: 10,
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        cursor: onClick ? "pointer" : "default",
        boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow var(--duration-base) var(--ease-standard)",
        fontFamily: "var(--font-ui)",
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge variant="topic" tone="moss">{city}</Badge>
        <Badge variant="topic" tone="amber">{t(`lost.types.${type}`, { defaultValue: type })}</Badge>
        {years && <span style={{ fontSize: 12, color: "var(--text-tertiary)", alignSelf: "center" }}>{years}</span>}
      </div>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: "var(--leading-normal)", margin: 0 }}>
        {description}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-tertiary)" }}>
        <span>{author}</span>
        <span>{date}</span>
      </div>
    </article>
  );
}
