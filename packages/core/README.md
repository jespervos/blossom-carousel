# Blossom Core

A native-scroll-first carousel for the web.

## Installation

Add the blossom-carousel package to your project.

```bash
npm install @blossom-carousel/core
```

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/core)

Then, create a Blossom instance and initialize it.

```js
import { Blossom } from "@blossom-carousel/core";
import "@blossom-carousel/core/style.css";

const element = document.querySelector("#my-carousel-element");
// prepare the Blossom carousel
const blossom = Blossom(element);
// initialize whenever you want
blossom.init();
```

## Lazy loading

Load Blossom only when needed.

```js
const hasMouse = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

// We don't need Blossom's engine on touch devices
if (!hasMouse) return;

const { Blossom } = await import("@blossom-carousel/core");

const element = document.querySelector("#my-carousel-element");
const blossom = Blossom(element);
blossom.init();
```

### Methods

Slide to the previous or next element.
use the `align` option to control the alignment of the target element. allowed values are `"start" | "center" | "end"`

> ⚠ when scroll-snap is active, the css scroll-snap-align value will be used and the align option will be ignored.

```js
blossom.prev({ align: "center" });
blossom.next({ align: "center" });
```

### Destroy

Destroy the Blossom instance when you no longer need it to free up resources.

```js
blossom.destroy();
```

### Get started in your favorite framework:

- [React](https://www.blossom-carousel.com/docs/framework-guides/react-nextjs)
- [Vue](https://www.blossom-carousel.com/docs/framework-guides/vue-nuxt)
- [Svelte](https://www.blossom-carousel.com/docs/framework-guides/svelte-sveltekit)
- [Web Component](https://www.blossom-carousel.com/docs/framework-guides/web-components)

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
