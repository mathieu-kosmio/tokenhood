import { resolve } from '$app/paths';
import type { Rubrique } from '#lib/account.js';

export const rubrique: Rubrique = {
  label: 'identity.account.rubrique.profile',
  order: 10,
  href: () => resolve('/account/profile'),
};
