# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Web.

## Installation

`npm install @blossom-carousel/web`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/web-components)

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

## Navigation

Add prev/next buttons and pagination dots with the `<blossom-prev>`, `<blossom-next>` and `<blossom-dots>` custom elements. They connect to the carousel through its `id` via the `for` attribute, so they can be placed anywhere in your markup. Mark each slide with the `data-blossom-slide` attribute so the dots know what to paginate.

```html
<blossom-carousel id="my-carousel">
  <div data-blossom-slide>Slide 1</div>
  <div data-blossom-slide>Slide 2</div>
  <div data-blossom-slide>Slide 3</div>
  ...
</blossom-carousel>

<blossom-prev for="my-carousel"></blossom-prev>
<blossom-dots for="my-carousel"></blossom-dots>
<blossom-next for="my-carousel"></blossom-next>
```

The controls work without any JavaScript wiring: the buttons are disabled automatically at the edges, and the active dot follows the scroll position — even when the user scrolls or drags natively.

### Custom button content

`<blossom-prev>` and `<blossom-next>` render their slotted content inside the button:

```html
<blossom-prev for="my-carousel">←</blossom-prev>
<blossom-next for="my-carousel">→</blossom-next>
```

### Styling the dots

The dots are themeable with custom properties, set on the element or any ancestor:

```css
blossom-dots {
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

[See all examples](http://localhost:3333/docs/examples/)
