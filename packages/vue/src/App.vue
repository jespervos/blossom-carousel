<script setup>
import BlossomCarousel from "./BlossomCarousel.vue";
import BlossomPrev from "./BlossomPrev.vue";
import BlossomNext from "./BlossomNext.vue";
import BlossomDots from "./BlossomDots.vue";
import "@blossom-carousel/core/style.css";
</script>

<template>
  <div class="page">
    <h1>Blossom Vue</h1>
    <BlossomCarousel id="my-carousel" class="carousel">
      <ul class="track">
        <li v-for="i in 12" :key="`slide${i}`" class="slide" data-blossom-slide>
          {{ i }}
        </li>
      </ul>
    </BlossomCarousel>
    <div class="controls">
      <BlossomPrev for="my-carousel" />
      <BlossomDots for="my-carousel" />
      <BlossomNext for="my-carousel" />
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.carousel {
  scroll-padding-inline: 1rem;
  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;

  padding-block: 4rem;
  margin-block: -4rem;
}

.track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 300px;
  grid-gap: 1rem;
  padding-inline: 30vw;
  width: fit-content;
}

.slide {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 1rem;
  background-color: #404040;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: center;

  &:nth-child(odd) {
    aspect-ratio: auto;
    grid-column: span 2;
  }
}

.controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-block-start: 1.5rem;
}
</style>
