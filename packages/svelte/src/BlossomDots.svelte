<script lang="ts">
  import type { Snippet } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation.js";
  import DotScope from "./DotScope.svelte";

  interface Props {
    forId: string;
    children?: Snippet<[{ index: number; active: boolean }]>;
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

<div data-blossom-dots role="group" aria-label="Choose slide to display">
  {#if children}
    {#each Array.from({ length: $nav.count }, (_, index) => index) as index (index)}
      <DotScope
        {index}
        active={$nav.activeIndex === index}
        {forId}
        {children}
      />
    {/each}
  {:else}
    {#each Array.from({ length: $nav.count }, (_, index) => index) as index (index)}
      <button
        type="button"
        data-blossom-dot
        command="{COMMANDS.gotoPrefix}{index}"
        commandfor={forId}
        aria-controls={forId}
        aria-current={$nav.activeIndex === index}
        aria-label="Go to slide {index + 1}"
      >
        <span data-blossom-dot-marker></span>
      </button>
    {/each}
  {/if}
</div>
