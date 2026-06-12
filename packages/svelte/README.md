# Blossom Svelte

A native-scroll-first carousel for Svelte.

## Installation

`npm install @blossom-carousel/svelte`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/svelte-sveltekit)

#### Svelte

```javascript
import BlossomCarousel from "@blossom-carousel/svelte";
import "@blossom-carousel/core/style.css";
```

## Usage

```html
<BlossomCarousel>
  {#each Array(12).fill(0).map((_, i) => i + 1) as num}
  <div key="{num}">{num}</div>
  {/each}
</BlossomCarousel>
```

### as

Define the HTMLElement of the carousel root.

```html
<BlossomCarousel as="ul">
  {#each Array(12).fill(0).map((_, i) => i + 1) as num}
  <li key="{num}">{num}</li>
  {/each}
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
blossomRef.prev({ align: "center" });
blossomRef.next({ align: "center" });
```

## Navigation

Add prev/next buttons and pagination dots with the `BlossomPrev`, `BlossomNext` and `BlossomDots` components. They connect to the carousel through its `id`, so they can be placed anywhere in your markup. Mark each slide with the `data-blossom-slide` attribute so the dots know what to paginate.

```svelte
<script>
  import {
    BlossomCarousel,
    BlossomPrev,
    BlossomNext,
    BlossomDots,
  } from "@blossom-carousel/svelte";
  import "@blossom-carousel/svelte/style.css";
</script>

<BlossomCarousel id="my-carousel">
  {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
    <div data-blossom-slide>{num}</div>
  {/each}
</BlossomCarousel>
<BlossomPrev for="my-carousel" />
<BlossomDots for="my-carousel" />
<BlossomNext for="my-carousel" />
```

The controls work without any JavaScript wiring: the buttons are disabled automatically at the edges, and the active dot follows the scroll position — even when the user scrolls or drags natively.

### Custom button content

`BlossomPrev` and `BlossomNext` render their slot content inside the button:

```svelte
<BlossomPrev for="my-carousel">←</BlossomPrev>
<BlossomNext for="my-carousel">→</BlossomNext>
```

### Custom dot content

`BlossomDots` exposes the dot `index` and its `active` state through slot props:

```svelte
<BlossomDots for="my-carousel" let:index let:active>
  <span>{active ? "●" : index + 1}</span>
</BlossomDots>
```

### Styling the dots

The default dot styles have zero specificity, so any rule of your own (e.g. `:global(.blossom-dot) { ... }`) overrides them. You can also theme them with custom properties on the dots component or any ancestor:

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
