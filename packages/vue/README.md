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

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
