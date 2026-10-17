<script lang="ts">
  import '@fontsource-variable/lexend';
  import '@fontsource-variable/public-sans';
  import '@fontsource-variable/jetbrains-mono';
  import '../../../../design/kosmio.css';
  import '../../../../design/tokenhood.css';
  import '../app.css';
  import { resolve } from '$app/paths';
  import { LANGS, translator } from '@tokenhood/i18n';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();
  const t = $derived(translator(data.lang));
</script>

<svelte:head>
  <title>{t('app.name')} · {t('app.tagline')}</title>
  <meta name="description" content={t('home.lead')} />
</svelte:head>

<a class="kos-evitement" href="#contenu">{t('nav.skip')}</a>
<header class="th-header">
  <div class="th-wrap th-header__inner">
    <a class="th-brand" href={resolve('/')} aria-label={t('nav.home')}>
      <svg
        class="th-mark"
        aria-hidden="true"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke-width="2.25"
        stroke-linecap="round"><path d="M4 20L20 4M20 4h-7M20 4v7M4 20h4M4 20v-4" /></svg
      >
      <span aria-hidden="true">{t('app.name').toLowerCase()}</span>
    </a>
    <nav class="th-lang" aria-label={t('lang.label')}>
      {#each LANGS as lang (lang)}
        <!-- Lien de requête seule : reste sur la page courante, le chemin de base est conservé. -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href="?lang={lang}" hreflang={lang} {lang} aria-current={lang === data.lang ? 'true' : undefined}
          >{t(`lang.${lang}`)}</a
        >
      {/each}
    </nav>
  </div>
</header>

<main id="contenu" tabindex="-1">
  {@render children()}
</main>

<footer class="th-footer">
  <div class="th-wrap th-footer__inner">
    {t('footer.sign')}
    <a href="https://kosm.io"
      ><img src="/logo-kosmio.svg" alt={t('footer.kosmio')} width="84" height="28" /></a
    >
  </div>
</footer>
