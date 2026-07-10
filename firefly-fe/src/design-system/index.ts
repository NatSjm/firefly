/**
 * Svitlyachok Design System — barrel export.
 * Import individual components from here, e.g.:
 *   import { Button, Badge, MemoryCard } from '@/design-system';
 *
 * CSS tokens must be imported separately once in main.tsx:
 *   import './design-system/styles.css';
 */

export { Button } from "./components/buttons/Button";
export type { ButtonProps } from "./components/buttons/Button";

export { Field, TextInput, Textarea, Select } from "./components/inputs/Inputs";
export type { FieldProps, TextInputProps, TextareaProps, SelectProps, SelectOption } from "./components/inputs/Inputs";

export { Badge } from "./components/badges/Badge";
export type { BadgeProps } from "./components/badges/Badge";

export { MemoryCard, LostRequestCard, WarmthIcon } from "./components/cards/Cards";
export type { MemoryCardProps, LostRequestCardProps } from "./components/cards/Cards";
export { LOST_TYPES } from "./components/cards/lostTypeLabels";
export type { LostType } from "./components/cards/lostTypeLabels";

export { Header, Footer, MobileMenu } from "./components/navigation/Navigation";
export type { HeaderProps, FooterProps, MobileMenuProps } from "./components/navigation/Navigation";

export { FilterBar } from "./components/filters/FilterBar";
export type { FilterBarProps } from "./components/filters/FilterBar";

export { Message, Modal } from "./components/feedback/Feedback";
export type { MessageProps, ModalProps } from "./components/feedback/Feedback";
