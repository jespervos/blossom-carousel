<script setup>
import BlossomCarousel from "./BlossomCarousel.vue";
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <BlossomCarousel class="carousel" as="ul">
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
  padding-inline: 1rem;
  scroll-padding-inline: 1rem;
  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;

  padding-block: 4rem;
  margin-block: -4rem;

  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 300px;
  grid-gap: 1rem;
}

.slide {
  /* width: 300px; */
  aspect-ratio: 3/4;
  border-radius: 1rem;
  background-color: #404040;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* margin-right: 1rem; */
  scroll-snap-align: center;
}
</style>
