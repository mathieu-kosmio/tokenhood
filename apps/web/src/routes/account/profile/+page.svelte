<script lang="ts">
  import { LANGS, translator } from '@tokenhood/i18n';
  import { ChoiceGroup, ErrorSummary, SelectField, TextField, errorFor } from '#lib/forms/index.js';
  import { DEFAULT_TIMEZONE, DISPLAY_NAME_MAX, ROLES, type DocumentId } from '#lib/identity.js';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const t = $derived(translator(data.lang));
  const values = $derived(
    form && 'values' in form && form.values
      ? form.values
      : {
          display_name: data.me.display_name,
          roles: data.me.roles as string[],
          lang: data.me.lang as string,
          timezone: data.me.timezone ?? DEFAULT_TIMEZONE,
        },
  );
  const errors = $derived(form && 'errors' in form ? (form.errors ?? []) : []);
  const message = $derived(form && 'message' in form ? form.message : null);
  const saved = $derived(Boolean(form && 'saved' in form && form.saved));
  const title = (id: DocumentId) => t(`identity.documents.${id}`);
  const date = (iso: string) =>
    new Intl.DateTimeFormat(data.lang, {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: data.me.timezone ?? 'UTC',
    }).format(new Date(iso));
</script>

<svelte:head>
  <title>{t('identity.profile.title')} · {t('app.name')}</title>
</svelte:head>

<h1>{t('identity.profile.title')}</h1>
{#if data.me.github}
  <p class="th-note">{t('identity.profile.github', { login: data.me.github.login })}</p>
{/if}

<ErrorSummary title={t('form.errorSummary', { count: errors.length })} {errors} />
{#if message}
  <p class="th-alert th-alert--error" role="alert">{message}</p>
{/if}
<p class="th-alert th-alert--success" role="status" hidden={!saved}>
  {saved ? t('identity.profile.saved') : ''}
</p>

<form method="POST" class="th-form" novalidate>
  <input type="hidden" name="submission" value={data.submission} />
  <TextField
    id="display_name"
    name="display_name"
    label={t('identity.profile.displayName')}
    hint={t('identity.profile.displayNameHint', { max: DISPLAY_NAME_MAX })}
    value={values.display_name}
    error={errorFor(errors, 'display_name')}
    autocomplete="nickname"
    maxlength={DISPLAY_NAME_MAX}
    required
  />
  <ChoiceGroup
    id="roles"
    name="roles"
    legend={t('identity.profile.roles')}
    hint={t('identity.profile.rolesHint')}
    options={ROLES.map((r) => ({
      value: r,
      label: t(`identity.roles.${r}`),
      hint: t(`identity.roles.${r}Hint`),
    }))}
    selected={values.roles}
    error={errorFor(errors, 'roles')}
  />
  <ChoiceGroup
    id="lang"
    name="lang"
    type="radio"
    legend={t('identity.profile.lang')}
    options={LANGS.map((l) => ({ value: l, label: t(`lang.${l}`), lang: l }))}
    selected={[values.lang]}
    error={errorFor(errors, 'lang')}
    required
  />
  <SelectField
    id="timezone"
    name="timezone"
    label={t('identity.profile.timezone')}
    hint={t('identity.profile.timezoneHint')}
    value={values.timezone}
    options={data.timezones.map((zone) => ({ value: zone, label: zone }))}
    error={errorFor(errors, 'timezone')}
    required
  />
  <button class="th-btn th-btn--primary" type="submit">{t('identity.profile.save')}</button>
</form>

<section class="th-documents" aria-labelledby="documents-title">
  <h2 id="documents-title">{t('identity.documents.heading')}</h2>
  <ul>
    {#each data.me.registration.documents as doc (doc.id)}
      {#if doc.accepted}
        <li>
          {t('identity.documents.accepted', {
            title: title(doc.id),
            version: doc.accepted.version,
            date: date(doc.accepted.at),
          })}
          <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
          <a href={doc.url[data.lang]} target="_blank" rel="noopener noreferrer"
            >{t('identity.documents.read', { title: title(doc.id) })}<span class="sr-only">
              ({t('form.newTab')})</span
            ></a
          >
        </li>
      {/if}
    {/each}
  </ul>
</section>
