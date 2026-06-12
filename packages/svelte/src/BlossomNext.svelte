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
  type="button"
  {command}
  commandfor={forId}
  disabled={!$state.canNext}
  aria-label="Next"
>
  <slot>Next</slot>
</button>
