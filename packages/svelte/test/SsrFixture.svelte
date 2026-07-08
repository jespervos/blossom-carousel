<script lang="ts">
  import BlossomCarousel from "../src/BlossomCarousel.svelte";
  import BlossomDots from "../src/BlossomDots.svelte";
</script>

<BlossomCarousel id="my-carousel">
  <ul>
    {#each Array.from({ length: 4 }, (_, i) => i + 1) as num (num)}
      <li data-blossom-slide>{num}</li>
    {/each}
  </ul>
</BlossomCarousel>
<BlossomDots forId="my-carousel" />
