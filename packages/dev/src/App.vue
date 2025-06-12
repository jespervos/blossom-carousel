<script setup>
import BlossomCarousel from "./BlossomCarousel.vue";
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <div class="wrapper">
      <BlossomCarousel class="carousel" as="ul">
        <li v-for="i in 12" :key="`slide${i}`" class="slide">
          <p>{{ i }}</p>
        </li>
      </BlossomCarousel>
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

/* .wrapper {
  max-width: 1000px;
} */

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
  aspect-ratio: 3/4;
  scroll-snap-align: center;
}

/* .carousel {
  perspective: 1000px;
}

.slide {
  transform-style: preserve-3d;
  container-type: scroll-state;

  &:not(:first-child) {
    margin-left: -30px;
  }

  > p {
    width: 100%;
    height: 100%;
    border-radius: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #404040;
    transform-style: preserve-3d;
    animation: carousel linear both;
    animation-timeline: view(x);
    animation-range: cover;
  }
}

@keyframes carousel {
  0% {
    transform: rotateY(-70deg) translateZ(-100px) scale(0.75);
  }
  50% {
    transform: none;
  }
  to {
    transform: rotateY(70deg) translateZ(-100px) scale(0.75);
  }
} */
</style>
