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
  type="button"
  command={COMMANDS.next}
  commandfor={forId}
  disabled={!$state.canNext}
  aria-label="Next"
>
  <slot>Next</slot>
</button>
