<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Blossom } from '@blossom-carousel/core';

  export let as: string = 'div';
  export let load: 'always' | 'conditional' = 'conditional';
  export let repeat: boolean = false;
  
  let root: HTMLElement;
  let blossom: ReturnType<typeof Blossom> | undefined;

  onMount(async () => {
    if (root) {
      const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      // don't load if the user has no mouse.
      // overwritten by props.load: 'always'
      if (!hasMouse && load !== "always") return;

      const { Blossom } = await import("@blossom-carousel/core");

      blossom = Blossom(root, { repeat });
      blossom.init();
    }
  });

  onDestroy(() => {
    blossom?.destroy();
  });

  export function prev(options?: { align?: string }) {
    blossom?.prev(options);
  }

  export function next(options?: { align?: string }) {
    blossom?.next(options);
  }
</script>

<svelte:element
  this={as}
  bind:this={root}
  blossom-carousel="true"
  {...$$restProps}
>
  <slot />
</svelte:element>
