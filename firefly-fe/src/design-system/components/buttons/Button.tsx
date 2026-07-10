import React from "react";

export interface ButtonProps {
  /** Visual style. "danger" is a calm outlined red; "danger-solid" is the committed destructive confirm (red wash, never an alarm-red fill). */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
  size?: "md" | "sm";
  /** Optional leading icon element. */
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}

const SIZE: Record<"md" | "sm", { padding: string; fontSize: string; gap: number }> = {
  md: { padding: "9px 22px", fontSize: "var(--text-button)", gap: 8 },
  sm: { padding: "5px 14px", fontSize: "var(--text-button-sm)", gap: 6 },
};

function variantStyle(variant: ButtonProps["variant"], _disabled: boolean): React.CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        background: "transparent",
        color: "var(--action-primary)",
        border: "1px solid var(--border-strong)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--text-secondary)",
        border: "1px solid transparent",
      };
    case "danger":
      return {
        background: "transparent",
        color: "var(--danger-text)",
        border: "1px solid var(--danger-text)",
      };
    case "danger-solid":
      return {
        background: "var(--danger-bg)",
        color: "var(--danger-text)",
        border: "1px solid var(--danger-text)",
      };
    case "primary":
    default:
      return {
        background: "var(--action-primary)",
        color: "var(--text-on-primary)",
        border: "1px solid transparent",
      };
  }
}

/**
 * Button — pill-shaped action. Primary is night indigo; danger is a calm
 * outlined red. Calm, no-hype tone: no uppercase, no heavy shadows.
 */
export function Button({
  variant = "primary",
  size = "md",
  icon = null,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = "button",
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sz = SIZE[size] ?? SIZE.md;
  const vs = variantStyle(variant, disabled);

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  let background = vs.background as string;
  let color = vs.color as string;
  if (!disabled && hover) {
    if (variant === "primary") background = "var(--action-primary-hover)";
    else if (variant === "secondary") background = "var(--bg-sunken)";
    else if (variant === "ghost") { background = "var(--bg-sunken)"; color = "var(--text-primary)"; }
    else if (variant === "danger") background = "var(--danger-bg)";
    else if (variant === "danger-solid") background = "var(--danger-bg-hover)";
  }
  if (!disabled && active && variant === "primary") background = "var(--primary-active)";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sz.gap,
        width: fullWidth ? "100%" : undefined,
        padding: sz.padding,
        fontSize: sz.fontSize,
        fontFamily: "var(--font-ui)",
        fontWeight: 700,
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)",
        transform: !disabled && active ? "scale(0.98)" : "scale(1)",
        ...vs,
        background,
        color,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
