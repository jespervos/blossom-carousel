<script lang="ts">
  import type { Snippet } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation.js";

  interface Props {
    forId: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { forId, children, ...rest }: Props = $props();

  // Seeds the initial (SSR/pre-mount) count once; the $effect below reacts
  // to later `forId` changes via `nav.connect()`.
  // svelte-ignore state_referenced_locally
  const nav = createNavigationStore(forId);

  $effect(() => {
    nav.connect(forId);
    return () => nav.disconnect();
  });
</script>

<button
  blossom-prev
  type="button"
  command={COMMANDS.prev}
  commandfor={forId}
  disabled={!$nav.canPrev}
  aria-controls={forId}
  aria-label="Previous slide"
  {...rest}
>
  {#if children}
    {@render children()}
  {:else}
    ‹
  {/if}
</button>

<style>
  :where([blossom-prev]) {
    touch-action: manipulation;
  }
</style>
