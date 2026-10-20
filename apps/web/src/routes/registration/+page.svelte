<script lang="ts">
  import { LANGS, translator } from '@tokenhood/i18n';
  import { ChoiceGroup, ErrorSummary, SelectField, TextField, errorFor } from '#lib/forms/index.js';
  import { DISPLAY_NAME_MAX, ROLES, type DocumentId } from '#lib/identity.js';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();
  const t = $derived(translator(data.lang));
  const values = $derived(
    form?.values ?? {
      display_name: data.me.display_name,
      roles: data.me.roles as string[],
      lang: data.me.lang as string,
      timezone: data.me.timezone ?? data.defaultTimezone,
    },
  );
  const checked = $derived(form?.documents ?? []);
  const errors = $derived(form?.errors ?? []);
  const title = (id: DocumentId) => t(`identity.documents.${id}`);
  const date = (iso: string) =>
    new Intl.DateTimeFormat(data.lang, { dateStyle: 'long', timeZone: data.me.timezone ?? 'UTC' }).format(
      new Date(iso),
    );
</script>

<svelte:head>
  <title>{t('identity.registration.title')} · {t('app.name')}</title>
</svelte:head>

<section class="th-wrap th-page" aria-labelledby="registration-title">
  <div class="th-page__body">
    <p class="th-eyebrow">{t('identity.registration.eyebrow')}</p>
    <h1 id="registration-title">{t('identity.registration.title')}</h1>
    <p class="th-lead">{t('identity.registration.lead')}</p>

    <ErrorSummary title={t('form.errorSummary', { count: errors.length })} {errors} />
    {#if form?.message}
      <p class="th-alert th-alert--error" role="alert">{form.message}</p>
    {/if}

    <form method="POST" class="th-form" novalidate>
      <input type="hidden" name="submission" value={data.submission} />
      <input type="hidden" name="etag" value={data.etag ?? ''} />

      <fieldset class="th-step">
        <legend>{t('identity.registration.preferences')}</legend>
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
      </fieldset>

      <fieldset class="th-step">
        <legend>{t('identity.registration.profile')}</legend>
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
      </fieldset>

      <fieldset class="th-step">
        <legend>{t('identity.registration.documents')}</legend>
        {#each data.me.registration.documents as doc (doc.id)}
          {@const id = `document-${doc.id}`}
          {@const error = errorFor(errors, id)}
          {#if doc.current && doc.accepted}
            <p class="th-choice__hint">
              {t('identity.documents.accepted', {
                title: title(doc.id),
                version: doc.version,
                date: date(doc.accepted.at),
              })}
            </p>
          {:else}
            <div class="th-choice" data-invalide={error ? '' : undefined}>
              {#if error}<p class="kos-champ__erreur" id="{id}-error">{error}</p>{/if}
              <input
                {id}
                type="checkbox"
                name="documents"
                value={doc.id}
                checked={checked.includes(doc.id)}
                required
                aria-describedby={[`${id}-link`, error && `${id}-error`].filter(Boolean).join(' ')}
                aria-invalid={error ? 'true' : undefined}
              />
              <label for={id}
                >{t('identity.documents.accept', { title: title(doc.id), version: doc.version })}</label
              >
              <p class="th-choice__hint" id="{id}-link">
                <!-- Document publié hors de l'application. -->
                <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
                <a href={doc.url[data.lang]} target="_blank" rel="noopener noreferrer"
                  >{t('identity.documents.read', { title: title(doc.id) })}<span class="sr-only">
                    ({t('form.newTab')})</span
                  ></a
                >
              </p>
            </div>
          {/if}
        {/each}
      </fieldset>

      <button class="th-btn th-btn--primary" type="submit">{t('identity.registration.submit')}</button>
    </form>
  </div>
</section>
