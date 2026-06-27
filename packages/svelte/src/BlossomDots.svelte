<script lang="ts">
  import { onDestroy } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation";

  export let forId: string;

  const state = createNavigationStore();
  $: state.connect(forId);
  onDestroy(() => state.disconnect());
</script>

<div class="blossom-dots" role="group" aria-label="Choose slide to display">
  {#each Array.from({ length: $state.count }, (_, index) => index) as index (index)}
    <button
      type="button"
      class="blossom-dot"
      command="{COMMANDS.gotoPrefix}{index}"
      commandfor={forId}
      aria-current={$state.activeIndex === index}
      aria-label="Go to slide {index + 1}"
    >
      <slot {index} active={$state.activeIndex === index} />
    </button>
  {/each}
</div>
