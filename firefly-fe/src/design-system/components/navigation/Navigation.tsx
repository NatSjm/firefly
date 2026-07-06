import { Button } from "../buttons/Button";

export interface HeaderProps {
  loggedIn?: boolean;
  userName?: string;
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

const NAV_LINKS = [
  { key: "feed", label: "Стрічка" },
  { key: "lost", label: "Загублені світлячки" },
  { key: "about", label: "Про проєкт" },
  { key: "rules", label: "Правила спільноти" },
];

/**
 * Header — top bar with logo, primary nav, and auth state (login button or user menu).
 */
export function Header({ loggedIn = false, userName = "", onNavigate, onLogin, onMenuToggle }: HeaderProps) {
  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px var(--gutter)", background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border-subtle)", fontFamily: "var(--font-ui)",
      gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => onNavigate?.("home")}>
        <img src="/design-system/assets/firefly-mark.svg" width="30" height="30" alt="" />
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>Світлячок</span>
      </div>

      <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
        {NAV_LINKS.map((l) => (
          <a key={l.key} onClick={() => onNavigate?.(l.key)} style={{
            fontSize: 14, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", cursor: "pointer",
          }}>{l.label}</a>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {loggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button size="sm" variant="primary" onClick={() => onNavigate?.("create")}>Новий спогад</Button>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "var(--accent-soft)",
              color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }} onClick={() => onNavigate?.("dashboard")}>
              {(userName || "?").slice(0, 1).toUpperCase()}
            </div>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={onLogin}>Увійти</Button>
        )}
        <button onClick={onMenuToggle} style={{
          display: "none", background: "none", border: "none", cursor: "pointer", padding: 6,
        }} aria-label="Меню">
          <div style={{ width: 20, height: 2, background: "var(--text-primary)", marginBottom: 5 }} />
          <div style={{ width: 20, height: 2, background: "var(--text-primary)", marginBottom: 5 }} />
          <div style={{ width: 20, height: 2, background: "var(--text-primary)" }} />
        </button>
      </div>
    </header>
  );
}

/** Footer — calm closing bar with rules/report links and the mark. */
export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer style={{
      padding: "var(--space-10) var(--gutter)", background: "var(--bg-surface-alt)",
      borderTop: "1px solid var(--border-subtle)", fontFamily: "var(--font-ui)",
      display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img src="/design-system/assets/firefly-mark.svg" width="24" height="24" alt="" />
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Світлячок</span>
      </div>
      <div style={{ display: "flex", gap: 20, fontSize: 13, color: "var(--text-secondary)" }}>
        <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }} onClick={() => onNavigate?.("about")}>Про проєкт</a>
        <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }} onClick={() => onNavigate?.("rules")}>Правила спільноти</a>
        <a style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Повідомити про порушення</a>
      </div>
      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>© 2026 Світлячок</span>
    </footer>
  );
}

/** MobileMenu — full-screen slide-down nav for small breakpoints. */
export function MobileMenu({ open, loggedIn = false, onNavigate, onClose, onLogin }: MobileMenuProps) {
  if (!open) return null;
  const links = [
    { key: "feed", label: "Стрічка" },
    { key: "lost", label: "Загублені світлячки" },
    { key: "dashboard", label: "Мої світлячки" },
    { key: "about", label: "Про проєкт" },
    { key: "rules", label: "Правила спільноти" },
  ];
  return (
    <div style={{
      position: "fixed", inset: 0, background: "var(--bg-surface)", zIndex: 20,
      fontFamily: "var(--font-ui)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px var(--gutter)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/design-system/assets/firefly-mark.svg" width="26" height="26" alt="" />
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600 }}>Світлячок</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "var(--text-secondary)", cursor: "pointer" }}>×</button>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", padding: "var(--space-4) var(--gutter)", gap: 4 }}>
        {links.map((l) => (
          <a key={l.key} onClick={() => { onNavigate?.(l.key); onClose?.(); }} style={{
            padding: "14px 4px", fontSize: 17, color: "var(--text-primary)", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer",
          }}>{l.label}</a>
        ))}
      </nav>
      <div style={{ marginTop: "auto", padding: "var(--space-6) var(--gutter)" }}>
        {!loggedIn && (
          <button onClick={onLogin} style={{
            width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none",
            background: "var(--primary)", color: "var(--text-on-primary)", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}>Увійти</button>
        )}
      </div>
    </div>
  );
}
