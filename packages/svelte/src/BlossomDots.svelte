<script lang="ts">
  import { onMount } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { createNavigation } from "./navigation";
  import "./dots.css";

  // `for` is a reserved word, so the prop is exported under an alias.
  let forId: string;
  export { forId as for };

  const gotoPrefix = COMMANDS.gotoPrefix;
  const { state, attach, detach } = createNavigation();

  let mounted = false;
  onMount(() => {
    mounted = true;
    return detach;
  });

  $: if (mounted) attach(forId);
</script>

<div class="blossom-dots" role="group" aria-label="Choose slide to display">
  {#each Array($state.count) as _, i (i)}
    <button
      type="button"
      class="blossom-dot"
      command={`${gotoPrefix}${i}`}
      commandfor={forId}
      aria-current={$state.activeIndex === i ? "true" : undefined}
      aria-label={`Go to slide ${i + 1}`}
    >
      <slot index={i} active={$state.activeIndex === i} />
    </button>
  {/each}
</div>
