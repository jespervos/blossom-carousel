<script>
  import BlossomCarousel from "./BlossomCarousel.svelte";
  import BlossomPrev from "./BlossomPrev.svelte";
  import BlossomNext from "./BlossomNext.svelte";
  import BlossomDots from "./BlossomDots.svelte";
</script>

<div class="page">
  <h1>Blossom in Svelte</h1>
  <BlossomCarousel id="my-carousel" as="ul" class="carousel">
    {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
      <li class="slide" data-blossom-slide>{num}</li>
    {/each}
  </BlossomCarousel>
  <div class="controls">
    <BlossomPrev forId="my-carousel" />
    <BlossomDots forId="my-carousel" />
    <BlossomNext forId="my-carousel" />
  </div>
</div>
