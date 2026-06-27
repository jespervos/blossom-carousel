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
  blossom-next
  type="button"
  command={COMMANDS.next}
  commandfor={forId}
  disabled={!$state.canNext}
  aria-controls={forId}
  aria-label="Next slide"
>
  <slot>›</slot>
</button>

<style>
  :where([blossom-next]) {
    touch-action: manipulation;
  }
</style>
