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
<script src="https://unpkg.com/@blossom-carousel/web@1/dist/blossom-carousel-web.umd.js"></script>
<link
  rel="stylesheet"
  href="https://unpkg.com/@blossom-carousel/web@1/dist/blossom-carousel-web.css"
/>
```

Pin the major version (`@1`) so a future major release can't change the page without you opting in.

## Usage

```html
<blossom-carousel>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
  ...
</blossom-carousel>
```

### repeat (experimental)

Loops the carousel infinitely. Turn it on with the `repeat` attribute (add or remove it at any time):

```html
<blossom-carousel repeat>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
  ...
</blossom-carousel>
```

It is provided by a small add-on that is bundled with this package and works on the carousel element itself, so it also loops on touch devices, where the drag engine is not loaded. The slides stay in place in the middle of a long scroll range, with copies of them around it; whenever the scroll comes to rest, the view is moved by whole loops back onto the real slides, which looks the same. Known limits:

- Horizontal carousels only, and only when the slides together are wider than the carousel; otherwise it stays a plain strip.
- The slides must sit side by side as direct children of the carousel, in a layout where a box before them pushes them along: inline blocks (the default), flex, or a grid with auto-sized columns (`grid-auto-columns: max-content`). A grid with fixed column sizes (`grid-auto-columns: 300px`) also stays a plain strip.
- Copies are look-alikes: hidden from assistive technology, not focusable, without `id`s or `name`s, and outside any form. A click on a copy is forwarded to the same element in its slide; other events (hover, input) are not.
- Changes to the slides (added, removed, reordered, new content or size) reach the copies when the scroll comes to rest.
- The carousel gets extra boxes around the slides: `:nth-child(odd/even)` still matches the same slides, other structural selectors (`:first-child`, `:nth-child(3n)`) do not, and `scrollLeft` / `scrollWidth` are large values.

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

Set text or HTML (for example an SVG icon) on the element to replace the default button label. Empty or whitespace-only content still falls back to `Previous` / `Next`.

```html
<blossom-prev for="my-carousel">Previous</blossom-prev>
<blossom-next for="my-carousel">
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4l8 8-8 8" /></svg>
</blossom-next>
```

The inner button is named "Previous slide" or "Next slide" by default. Set `aria-label` on the element to use a more specific name; it's moved onto the inner button. An `aria-label` on your own `<button>` child takes precedence.

```html
<blossom-prev for="my-carousel" aria-label="Previous products"></blossom-prev>
<blossom-next for="my-carousel" aria-label="Next products"></blossom-next>
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

#### Scroll behavior
Every navigation control scrolls smoothly by default. Set the `behavior` attribute to `"instant"` or `"auto"` to change that. On `<blossom-dots>` it applies to every dot; a `<blossom-dot>` prototype can override it.

```html
<blossom-prev for="my-carousel" behavior="instant"></blossom-prev>
<blossom-dots for="my-carousel" behavior="instant"></blossom-dots>
<blossom-next for="my-carousel" behavior="instant"></blossom-next>
```

The attribute is copied to the inner button as `data-blossom-behavior`. If your own button already has a `data-blossom-behavior` attribute, it takes precedence.

#### Listening for commands
Listen for `command` events on the carousel to know when any navigation control is triggered or a [method](#methods) is called:
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

## Methods

Call these on the `<blossom-carousel>` element to navigate from your own code:

- `prev(options?)` scrolls to the previous snap point or page.
- `next(options?)` scrolls to the next snap point or page.
- `goTo(index, options?)` scrolls to the slide at a zero-based `index`, counting slides marked with `data-blossom-slide`.

`options.behavior` accepts `"smooth"` (default), `"instant"` or `"auto"`.

```html
<blossom-carousel id="my-carousel">
  <div data-blossom-slide>Slide 1</div>
  <div data-blossom-slide>Slide 2</div>
  <div data-blossom-slide>Slide 3</div>
</blossom-carousel>

<button id="back">Back to start</button>

<script>
  const carousel = document.getElementById("my-carousel");
  document.getElementById("back").addEventListener("click", () => {
    carousel.goTo(0, { behavior: "instant" });
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
