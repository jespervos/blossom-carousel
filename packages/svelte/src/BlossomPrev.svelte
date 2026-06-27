<script lang="ts">
  import { onDestroy } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigationStore } from "./navigation";

  export let forId: string;

  const state = createNavigationStore();
  $: state.connect(forId);
  onDestroy(() => state.disconnect());
</script>

<button
  blossom-prev
  type="button"
  command={COMMANDS.prev}
  commandfor={forId}
  disabled={!$state.canPrev}
  aria-controls={forId}
  aria-label="Previous slide"
>
  <slot>‹</slot>
</button>

<style>
  :where([blossom-prev]) {
    touch-action: manipulation;
  }
</style>
