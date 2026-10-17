<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { negotiate, translator } from '@tokenhood/i18n';

  const lang = $derived(page.data.lang ?? negotiate(null));
  const t = $derived(translator(lang));
</script>

<section class="th-wrap th-error">
  <h1>{page.status === 404 ? t('errors.pageNotFound') : t('errors.internal')}</h1>
  <p><a class="th-btn th-btn--outline" href={resolve('/')}>{t('errors.backHome')}</a></p>
</section>
