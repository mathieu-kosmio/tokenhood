import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
  lang: locals.lang,
  user: locals.user ? { displayName: locals.user.display_name } : null,
});
