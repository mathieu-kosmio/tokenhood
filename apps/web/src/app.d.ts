import type { Lang } from '@tokenhood/i18n';

declare global {
  namespace App {
    interface Locals {
      lang: Lang;
    }
  }
}

export {};
