# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Vue.

## Installation

`npm install @blossom-carousel/vue`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/vue-nuxt)

#### Vue

```javascript
import { BlossomCarousel } from "@blossom-carousel/vue";
import "@blossom-carousel/vue/style.css";

const app = createApp({});
app.component("BlossomCarousel", BlossomCarousel);
```

#### Nuxt

Install globally `plugins/blossom-carousel.js`

```javascript
import { BlossomCarousel } from "@blossom-carousel/vue";
import "@blossom-carousel/vue/style.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("BlossomCarousel", BlossomCarousel);
});
```

## Usage

```html
<BlossomCarousel>
  <div v-for="i in 12">Slide {{ i }}</div>
</BlossomCarousel>
```

### as

Define the HTMLElement of the carousel root.

```html
<BlossomCarousel as="ul">
  <li v-for="i in 12">Slide {{ i }}</li>
</BlossomCarousel>
```

Renders as

```html
<ul>
  <li>Slide 1</li>
  <li>Slide 2</li>
  <li>Slide 3</li>
  ...
</ul>
```

### Navigation controls

Place previous, next, and dot controls outside the carousel with `<BlossomPrev>`, `<BlossomNext>`, and `<BlossomDots>`. Link them to the carousel with an `id` on `<BlossomCarousel>`, and a matching `for` prop on each control and mark slides with `data-blossom-slide`.

```html
<BlossomCarousel id="my-carousel">
  <div v-for="i in 12" :key="i" data-blossom-slide>Slide {{ i }}</div>
</BlossomCarousel>

<BlossomPrev for="my-carousel" />
<BlossomDots for="my-carousel" />
<BlossomNext for="my-carousel" />
```

#### Prev/Next Buttons
`<BlossomPrev>` and `<BlossomNext>` are aware of configured scroll-snap and will navigate between snap points. When no scroll-snap is configured, they will slide they carousel proportionally.

Slot your own content to replace the default button icon.

```html
<BlossomPrev for="my-carousel">
  <span>Previous</span>
</BlossomPrev>
```

#### Dots
`<BlossomDots>` renders one button per slide marked with `data-blossom-slide`.
Default styles can be themed with CSS custom properties on the component or any ancestor:

```css
/* defaults */
--blossom-dot-size: 0.625rem;
--blossom-dot-radius: 50%;
--blossom-dot-color: currentColor;
--blossom-dot-opacity: 0.35;
--blossom-dot-hover-opacity: 0.6;
--blossom-dot-active-opacity: 1;
```

To bring your own dots, provide a default slot and render `<BlossomDot>` inside it. This will configure the dot as a `<button>` with navigation wired up.
Now you can style the dot as you please and attach any button attributes you need.

```html
<BlossomDots for="my-carousel" v-slot="{ index, active }">
  <BlossomDot
    class="my-dot"
    :data-active="active"
    :aria-label="`Photo ${index + 1}`"
  >
    {{ index + 1 }}
  </BlossomDot>
</BlossomDots>
```

#### Listening for commands
Listen for `command` events on the carousel to know when any navigation control is triggered:
- previous (`--blossom-prev`)
- next (`--blossom-next`)
- dot (`--blossom-goto-{index}`).

These events are not fired by drag or free scrolling. Read `event.command` (or `event.detail.command` where the Invoker Commands polyfill applies).

```html
<BlossomCarousel @command="handleCommand">
  <div v-for="i in 12" :key="i" data-blossom-slide>Slide {{ i }}</div>
</BlossomCarousel>

<script setup lang="ts">
const handleCommand = (event: CustomEvent) => {
  const command = event?.command || event?.detail?.command;
};
</script>
```



#### Global registration
Register the components alongside `BlossomCarousel`:

```javascript
import {
  BlossomCarousel,
  BlossomPrev,
  BlossomNext,
  BlossomDots,
  BlossomDot,
} from "@blossom-carousel/vue";
import "@blossom-carousel/vue/style.css";

const app = createApp({});
app.component("BlossomCarousel", BlossomCarousel);
app.component("BlossomPrev", BlossomPrev);
app.component("BlossomNext", BlossomNext);
app.component("BlossomDots", BlossomDots);
app.component("BlossomDot", BlossomDot);
```

## Overscroll API

Tap into Blossom's drag engine's overscroll behavior to create your own style.

```vue
<template>
  <!-- prevent and overwrite Blossom's default rubberbanding effect -->
  <BlossomCarousel @overscroll.prevent="onOverscroll">
    <div v-for="i in 12" :key="i">Slide {{ i }}</div>
  </BlossomCarousel>
</template>

<script setup>
function onOverscroll(event) {
  const overScroll = event.detail.left;

  Array.from(blossomCarousel.value.children).forEach((slide) => {
    slide.style.transform = `scale(${1 - overScroll * 0.1})`;
  });
}
</script>
```

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
