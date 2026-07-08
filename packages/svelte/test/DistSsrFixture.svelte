<script lang="ts">
  import { BlossomCarousel, BlossomDots } from "../dist/index.js";
</script>

<BlossomCarousel id="dist-carousel">
  <ul>
    {#each Array.from({ length: 4 }, (_, i) => i + 1) as num (num)}
      <li data-blossom-slide>{num}</li>
    {/each}
  </ul>
</BlossomCarousel>
<BlossomDots forId="dist-carousel" />
