<script lang="ts">
  import { translator } from '@tokenhood/i18n';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const t = $derived(translator(data.lang));
</script>

<svelte:head>
  <title>{t('identity.login.title')} · {t('app.name')}</title>
</svelte:head>

<section class="th-wrap th-page" aria-labelledby="login-title">
  <div class="th-page__body">
    <p class="th-eyebrow">{t('identity.login.eyebrow')}</p>
    <h1 id="login-title">{t('identity.login.title')}</h1>
    <p class="th-lead">{t('identity.login.lead')}</p>
    {#if data.error}
      <p class="th-alert th-alert--error" role="alert">{t(data.error)}</p>
    {/if}
    {#if data.available}
      <p>
        <!-- Départ du parcours OAuth sur l'API (autre origine). -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a class="th-btn th-btn--primary" href={data.startUrl}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
            ><path
              d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
            /></svg
          >
          {t('identity.login.github')}
        </a>
      </p>
      <p class="th-note">{t('identity.login.scopes')}</p>
    {:else}
      <div class="th-alert th-alert--info" role="status">
        <h2>{t('identity.login.unavailable.title')}</h2>
        <p>{t('identity.login.unavailable.body')}</p>
      </div>
    {/if}
  </div>
</section>
