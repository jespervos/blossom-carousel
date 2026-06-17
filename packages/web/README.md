# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Web.

## Installation

`npm install @blossom-carousel/web`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/web-components)

```javascript
import "@blossom-carousel/web";
import "@blossom-carousel/web/style.css";
```

#### CDN

```html
<script src="https://unpkg.com/@blossom-carousel/web@latest/dist/blossom-carousel-web.umd.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/@blossom-carousel/web@latest/dist/blossom-carousel-web.css"
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

### Navigation controls

`blossom-prev`, `blossom-next`, and `blossom-dots` wire up prev/next and dot navigation using the native Invoker Commands API. They work without calling carousel methods — give the carousel an `id`, mark slides with `data-blossom-slide`, and point controls at that id with the `for` attribute.

```html
<blossom-carousel id="my-carousel">
  <div data-blossom-slide>Slide 1</div>
  <div data-blossom-slide>Slide 2</div>
  <div data-blossom-slide>Slide 3</div>
</blossom-carousel>

<div class="controls">
  <blossom-prev for="my-carousel"></blossom-prev>
  <blossom-dots for="my-carousel"></blossom-dots>
  <blossom-next for="my-carousel"></blossom-next>
</div>
```

`blossom-prev` and `blossom-next` disable automatically at the start and end of the scroll range. Set text content on the element to replace the default button label.

`blossom-dots` renders one button per marked slide.

Dot defaults can be themed with CSS custom properties on the element or any ancestor:

`--blossom-dots-gap`, `--blossom-dot-size`, `--blossom-dot-radius`, `--blossom-dot-color`, `--blossom-dot-opacity`, `--blossom-dot-hover-opacity`, `--blossom-dot-active-opacity`

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
