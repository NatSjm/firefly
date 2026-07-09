import React from "react";

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export interface TextInputProps {
  type?: "text" | "email" | "password";
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  error?: string;
  disabled?: boolean;
}

export interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  rows?: number;
  error?: string;
  disabled?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const baseFieldStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "var(--text-body)",
  color: "var(--text-primary)",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
};

function useFieldChrome(error?: string) {
  const [focused, setFocused] = React.useState(false);
  const style: React.CSSProperties = {
    ...baseFieldStyle,
    borderColor: error ? "var(--error-500)" : focused ? "var(--focus-ring)" : "var(--border-default)",
    boxShadow: focused ? `0 0 0 3px ${error ? "var(--error-bg)" : "var(--primary-soft)"}` : "none",
  };
  return { style, onFocus: () => setFocused(true), onBlur: () => setFocused(false) };
}

/**
 * Field — shared label + helper/error text wrapper for any input control.
 */
export function Field({ label, hint, error, required, children }: FieldProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-ui)", width: "100%" }}>
      {label && (
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
          {label}{required && <span style={{ color: "var(--error-500)" }}> *</span>}
        </span>
      )}
      {children}
      {error ? (
        <span style={{ fontSize: 13, color: "var(--error-strong)" }}>{error}</span>
      ) : hint ? (
        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{hint}</span>
      ) : null}
    </label>
  );
}

/** TextInput — single-line text, email, or password field. */
export function TextInput({ type = "text", placeholder, value, onChange, error, disabled, ...rest }: TextInputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const chrome = useFieldChrome(error);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...chrome}
      style={{ ...chrome.style, opacity: disabled ? 0.55 : 1 }}
      {...rest}
    />
  );
}

/** Textarea — multi-line text, used for memory stories and descriptions. */
export function Textarea({ placeholder, value, onChange, rows = 5, error, disabled, ...rest }: TextareaProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const chrome = useFieldChrome(error);
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      {...chrome}
      style={{ ...chrome.style, resize: "vertical", lineHeight: "var(--lh-body)", opacity: disabled ? 0.55 : 1 }}
      {...rest}
    />
  );
}

/** Select — native dropdown styled to match text fields (city, topic, sort). */
export function Select({ value, onChange, options = [], placeholder, error, disabled, ...rest }: SelectProps) {
  const chrome = useFieldChrome(error);
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      {...rest}
      {...chrome}
      style={{ ...chrome.style, opacity: disabled ? 0.55 : 1, appearance: "none", backgroundImage: "none" }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}
