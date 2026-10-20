// Composants de formulaire accessibles, communs à toutes les rubriques : étiquettes, aides et erreurs reliées.
export { default as ChoiceGroup } from './ChoiceGroup.svelte';
export { default as ErrorSummary } from './ErrorSummary.svelte';
export { default as SelectField } from './SelectField.svelte';
export { default as TextField } from './TextField.svelte';

export interface FormError {
  field: string;
  message: string;
}

export const errorFor = (errors: FormError[] | undefined, field: string): string | undefined =>
  errors?.find((e) => e.field === field)?.message;
