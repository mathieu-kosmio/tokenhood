<script lang="ts">
  import { translator, type MessageKey } from '@tokenhood/i18n';
  import { titleIn, type Status } from '#lib/mission.js';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const t = $derived(translator(data.lang));
  const statusKey = (status: Status) => `missions.status.${status}` as MessageKey;
</script>

<section class="th-hero">
  <div class="th-wrap th-hero__inner">
    <p class="th-eyebrow">{t('home.eyebrow')}</p>
    <h1>{t('home.title')}</h1>
    <p class="th-lead">{t('home.lead')}</p>
    <div class="th-actions">
      <a class="th-btn th-btn--primary" href="https://github.com/mathieu-kosmio/tokenhood"
        >{t('home.repository')}</a
      >
      <a class="th-btn th-btn--outline" href="https://tokenhood.kosm.io">{t('home.landing')}</a>
    </div>
  </div>
</section>

<section class="th-wrap th-missions" aria-labelledby="missions-titre">
  <h2 id="missions-titre">{t('missions.heading', { lot: data.lot })}</h2>
  <p class="th-progress">
    {t('home.progress', { integrated: data.progress.integrated, total: data.progress.total, lot: data.lot })}
  </p>
  <ol class="th-mission-list">
    {#each data.missions as mission (mission.id)}
      <li>
        <span class="th-mission-id">{mission.id}</span>
        <span class="th-mission-title">{titleIn(mission, data.lang)}</span>
        <span class="th-mission-type">{mission.type}</span>
        <span class="th-status th-status--{mission.status}">{t(statusKey(mission.status))}</span>
      </li>
    {/each}
  </ol>
  <p class="th-note">{t('missions.source')}</p>
</section>
