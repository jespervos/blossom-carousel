<script>
  import { onMount, onDestroy } from 'svelte';

  export let as = 'div';
  export let load = 'conditional'; // 'always' or 'conditional'
  export let repeat = false;
  
  let root;
  let blossom;

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

  export function prev(options) {
    blossom?.prev(options);
  }

  export function next(options) {
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
