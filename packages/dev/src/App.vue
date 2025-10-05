<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";
import "../../core/src/style.css";

const blossom = ref(null);
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

const snappingSlide = ref(1);
const snappedSlide = ref(1);

function onScroll(e) {
  const targetIndex =
    e?.detail?.snapTargetInline?.firstChild?.textContent ||
    e?.snapTargetInline?.firstChild?.textContent;

  if (targetIndex) {
    if (e.type === "scrollsnapchange") {
      snappedSlide.value = Number(targetIndex);
    } else if (e.type === "scrollsnapchanging") {
      snappingSlide.value = Number(targetIndex);
    }
  }
}
onMounted(() => {
  blossom.value?.el?.addEventListener("scrollsnapchange", onScroll);
  blossom.value?.el?.addEventListener("scrollsnapchanging", onScroll);
});
onBeforeUnmount(() => {
  blossom.value?.el?.removeEventListener("scrollsnapchange", onScroll);
  blossom.value?.el?.removeEventListener("scrollsnapchanging", onScroll);
});
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
const getCurrentSlide = () => {
  if (!blossom.value) return null;

  const carousel = blossom.value.$el;
  const slides = carousel.children;
  const carouselRect = carousel.getBoundingClientRect();
  const carouselLeft = carouselRect.left;

  let closestSlide = null;
  let closestDistance = Infinity;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideRect = slide.getBoundingClientRect();
    const distance = Math.abs(slideRect.left - carouselLeft);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestSlide = { element: slide, index: i };
    }
  }

  return closestSlide;
};
const prev = () => {
  const currentSlide = getCurrentSlide();
  if (!currentSlide || !blossom.value) return;

  const carousel = blossom.value.$el;
  const slides = carousel.children;
  const prevIndex = currentSlide.index - 1;

  if (prevIndex >= 0) {
    const prevSlide = slides[prevIndex];
    prevSlide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
};
const next = () => {
  const currentSlide = getCurrentSlide();
  if (!currentSlide || !blossom.value) return;

  const carousel = blossom.value.$el;
  const slides = carousel.children;
  const nextIndex = currentSlide.index + 1;

  if (nextIndex < slides.length) {
    const nextSlide = slides[nextIndex];
    nextSlide.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }
};
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <div class="wrapper">
      <BlossomCarousel ref="blossom" class="carousel" as="ul">
        <li
          v-for="i in 12"
          ref="slides"
          :key="`slide${i}`"
          class="slide"
          :snapped="snappedSlide == i"
          :snapping="snappingSlide == i"
        >
          <p>{{ i }}</p>
        </li>
      </BlossomCarousel>
    </div>
    <!-- <div class="controls">
      <button @click="add">add slide</button>
      <button @click="remove">remove slide</button>
    </div>
    <div class="controls">
      <button @click="prev">prev slide</button>
      <button @click="next">next slide</button>
    </div> -->
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
  padding-inline: calc(50vw - 150px) !important;
  scroll-padding-inline: calc(50vw - 150px);
  /* padding-inline: 1rem; */
  /* scroll-padding-inline: 1rem; */

  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;

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
  scroll-snap-align: center;
  background-color: #404040;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: 300ms background-color ease;

  &[snapping="true"] {
    background-color: purple;
  }
  &[snapped="true"] {
    background-color: magenta;
  }

  /* container-type: scroll-state;
  container-name: snap-container;
  position: relative;

  > * {
    position: relative;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: purple;
    border-radius: inherit;
    opacity: 0;
    transition: 300ms opacity ease;
  } */
}
/*
@container snap-container scroll-state(snapped: x) {
  .slide::after {
    opacity: 1;
  }
} */

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
