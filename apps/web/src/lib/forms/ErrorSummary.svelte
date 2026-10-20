<!-- Récapitulatif des erreurs d'un formulaire, annoncé et focalisé à l'affichage ; chaque erreur mène à son champ. -->
<script lang="ts">
  interface Props {
    title: string;
    errors: { field: string; message: string }[];
  }

  let { title, errors }: Props = $props();
  let box: HTMLElement | undefined = $state();

  $effect(() => {
    if (errors.length) box?.focus();
  });
</script>

{#if errors.length}
  <div
    class="th-error-summary"
    role="alert"
    tabindex="-1"
    bind:this={box}
    aria-labelledby="error-summary-title"
  >
    <h2 id="error-summary-title">{title}</h2>
    <ul>
      {#each errors as error (error.field)}
        <!-- Lien vers un champ de la même page. -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <li><a href="#{error.field}">{error.message}</a></li>
      {/each}
    </ul>
  </div>
{/if}
