export type LostType = "kindergarten" | "school" | "camp" | "yard" | "other";

export const LOST_TYPE_LABEL: Record<string, string> = {
  kindergarten: "Дитсадок",
  school: "Школа",
  camp: "Табір",
  yard: "Двір",
  other: "Інше",
} satisfies Record<LostType, string>;
