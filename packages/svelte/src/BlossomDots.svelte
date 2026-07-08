<script lang="ts">
  import type { Snippet } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation.js";

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

<div class="blossom-dots" role="group" aria-label="Choose slide to display">
  {#each Array.from({ length: $nav.count }, (_, index) => index) as index (index)}
    <button
      type="button"
      class="blossom-dot"
      command="{COMMANDS.gotoPrefix}{index}"
      commandfor={forId}
      aria-current={$nav.activeIndex === index}
      aria-label="Go to slide {index + 1}"
    >
      {@render children?.({ index, active: $nav.activeIndex === index })}
    </button>
  {/each}
</div>
