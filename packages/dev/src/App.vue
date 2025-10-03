<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";
import "../../core/src/style.css";

const blossom = ref(null);
const currentSlideIndex = ref(0);
// const slides = ref([]);
// function onOverScroll(event) {
//   event.preventDefault();
//   const offset = event.detail.left / blossom.value?.el.clientWidth;
//   slides.value.forEach((el, i) => {
//     const rotate = -70 * offset * Math.min(i + 1, slides.value.length + 1 - i);
//     const translateX = event.detail.left;
//     const translateZ =
//       i === 0
//         ? 100 * offset
//         : -100 * offset * Math.min(i, slides.value.length - i);
//     const scale =
//       i === 0 || i === slides.value.length - 1
//         ? 1 + 0.2 * offset
//         : 1 - 0.2 * offset * Math.min(i, slides.value.length - i);
//     el.style.transform = `translateX(${translateX}px) rotateY(${rotate}deg)  translateZ(${translateZ}px) scale(${scale})`;
//   });
// }
// onMounted(() => {
//   blossom.value?.el?.addEventListener("overscroll", onOverScroll);
// });
// onBeforeUnmount(() => {
//   blossom.value?.el?.removeEventListener("overscroll", onOverScroll);
// });
function add() {
  const slide = document.createElement("li");
  slide.className = "slide";
  slide.innerHTML = `<p>${Math.floor(Math.random() * 100)}</p>`;
  blossom.value?.el?.appendChild(slide);
}

function remove() {
  const slides = blossom.value?.el?.querySelectorAll(".slide");
  if (slides.length > 0) {
    blossom.value?.el?.removeChild(slides[slides.length - 1]);
  }
}

const prev = () => {
  blossom.value?.prev();
};

const next = () => {
  blossom.value?.next();
};

const handleIndexChange = (index) => {
	currentSlideIndex.value = index;
};
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <p>Current Slide: {{ currentSlideIndex + 1 }}</p>
    <div class="wrapper">
      <BlossomCarousel ref="blossom" class="carousel" as="ul" :on-index-change="handleIndexChange">
        <li v-for="i in 12" ref="slides" :key="`slide${i}`" class="slide">
          <p>{{ i }}</p>
        </li>
      </BlossomCarousel>
    </div>
    <div class="controls">
      <button @click="add">add slide</button>
      <button @click="remove">remove slide</button>
    </div>
    <div class="controls">
      <button @click="prev">prev slide</button>
      <button @click="next">next slide</button>
    </div>
  </div>
</template>

<style>
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
	scroll-padding: 1rem;

  padding-block: 4rem;
  margin-block: -4rem;

  /* display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 300px;
  grid-gap: 1rem; */
}

.slide {
  width: 300px;
  margin-right: 1rem;
  aspect-ratio: 3/4;
  background-color: #404040;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* scroll-snap-align: start; */
  /* border: 1px solid red; */

	&:nth-child(2n+1) {
    scroll-snap-align: start;
		background-color: #606060;
  }
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
