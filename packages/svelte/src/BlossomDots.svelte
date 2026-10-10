<script lang="ts">
  import type { Snippet } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation.js";
  import DotScope from "./DotScope.svelte";

  interface Props {
    forId: string;
    behavior?: ScrollBehavior;
    children?: Snippet<[{ index: number; active: boolean }]>;
    [key: string]: unknown;
  }

  let { forId, behavior, children, ...rest }: Props = $props();

  // Seeds the initial (SSR/pre-mount) count once; the $effect below reacts
  // to later `forId` changes via `nav.connect()`.
  // svelte-ignore state_referenced_locally
  const nav = createNavigationStore(forId);

  $effect(() => {
    nav.connect(forId);
    return () => nav.disconnect();
  });
</script>

<div
  data-blossom-dots
  role="group"
  aria-label="Choose slide to display"
  {...rest}
>
  {#if children}
    {#each Array.from({ length: $nav.count }, (_, index) => index) as index (index)}
      <DotScope
        {index}
        active={$nav.activeIndex === index}
        {forId}
        {behavior}
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
        data-blossom-behavior={behavior}
        aria-current={$nav.activeIndex === index}
        aria-label="Go to slide {index + 1}"
      >
        <span data-blossom-dot-marker></span>
      </button>
    {/each}
  {/if}
</div>
