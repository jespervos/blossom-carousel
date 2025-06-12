<script>
  import { onMount, onDestroy } from 'svelte';
  import { Blossom } from '@blossom-carousel/core';

  export let as = 'div';
  // export let repeat = false;
  let repeat = false;
  let root;
  let blossom;

  onMount(() => {
    blossom = Blossom(root, { repeat });
    blossom.init();
  });

  onDestroy(() => {
    blossom?.destroy();
  });
</script>

<svelte:element
  this={as}
  bind:this={root}
  blossom-carousel="true"
  {...$$restProps}
>
  <slot />
</svelte:element>
