<script lang="ts">
  import { getContext } from "svelte";

  const count = getContext<number>("slide-count");
</script>

{#each Array.from({ length: count }, (_, i) => i) as i (i)}
  <li data-blossom-slide>{i + 1}</li>
{/each}
