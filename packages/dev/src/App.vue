<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";

const blossom = ref(null);
const slides = ref([]);
function onOverScroll(event) {
  event.preventDefault();
  const offset = event.detail.left / blossom.value?.el.clientWidth;
  slides.value.forEach((el, i) => {
    const rotate = -70 * offset * Math.min(i + 1, slides.value.length + 1 - i);
    const translateX = event.detail.left;
    const translateZ =
      i === 0
        ? 100 * offset
        : -100 * offset * Math.min(i, slides.value.length - i);
    const scale =
      i === 0 || i === slides.value.length - 1
        ? 1 + 0.2 * offset
        : 1 - 0.2 * offset * Math.min(i, slides.value.length - i);
    el.style.transform = `translateX(${translateX}px) rotateY(${rotate}deg)  translateZ(${translateZ}px) scale(${scale})`;
  });
}
onMounted(() => {
  blossom.value?.el?.addEventListener("overscroll", onOverScroll);
});
onBeforeUnmount(() => {
  blossom.value?.el?.removeEventListener("overscroll", onOverScroll);
});

function onClick(offset) {
  blossom.value?.el.scrollBy({ left: offset, behavior: "smooth" });
}
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <div class="wrapper">
      <BlossomCarousel ref="blossom" class="carousel" as="ul">
        <li v-for="i in 12" ref="slides" :key="`slide${i}`" class="slide">
          <p>{{ i }}</p>
        </li>
      </BlossomCarousel>
    </div>
    <div class="controls">
      <button @click="onClick(400)">prev</button>
      <button @click="onClick(800)">next</button>
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

.wrapper {
  /* max-width: 1000px; */
}

.carousel {
  /* padding-inline: 10rem; */
  /* scroll-padding-inline: 10rem; */
  /* padding-inline: 1rem; */
  /* scroll-padding-inline: 1rem; */
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
  background-color: #404040;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* border: 1px solid red; */
}

/* .carousel {
  perspective: 1000px;
}

.slide {
  transform-style: preserve-3d;
  container-type: scroll-state;

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
    transform: rotateY(-70deg) translateZ(-100px) scale(0.8);
  }
  50% {
    transform: none;
  }
  to {
    transform: rotateY(70deg) translateZ(-100px) scale(0.8);
  }
} */
</style>
