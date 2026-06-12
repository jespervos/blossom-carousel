# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Vue.

## Installation

`npm install @blossom-carousel/vue`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/vue-nuxt)

#### Vue

```javascript
import { BlossomCarousel } from "@blossom-carousel/vue";
import "@blossom-carousel/core/style.css";

const app = createApp({});
app.component("BlossomCarousel", BlossomCarousel);
```

#### Nuxt

Install globally `plugins/blossom-carousel.js`

```javascript
import { BlossomCarousel } from "@blossom-carousel/vue";
import "@blossom-carousel/core/style.css";

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

### Methods

Slide to the previous or next element.
use the `align` option to control the alignment of the target element. allowed values are `"start" | "center" | "end"`

> ⚠ when scroll-snap is active, the css scroll-snap-align value will be used and the align option will be ignored.

```js
const blossomRef = ref(null);
blossomRef.value.prev({ align: "center" });
blossomRef.value.next({ align: "center" });
```

## Navigation

Add prev/next buttons and pagination dots with the `BlossomPrev`, `BlossomNext` and `BlossomDots` components. They connect to the carousel through its `id`, so they can be placed anywhere in your markup. Mark each slide with the `data-blossom-slide` attribute so the dots know what to paginate.

```javascript
import {
  BlossomCarousel,
  BlossomPrev,
  BlossomNext,
  BlossomDots,
} from "@blossom-carousel/vue";
import "@blossom-carousel/vue/style.css"; // default dot styles
```

```html
<BlossomCarousel id="my-carousel">
  <div v-for="i in 12" data-blossom-slide>Slide {{ i }}</div>
</BlossomCarousel>
<BlossomPrev for="my-carousel" />
<BlossomDots for="my-carousel" />
<BlossomNext for="my-carousel" />
```

The controls work without any JavaScript wiring: the buttons are disabled automatically at the edges, and the active dot follows the scroll position — even when the user scrolls or drags natively.

### Custom button content

`BlossomPrev` and `BlossomNext` render their slot content inside the button:

```html
<BlossomPrev for="my-carousel">←</BlossomPrev>
<BlossomNext for="my-carousel">→</BlossomNext>
```

### Custom dot content

`BlossomDots` exposes the dot `index` and its `active` state through slot props:

```html
<BlossomDots for="my-carousel" v-slot="{ index, active }">
  <span>{{ active ? "●" : index + 1 }}</span>
</BlossomDots>
```

### Styling the dots

The default dot styles have zero specificity, so any rule of your own (e.g. `.blossom-dot { ... }`) overrides them. You can also theme them with custom properties on the dots component or any ancestor:

```css
.blossom-dots {
  --blossom-dots-gap: 0.5rem;
  --blossom-dot-size: 0.625rem;
  --blossom-dot-radius: 50%;
  --blossom-dot-color: currentColor;
  --blossom-dot-opacity: 0.35;
  --blossom-dot-hover-opacity: 0.6;
  --blossom-dot-active-opacity: 1;
}
```

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
