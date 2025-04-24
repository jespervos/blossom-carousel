# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Vue.

## Installation

`npm install @blossom-carousel/vue`

#### Vue

```javascript
import { BlossomCarousel } from "@blossom-carousel/vue";
import "@blossom-carousel/vue/style.css";

const app = createApp({});
app.component("BlossomCarousel", BlossomCarousel);
```

#### Nuxt

Install globally `plugins/blossom-carousel.client.js`

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

#### as

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

## Examples

[Simple](https://www.blossom-carousel.com/examples/simple)
[Variable widths](https://www.blossom-carousel.com/examples/variable-widths)
[CSS Grid](https://www.blossom-carousel.com/examples/css-grid)
[Multiple rows](https://www.blossom-carousel.com/examples/multiple-rows)
[Snapping](https://www.blossom-carousel.com/examples/snapping)
[Grouping](https://www.blossom-carousel.com/examples/grouping)
[Sticky](https://www.blossom-carousel.com/examples/sticky)
[Coverflow](https://www.blossom-carousel.com/examples/coverflow)
[Hover](https://www.blossom-carousel.com/examples/hover)
