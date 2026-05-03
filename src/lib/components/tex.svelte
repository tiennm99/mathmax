<script>
  import katex from 'katex';

  /**
   * @type {{
   *   math: string;
   *   display?: boolean;
   *   ariaLabel?: string;
   * }}
   */
  let { math, display = false, ariaLabel } = $props();

  const html = $derived(
    katex.renderToString(math, {
      displayMode: display,
      throwOnError: false,
      output: 'htmlAndMathml',
    })
  );
</script>

{#if ariaLabel}
  <span aria-label={ariaLabel}>{@html html}</span>
{:else}
  {@html html}
{/if}
