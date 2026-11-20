<script lang="ts">
  import BlossomCarousel from "../src/BlossomCarousel.svelte";

  let { initialRepeat = false, load = "conditional" }: { initialRepeat?: boolean; load?: "always" | "conditional" } = $props();
  // svelte-ignore state_referenced_locally
  let repeat = $state(initialRepeat);
  let ids = $state(Array.from({ length: 12 }, (_, i) => i));

  export function update(next: { repeat?: boolean; ids?: number[] }) {
    if (next.repeat !== undefined) repeat = next.repeat;
    if (next.ids) ids = next.ids;
  }
</script>

<BlossomCarousel {repeat} {load}>
  {#each ids as i (i)}<div class="slide" data-i={i}>{i + 1}</div>{/each}
</BlossomCarousel>
