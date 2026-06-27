<script lang="ts">
  import { onMount } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigation } from "./navigation";

  // `for` is a reserved word, so the prop is exported under an alias.
  let forId: string;
  export { forId as for };

  const command = COMMANDS.next;
  const { state, attach, detach } = createNavigation();

  let mounted = false;
  onMount(() => {
    mounted = true;
    return detach;
  });

  $: if (mounted) attach(forId);
</script>

<button
  blossom-next
  type="button"
  {command}
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
