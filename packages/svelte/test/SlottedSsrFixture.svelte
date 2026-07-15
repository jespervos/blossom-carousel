<script lang="ts">
  import BlossomCarousel from "../src/BlossomCarousel.svelte";
  import BlossomDots from "../src/BlossomDots.svelte";
  import BlossomDot from "../src/BlossomDot.svelte";
</script>

<BlossomCarousel id="my-carousel">
  <ul>
    {#each Array.from({ length: 3 }, (_, i) => i + 1) as num (num)}
      <li data-blossom-slide>{num}</li>
    {/each}
  </ul>
</BlossomCarousel>
<BlossomDots forId="my-carousel">
  {#snippet children({ index, active })}
    <BlossomDot class="my-dot" aria-label="Photo {index + 1}" data-active={active}>
      {index + 1}
    </BlossomDot>
  {/snippet}
</BlossomDots>
