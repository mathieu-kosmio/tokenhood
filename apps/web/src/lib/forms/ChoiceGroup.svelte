<!-- Groupe de cases à cocher ou de boutons radio : fieldset et légende, aide et erreur reliées au groupe,
     une étiquette par choix. Le premier choix porte l'identifiant visé par le récapitulatif d'erreurs. -->
<script lang="ts">
  interface Props {
    id: string;
    name: string;
    legend: string;
    type?: 'checkbox' | 'radio';
    options: { value: string; label: string; hint?: string; lang?: string }[];
    selected: string[];
    hint?: string | undefined;
    error?: string | undefined;
    required?: boolean;
  }

  let {
    id,
    name,
    legend,
    type = 'checkbox',
    options,
    selected,
    hint,
    error,
    required = false,
  }: Props = $props();
  const describedBy = $derived(
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
  );
  const inputId = (index: number) => (index === 0 ? id : `${id}-${index}`);
</script>

<fieldset class="th-choices" data-invalide={error ? '' : undefined} aria-describedby={describedBy}>
  <legend>{legend}</legend>
  {#if hint}<p class="kos-champ__aide" id="{id}-hint">{hint}</p>{/if}
  {#if error}<p class="kos-champ__erreur" id="{id}-error">{error}</p>{/if}
  {#each options as option, index (option.value)}
    <div class="th-choice">
      <input
        id={inputId(index)}
        {type}
        {name}
        value={option.value}
        checked={selected.includes(option.value)}
        required={required && type === 'radio'}
        aria-describedby={[option.hint && `${inputId(index)}-hint`, error && `${id}-error`]
          .filter(Boolean)
          .join(' ') || undefined}
        aria-invalid={error ? 'true' : undefined}
      />
      <label for={inputId(index)} lang={option.lang}>{option.label}</label>
      {#if option.hint}<p class="th-choice__hint" id="{inputId(index)}-hint">{option.hint}</p>{/if}
    </div>
  {/each}
</fieldset>
