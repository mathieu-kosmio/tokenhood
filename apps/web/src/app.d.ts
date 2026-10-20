import type { Lang } from '@tokenhood/i18n';
import type { Me } from '#lib/identity.js';

declare global {
  namespace App {
    interface Locals {
      lang: Lang;
      // Utilisateur connecté (profil servi par /v1/users/me), son ETag et son jeton de session.
      user: Me | null;
      etag: string | null;
      session: string | null;
    }
  }
}

export {};
