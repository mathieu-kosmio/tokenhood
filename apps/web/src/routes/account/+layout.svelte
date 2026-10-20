<!-- Espace Compte : le menu des rubriques est construit depuis src/routes/account/<rubrique>/rubrique.ts. -->
<script lang="ts">
  import { page } from '$app/state';
  import { translator } from '@tokenhood/i18n';
  import { rubriques } from '#lib/account.js';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();
  const t = $derived(translator(data.lang));
</script>

<div class="th-wrap th-account">
  <nav class="th-account__nav" aria-label={t('identity.account.nav')}>
    <p class="th-eyebrow">{t('identity.account.title')}</p>
    <ul>
      {#each rubriques() as rubrique (rubrique.id)}
        <li>
          <!-- Lien déjà résolu par la rubrique (rubrique.ts). -->
          <!-- eslint-disable svelte/no-navigation-without-resolve -->
          <a
            class="kos-nav__lien"
            href={rubrique.href()}
            aria-current={page.url.pathname === rubrique.href() ? 'page' : undefined}>{t(rubrique.label)}</a
          >
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        </li>
      {/each}
    </ul>
  </nav>
  <div class="th-account__body">
    {@render children()}
  </div>
</div>
