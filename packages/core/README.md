# Blossom Core

A native-scroll-first carousel for the web.

## Installation

Add the blossom-carousel package to your project.

```bash
npm install @blossom-carousel/core
```

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
  "(hover: hover) and (pointer: fine)"
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

- [React](https://www.npmjs.com/package/@blossom-carousel/react)
- [Vue](https://www.npmjs.com/package/@blossom-carousel/vue)
- [Svelte](https://www.npmjs.com/package/@blossom-carousel/svelte)
- [Web Component](https://www.npmjs.com/package/@blossom-carousel/web)

## Examples

- [Simple](https://www.blossom-carousel.com/docs/examples#simple)
- [Variable widths](https://www.blossom-carousel.com/docs/examples#variable-widths)
- [CSS Grid](https://www.blossom-carousel.com/docs/examples#css-grid)
- [Multiple rows](https://www.blossom-carousel.com/docs/examples#multiple-rows)
- [Snapping](https://www.blossom-carousel.com/docs/examples#snapping)
- [Grouping](https://www.blossom-carousel.com/docs/examples#grouping)
- [Sticky](https://www.blossom-carousel.com/docs/examples#sticky)
- [Coverflow](https://www.blossom-carousel.com/docs/examples#cover-flow)
