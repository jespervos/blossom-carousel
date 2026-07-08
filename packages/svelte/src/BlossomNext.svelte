<script lang="ts">
  import type { Snippet } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation.js";

  interface Props {
    forId: string;
    children?: Snippet;
  }

  let { forId, children }: Props = $props();

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
  blossom-next
  type="button"
  command={COMMANDS.next}
  commandfor={forId}
  disabled={!$nav.canNext}
  aria-controls={forId}
  aria-label="Next slide"
>
  {#if children}
    {@render children()}
  {:else}
    ›
  {/if}
</button>

<style>
  :where([blossom-next]) {
    touch-action: manipulation;
  }
</style>
