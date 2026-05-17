<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";
import "../../core/src/style.css";

const blossom = ref<InstanceType<typeof BlossomCarousel> | null>(null);
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
//   if (!blossom.value) return null;

//   const carousel = blossom.value.$el;
//   const slides = carousel.children;
//   const carouselRect = carousel.getBoundingClientRect();
//   const carouselLeft = carouselRect.left;

//   let closestSlide = null;
//   let closestDistance = Infinity;

//   for (let i = 0; i < slides.length; i++) {
//     const slide = slides[i];
//     const slideRect = slide.getBoundingClientRect();
//     const distance = Math.abs(slideRect.left - carouselLeft);

//     if (distance < closestDistance) {
//       closestDistance = distance;
//       closestSlide = { element: slide, index: i };
//     }
//   }

//   return closestSlide;
// };
// const prev = () => {
//   const currentSlide = getCurrentSlide();
//   if (!currentSlide || !blossom.value) return;

//   const carousel = blossom.value.$el;
//   const slides = carousel.children;
//   const prevIndex = currentSlide.index - 1;

//   if (prevIndex >= 0) {
//     const prevSlide = slides[prevIndex];
//     prevSlide.scrollIntoView({
//       behavior: "smooth",
//       block: "nearest",
//       inline: "start",
//     });
//   }
// };
// const next = () => {
//   const currentSlide = getCurrentSlide();
//   if (!currentSlide || !blossom.value) return;

//   const carousel = blossom.value.$el;
//   const slides = carousel.children;
//   const nextIndex = currentSlide.index + 1;

//   if (nextIndex < slides.length) {
//     const nextSlide = slides[nextIndex];
//     nextSlide.scrollIntoView({
//       behavior: "smooth",
//       block: "nearest",
//       inline: "start",
//     });
//   }
// };

const isLocked = ref(false);
function toggleScrollLock() {
  if (!blossom.value?.el) return;

  isLocked.value = !isLocked.value;
  blossom.value.el.style.overflow = isLocked.value ? "hidden" : "auto";
}
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <div class="wrapper">
      <BlossomCarousel ref="blossom" class="carousel" as="ul">
        <li
          v-for="i in 24"
          ref="slides"
          :key="`slide${i}`"
          class="slide"
          :snapped="snappedSlide == i"
          :snapping="snappingSlide == i"
        >
          <div class="card">
            <p>{{ i }}</p>
          </div>
        </li>
      </BlossomCarousel>
    </div>
    <!-- <div class="controls">
      <button @click="add">add slide</button>
      <button @click="remove">remove slide</button>
    </div> -->
    <div class="controls">
      <button @click="blossom.prev">prev slide</button>
      <button @click="blossom.next">next slide</button>
      <button @click="toggleScrollLock">scroll lock</button>
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

.carousel {
  --card-width: 12rem;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 100%;
  scroll-snap-type: x mandatory;
  width: calc(var(--card-width) * 3);
  padding-inline: var(--card-width) !important;
}

.slide {
  width: 100%;
  aspect-ratio: 3 / 4;
  position: sticky;
  left: calc(var(--card-width) * -1);
  right: calc(var(--card-width) * -1);

  scroll-snap-align: center;
  scroll-snap-stop: always;

  view-timeline: --cards inline;
  animation: stack-cards linear both;
  animation-timeline: --cards;
  animation-range: contain;

  & .card {
    width: 100%;
    height: 100%;
    background-color: #404040;
    border-radius: 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    animation: rotate-cards linear both;
    animation-timeline: --cards;
    animation-range: contain;
    animation-range: contain -50% contain 150%;
  }
}

@keyframes stack-cards {
  0% {
    z-index: calc(100 - sibling-index());
  }
  40% {
    z-index: 1000;
  }
  100% {
    z-index: sibling-index();
  }
}

@keyframes rotate-cards {
  0% {
    transform: translateX(-80%) rotate(10deg) scale(0.8);
  }
  25% {
    transform: translateX(-90%) rotate(5deg) scale(0.9);
  }
  50% {
    transform: translateX(0%) rotate(0deg) scale(1);
  }
  60% {
    transform: translateX(-20%) rotate(-15deg) scale(0.6);
  }
  75% {
    transform: translateX(90%) rotate(-5deg) scale(0.9);
  }
  100% {
    transform: translateX(80%) rotate(-10deg) scale(0.8);
  }
}
</style>
