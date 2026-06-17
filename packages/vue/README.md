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

`BlossomPrev`, `BlossomNext`, and `BlossomDots` wire up prev/next and dot navigation using the native Invoker Commands API. They work without a Blossom instance ref — give the carousel an `id`, mark slides with `data-blossom-slide`, and point controls at that id with the `for` prop.

```html
<BlossomCarousel id="my-carousel">
  <ul>
    <li v-for="i in 12" :key="i" data-blossom-slide>Slide {{ i }}</li>
  </ul>
</BlossomCarousel>

<div class="controls">
  <BlossomPrev for="my-carousel" />
  <BlossomDots for="my-carousel" />
  <BlossomNext for="my-carousel" />
</div>
```

Register the components alongside `BlossomCarousel`:

```javascript
import {
  BlossomCarousel,
  BlossomPrev,
  BlossomNext,
  BlossomDots,
} from "@blossom-carousel/vue";

app.component("BlossomPrev", BlossomPrev);
app.component("BlossomNext", BlossomNext);
app.component("BlossomDots", BlossomDots);
```

`BlossomPrev` and `BlossomNext` disable automatically at the start and end of the scroll range. Each accepts a default slot to replace the button label.

`BlossomDots` renders one button per marked slide. Use the default slot to customize dot appearance:

```html
<BlossomDots for="my-carousel" v-slot="{ index, active }">
  <span :class="{ active }">{{ index + 1 }}</span>
</BlossomDots>
```

Dot defaults can be themed with CSS custom properties on the component or any ancestor:

`--blossom-dots-gap`, `--blossom-dot-size`, `--blossom-dot-radius`, `--blossom-dot-color`, `--blossom-dot-opacity`, `--blossom-dot-hover-opacity`, `--blossom-dot-active-opacity`

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
