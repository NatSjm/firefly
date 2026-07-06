import React from "react";

export interface ButtonProps {
  /** Visual style. "danger" is outlined warning tone; "danger-solid" is the committed destructive action. */
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
  md: { padding: "10px 20px", fontSize: "var(--text-button)", gap: 8 },
  sm: { padding: "7px 14px", fontSize: "var(--text-button-sm)", gap: 6 },
};

function variantStyle(variant: ButtonProps["variant"], _disabled: boolean): React.CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        background: "var(--bg-surface)",
        color: "var(--text-primary)",
        border: "1px solid var(--border-strong)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--text-primary)",
        border: "1px solid transparent",
      };
    case "danger":
      return {
        background: "var(--error-bg)",
        color: "var(--error-strong)",
        border: "1px solid var(--error-strong)",
      };
    case "danger-solid":
      return {
        background: "var(--error-500)",
        color: "var(--neutral-0)",
        border: "1px solid transparent",
      };
    case "primary":
    default:
      return {
        background: "var(--primary)",
        color: "var(--text-on-primary)",
        border: "1px solid transparent",
      };
  }
}

/**
 * Button — primary call to action, secondary, ghost, and danger variants.
 * Calm, no-hype tone: no uppercase, no heavy shadows, gentle hover darken.
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
  if (!disabled && hover) {
    if (variant === "primary") background = "var(--primary-hover)";
    else if (variant === "secondary") background = "var(--bg-surface-alt)";
    else if (variant === "ghost") background = "var(--bg-surface-alt)";
    else if (variant === "danger") background = "var(--error-bg)";
    else if (variant === "danger-solid") background = "var(--error-700)";
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
        fontWeight: 600,
        borderRadius: "var(--radius-pill)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)",
        transform: !disabled && active ? "scale(0.98)" : "scale(1)",
        ...vs,
        background,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
