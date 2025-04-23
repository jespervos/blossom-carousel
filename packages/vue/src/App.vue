<script setup>
import BlossomCarousel from "./BlossomCarousel.vue";
</script>

<template>
  <div class="page">
    <h1>Blossom in Vue</h1>
    <BlossomCarousel class="carousel" is="ul">
      <li v-for="i in 12" :key="`slide${i}`" class="slide">
        {{ i }}
      </li>
    </BlossomCarousel>
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
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 300px;
  gap: 1rem;
  padding-inline: 1rem;
  scroll-padding-inline: 1rem;
  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;

  padding-block: 4rem;
  margin-block: -4rem;
}

.slide {
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 1rem;
  background-color: #404040;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: center;
}
</style>
