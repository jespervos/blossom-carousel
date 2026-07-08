<script lang="ts">
  import { setContext } from "svelte";
  import BlossomCarousel from "../src/BlossomCarousel.svelte";
  import BlossomDots from "../src/BlossomDots.svelte";
  import ContextSlides from "./ContextSlides.svelte";

  setContext("slide-count", 3);
</script>

<BlossomCarousel id="ctx-carousel">
  <ul>
    <ContextSlides />
  </ul>
</BlossomCarousel>
<BlossomDots forId="ctx-carousel" />
