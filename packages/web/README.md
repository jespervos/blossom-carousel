# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Web.

## Installation

`npm install @blossom-carousel/web`

```javascript
import { BlossomCarousel } from "@blossom-carousel/web";
import "@blossom-carousel/core/style.css";
```

#### CDN

```html
<script src="https://unpkg.com/@blossom-carousel/web@latest/dist/blossom-carousel-web.umd.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/@blossom-carousel/web@latest/dist/web.css"
/>
```

## Usage

```html
<blossom-carousel>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
  ...
</blossom-carousel>
```

### Methods

Slide to the previous or next element.
use the `align` option to control the alignment of the target element. allowed values are `"start" | "center" | "end"`

> ⚠ when scroll-snap is active, the css scroll-snap-align value will be used and the align option will be ignored.

```js
const carousel = document.getElementById("carousel");
carousel.prev({ align: "center" });
carousel.next({ align: "center" });
```

## Examples

- [Simple](https://www.blossom-carousel.com/docs/examples#simple)
- [Variable widths](https://www.blossom-carousel.com/docs/examples#variable-widths)
- [CSS Grid](https://www.blossom-carousel.com/docs/examples#css-grid)
- [Multiple rows](https://www.blossom-carousel.com/docs/examples#multiple-rows)
- [Snapping](https://www.blossom-carousel.com/docs/examples#snapping)
- [Grouping](https://www.blossom-carousel.com/docs/examples#grouping)
- [Sticky](https://www.blossom-carousel.com/docs/examples#sticky)
- [Coverflow](https://www.blossom-carousel.com/docs/examples#cover-flow)
