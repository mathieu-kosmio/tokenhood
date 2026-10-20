<!-- Champ texte étiqueté : aide et erreur reliées par aria-describedby, état invalide annoncé. -->
<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface Props {
    id: string;
    name: string;
    label: string;
    value?: string;
    hint?: string | undefined;
    error?: string | undefined;
    required?: boolean;
    autocomplete?: HTMLInputAttributes['autocomplete'];
    maxlength?: number | undefined;
  }

  let {
    id,
    name,
    label,
    value = '',
    hint,
    error,
    required = false,
    autocomplete,
    maxlength,
  }: Props = $props();
  const describedBy = $derived(
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
  );
</script>

<div class="kos-champ" data-invalide={error ? '' : undefined}>
  <label for={id}>{label}</label>
  {#if hint}<p class="kos-champ__aide" id="{id}-hint">{hint}</p>{/if}
  {#if error}<p class="kos-champ__erreur" id="{id}-error">{error}</p>{/if}
  <input
    {id}
    {name}
    type="text"
    {value}
    {required}
    {autocomplete}
    {maxlength}
    aria-describedby={describedBy}
    aria-invalid={error ? 'true' : undefined}
  />
</div>
