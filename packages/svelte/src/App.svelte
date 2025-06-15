<script>
  import BlossomCarousel from './BlossomCarousel.svelte';
</script>

<div class="page">
    <h1>Blossom in Svelte</h1>  
    <BlossomCarousel as="ul" class="carousel">
        {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
            <li class="slide">{num}</li>
        {/each}
    </BlossomCarousel>
</div>