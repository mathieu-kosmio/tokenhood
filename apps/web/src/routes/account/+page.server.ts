import { redirect } from '@sveltejs/kit';
import { rubriques } from '#lib/account.js';
import type { PageServerLoad } from './$types';

// /account mène à la première rubrique.
export const load: PageServerLoad = () => {
  const [first] = rubriques();
  redirect(303, first ? first.href() : '/');
};
