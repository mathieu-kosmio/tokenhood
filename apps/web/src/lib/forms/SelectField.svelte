<!-- Liste déroulante étiquetée : aide et erreur reliées par aria-describedby. -->
<script lang="ts">
  interface Props {
    id: string;
    name: string;
    label: string;
    value: string;
    options: { value: string; label: string; lang?: string }[];
    hint?: string | undefined;
    error?: string | undefined;
    required?: boolean;
  }

  let { id, name, label, value, options, hint, error, required = false }: Props = $props();
  const describedBy = $derived(
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
  );
</script>

<div class="kos-champ" data-invalide={error ? '' : undefined}>
  <label for={id}>{label}</label>
  {#if hint}<p class="kos-champ__aide" id="{id}-hint">{hint}</p>{/if}
  {#if error}<p class="kos-champ__erreur" id="{id}-error">{error}</p>{/if}
  <select {id} {name} {required} aria-describedby={describedBy} aria-invalid={error ? 'true' : undefined}>
    {#each options as option (option.value)}
      <option value={option.value} lang={option.lang} selected={option.value === value}>{option.label}</option
      >
    {/each}
  </select>
</div>
