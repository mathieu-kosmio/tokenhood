// Erreurs de la couche métier : un code stable, un statut HTTP et un message localisé (clé de locales/).
// L'API les traduit selon Accept-Language ; aucune chaîne d'interface n'est écrite ici.
import type { MessageKey, Values } from '@tokenhood/i18n';

export interface FieldError {
  field: string;
  key: MessageKey;
  values?: Values;
}

export class DomainError extends Error {
  readonly code: string;
  readonly status: number;
  readonly key: MessageKey;
  readonly values: Values | undefined;
  readonly fields: FieldError[];

  constructor(code: string, status: number, key: MessageKey, values?: Values, fields: FieldError[] = []) {
    super(code);
    this.name = 'DomainError';
    this.code = code;
    this.status = status;
    this.key = key;
    this.values = values;
    this.fields = fields;
  }
}

export const isDomainError = (error: unknown): error is DomainError => error instanceof DomainError;

export const validationFailed = (fields: FieldError[]) =>
  new DomainError('validation_failed', 422, 'errors.validation', { count: fields.length }, fields);
