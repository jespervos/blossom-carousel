<script setup>
import { ref } from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";
import "../../core/src/style.css";

const blossom = ref(null);
const currentSlideIndex = ref(0);

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

const handleChange = ({detail}) => {
	const index = detail.index;
	currentSlideIndex.value = index;
};
</script>

<template>
  <div class="page">
    <h1>Blossom Dev</h1>
    <p>Current Slide: {{ currentSlideIndex + 1 }}</p>
    <div class="wrapper">
			<BlossomCarousel ref="blossom" class="blossom" as="ul" @change="handleChange">
				<li v-for="i in 12" ref="slides" :key="`slide${i}`" class="slide">
					<a href="https://www.google.com" target="_blank">
						<p>{{ i }}</p>
					</a>
				</li>
			</BlossomCarousel>
      <!-- <BlossomCarousel ref="blossom" class="blossom" as="ul" :on-index-change="handleIndexChange" repeat>
        <li v-for="i in 12" ref="slides" :key="`slide${i}`" class="slide">
					<a href="https://www.google.com" target="_blank">
          	<p>{{ i }}</p>
					</a>
        </li>
      </BlossomCarousel> -->
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
	overflow: clip;
}

.blossom {
  /* padding-inline: 1rem; */
  /* scroll-padding-inline: 1rem; */

	/* scroll-padding-inline: 50% !important;
  padding-inline: 50% !important; */

	/* scroll-padding-inline: 20% !important; */
  padding-inline: 50% !important;

  scroll-snap-type: x mandatory;
  scroll-snap-stop: always;
	padding-inline: 0;

	/* padding-inline: 3rem; */

	display: flex;
	gap: 1rem;
}

.slide {
	flex-shrink: 0;
  width: 300px;
  aspect-ratio: 3/4;
  background-color: #404040;
  border-radius: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;

	@media (max-width: 767px) {
		scroll-snap-align: center;
		background-color: #606060;
  }

	@media (min-width: 768px) {
		&:nth-child(2n+1) {
			scroll-snap-align: center;
			background-color: #606060;
		}
	}

	a {
		width: 100%;
		height: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
}

/* .blossom {
  perspective: 1000px;
}

.slide {
  transform-style: preserve-3d;
  container-type: scroll-state;

	animation: carousel linear both;
	animation-timeline: view(x);
	animation-range: cover;
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
