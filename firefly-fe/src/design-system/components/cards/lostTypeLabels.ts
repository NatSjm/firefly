/** Canonical lost-request place types; labels live in the i18n catalog under `lost.types.*`. */
export const LOST_TYPES = ["kindergarten", "school", "camp", "yard", "other"] as const;

export type LostType = (typeof LOST_TYPES)[number];
