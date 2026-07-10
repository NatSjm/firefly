import { useTranslation } from "react-i18next";
import { Button } from "../buttons/Button";

export interface HeaderProps {
  loggedIn?: boolean;
  userName?: string;
  /** Nav key of the current route — gets the amber active underline. */
  active?: string;
  onNavigate?: (key: string) => void;
  onLogin?: () => void;
  onMenuToggle?: () => void;
}

export interface FooterProps {
  onNavigate?: (key: string) => void;
}

export interface MobileMenuProps {
  open: boolean;
  loggedIn?: boolean;
  onNavigate?: (key: string) => void;
  onClose?: () => void;
  onLogin?: () => void;
}

const NAV_KEYS = ["feed", "lost", "about", "rules"] as const;

/**
 * Header — sticky cream bar with the firefly mark, primary nav (amber
 * underline on the active route), and auth state (login button or user chip).
 */
export function Header({ loggedIn = false, userName = "", active, onNavigate, onLogin, onMenuToggle }: HeaderProps) {
  const { t } = useTranslation();
  return (
    <header style={{
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-default)",
      position: "sticky", top: 0, zIndex: 50,
      fontFamily: "var(--font-ui)",
    }}>
      <div style={{
        maxWidth: "var(--content-max)", margin: "0 auto",
        padding: "0 var(--gutter)", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => onNavigate?.("home")}>
          <img src="/design-system/assets/logo-mark.svg" width="34" height="34" alt="" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>{t("app.name")}</span>
        </div>

        <nav className="ds-header-nav" style={{ gap: 24, alignItems: "center" }}>
          {NAV_KEYS.map((key) => (
            <a key={key} onClick={() => onNavigate?.(key)} style={{
              fontSize: "var(--text-sm)", fontWeight: 700,
              color: active === key ? "var(--text-primary)" : "var(--text-secondary)",
              borderBottom: active === key ? "2px solid var(--accent)" : "2px solid transparent",
              paddingBottom: 2,
              textDecoration: "none", cursor: "pointer",
            }}>{t(`nav.${key}`)}</a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {loggedIn ? (
            <div className="ds-header-nav" style={{ alignItems: "center", gap: 10 }}>
              <Button size="sm" variant="primary" onClick={() => onNavigate?.("create")}>{t("nav.newMemory")}</Button>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: "var(--primary-soft)",
                color: "var(--action-primary)", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "var(--text-sm)", cursor: "pointer",
              }} onClick={() => onNavigate?.("dashboard")}>
                {(userName || "?").slice(0, 1).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="ds-header-nav" style={{ alignItems: "center" }}>
              <Button size="sm" variant="secondary" onClick={onLogin}>{t("nav.login")}</Button>
            </div>
          )}
          <button onClick={onMenuToggle} className="ds-header-menu-btn" style={{
            background: "none", border: "none", cursor: "pointer", padding: 6,
          }} aria-label={t("nav.menu")}>
            <div style={{ width: 20, height: 2, background: "var(--text-primary)", marginBottom: 5 }} />
            <div style={{ width: 20, height: 2, background: "var(--text-primary)", marginBottom: 5 }} />
            <div style={{ width: 20, height: 2, background: "var(--text-primary)" }} />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Footer — the one night-indigo surface on every page: the dark where the
 * firefly glows. Rules/report links and the amber-glow mark.
 */
export function Footer({ onNavigate }: FooterProps) {
  const { t } = useTranslation();
  const linkStyle = {
    color: "rgba(245, 239, 223, 0.85)", textDecoration: "none", cursor: "pointer",
  } as const;
  return (
    <footer style={{
      background: "var(--surface-night)", color: "var(--text-on-dark)",
      fontFamily: "var(--font-ui)", marginTop: "var(--space-16)",
    }}>
      <div style={{
        maxWidth: "var(--content-max)", margin: "0 auto",
        padding: "var(--space-10) var(--gutter)",
        display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/design-system/assets/logo-mark-dark.svg" width="28" height="28" alt="" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: "var(--text-on-dark)" }}>{t("app.name")}</span>
          </div>
          <span style={{ fontSize: "var(--text-sm)", color: "rgba(245, 239, 223, 0.7)", lineHeight: "var(--leading-normal)" }}>
            {t("footer.tagline")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: "var(--text-sm)" }}>
          <a style={linkStyle} onClick={() => onNavigate?.("about")}>{t("nav.about")}</a>
          <a style={linkStyle} onClick={() => onNavigate?.("rules")}>{t("nav.rules")}</a>
          <a style={linkStyle} onClick={() => onNavigate?.("report")}>{t("nav.report")}</a>
        </div>
        <span style={{ fontSize: "var(--text-xs)", color: "rgba(245, 239, 223, 0.5)" }}>{t("nav.copyright")}</span>
      </div>
    </footer>
  );
}

/** MobileMenu — full-screen slide-down nav for small breakpoints. */
export function MobileMenu({ open, loggedIn = false, onNavigate, onClose, onLogin }: MobileMenuProps) {
  const { t } = useTranslation();
  if (!open) return null;
  const keys = ["feed", "lost", "dashboard", "about", "rules"] as const;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg-surface)", zIndex: 60,
      fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px var(--gutter)", borderBottom: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/design-system/assets/logo-mark.svg" width="30" height="30" alt="" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600 }}>{t("app.name")}</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "var(--text-secondary)", cursor: "pointer" }}>×</button>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", padding: "var(--space-4) var(--gutter)", gap: 4 }}>
        {keys.map((key) => (
          <a key={key} onClick={() => { onNavigate?.(key); onClose?.(); }} style={{
            padding: "14px 4px", fontSize: 17, fontWeight: 500, color: "var(--text-primary)",
            borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", textDecoration: "none",
          }}>{t(`nav.${key}`)}</a>
        ))}
      </nav>
      <div style={{ marginTop: "auto", padding: "var(--space-6) var(--gutter)" }}>
        {!loggedIn && (
          <button onClick={onLogin} style={{
            width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none",
            background: "var(--action-primary)", color: "var(--text-on-primary)",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 16, cursor: "pointer",
          }}>{t("nav.login")}</button>
        )}
      </div>
    </div>
  );
}
