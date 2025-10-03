<script setup>
import { ref } from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";
import "@blossom-carousel/core/style.css";

const carousel = ref(null);
</script>

<template>
  <div class="page">
    <h1>Blossom Vue</h1>
    <div class="buttons">
      <button @click="carousel?.prev()">Prev</button>
      <button @click="carousel?.next()">Next</button>
    </div>
    <BlossomCarousel ref="carousel" class="carousel">
      <ul class="track">
        <li v-for="i in 12" :key="`slide${i}`" class="slide">
          {{ i }}
        </li>
      </ul>
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
}

.track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 300px;
  grid-gap: 1rem;
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
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #404040;
  background-color: #303030;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #404040;
}
</style>
