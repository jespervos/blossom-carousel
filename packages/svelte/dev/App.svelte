<script>
  import BlossomCarousel from "../src/BlossomCarousel.svelte";
  import BlossomPrev from "../src/BlossomPrev.svelte";
  import BlossomNext from "../src/BlossomNext.svelte";
  import BlossomDots from "../src/BlossomDots.svelte";
  import BlossomDot from "../src/BlossomDot.svelte";
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
    <BlossomDots forId="my-carousel">
      {#snippet children({ index, active })}
        <BlossomDot class="dot" data-active={active}>
          <img src="https://placehold.co/40x40" alt="Image {index + 1}" />
        </BlossomDot>
      {/snippet}
    </BlossomDots>
    <BlossomNext forId="my-carousel" />
  </div>
</div>
