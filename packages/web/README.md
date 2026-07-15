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

`<blossom-prev>`, `<blossom-next>`, and `<blossom-dots>` automatically wire up prev/next and dot navigation using the native Invoker Commands API. Give the carousel an `id`, mark slides with `data-blossom-slide`, and point controls at that id with the `for` attribute.

```html
<blossom-carousel id="my-carousel">
  <div data-blossom-slide>Slide 1</div>
  <div data-blossom-slide>Slide 2</div>
  <div data-blossom-slide>Slide 3</div>
</blossom-carousel>

<blossom-prev for="my-carousel"></blossom-prev>
<blossom-dots for="my-carousel"></blossom-dots>
<blossom-next for="my-carousel"></blossom-next>
```

#### Prev/Next Buttons
`<blossom-prev>` and `<blossom-next>` are aware of configured scroll-snap and will navigate between snap points. When no scroll-snap is configured, they will slide the carousel proportionally.

Set text content on the element to replace the default button icon.

```html
<blossom-prev for="my-carousel">Previous</blossom-prev>
```

#### Dots
`<blossom-dots>` renders one button per slide marked with `data-blossom-slide`.
Default styles can be themed with CSS custom properties on the element or any ancestor:

```css
/* defaults */
--blossom-dot-size: 0.625rem;
--blossom-dot-radius: 50%;
--blossom-dot-color: currentColor;
--blossom-dot-opacity: 0.35;
--blossom-dot-hover-opacity: 0.6;
--blossom-dot-active-opacity: 1;
```

To bring your own dots, provide a `<blossom-dot>` child — it is cloned for each slide and its inner `<button>` receives navigation attributes automatically.

```html
<blossom-dots for="my-carousel">
  <blossom-dot class="my-dot">
    <button type="button" aria-label="Custom label">•</button>
  </blossom-dot>
</blossom-dots>
```

Or let `blossom-dot` create the button from its light-DOM children:

```html
<blossom-dots for="my-carousel">
  <blossom-dot class="my-dot">•</blossom-dot>
</blossom-dots>
```

The prototype `<blossom-dot>` stays hidden; clones are rendered in the dots container. Existing `aria-label` and other attributes on your button are preserved. Since it's a single cloned template, every dot gets identical content — fine for a single active/inactive look, but not for content that varies per slide (e.g. per-slide thumbnails).

For that, set `renderDot` on the `blossom-dots` element — a callback invoked once per slide with `(index, active, forId)`. It takes priority over any `<blossom-dot>` prototype and returns the element to render; navigation attributes are merged onto its `<button>` automatically:

```html
<blossom-dots for="my-carousel" id="dots"></blossom-dots>

<script type="module">
  document.getElementById("dots").renderDot = (index, active) => {
    const button = document.createElement("button");
    button.setAttribute("data-blossom-dot", "");
    button.className = "dot";
    button.dataset.active = String(active);
    button.innerHTML = `<img src="/thumbs/${index}.jpg" alt="Slide ${index + 1}">`;
    return button;
  };
</script>
```

#### Listening for commands
Listen for `command` events on the carousel to know when any navigation control is triggered:
- previous (`--blossom-prev`)
- next (`--blossom-next`)
- dot (`--blossom-goto-{index}`).

These events are not fired by drag or free scrolling. Read `event.command` (or `event.detail.command` where the Invoker Commands polyfill applies).

```html
<blossom-carousel id="my-carousel">
  <div data-blossom-slide>Slide 1</div>
  <div data-blossom-slide>Slide 2</div>
  <div data-blossom-slide>Slide 3</div>
</blossom-carousel>

<script>
  document.getElementById("my-carousel").addEventListener("command", (event) => {
    const command = event?.command || event?.detail?.command;
  });
</script>
```

## Overscroll API

Tap into Blossom's drag engine's overscroll behavior to create your own style.

```html
<blossom-carousel id="my-carousel">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</blossom-carousel>

<script>
  document.getElementById("my-carousel").addEventListener("overscroll", (event) => {
    event.preventDefault();
    const overScroll = event.detail.left;

    Array.from(event.currentTarget.children).forEach((slide) => {
      slide.style.transform = `scale(${1 - overScroll * 0.1})`;
    });
  });
</script>
```

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
