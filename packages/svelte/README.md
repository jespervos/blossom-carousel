# Blossom Svelte

A native-scroll-first carousel for Svelte.

## Installation

`npm install @blossom-carousel/svelte`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/svelte-sveltekit)

#### Svelte

```javascript
import { BlossomCarousel } from "@blossom-carousel/svelte";
import "@blossom-carousel/svelte/style.css";
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

### Navigation controls

`BlossomPrev`, `BlossomNext`, and `BlossomDots` wire up prev/next and dot navigation using the native Invoker Commands API. They work without a Blossom instance ref — give the carousel an `id`, mark slides with `data-blossom-slide`, and point controls at that id with the `forId` prop.

```html
<BlossomCarousel id="my-carousel">
  <ul>
    {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
      <li data-blossom-slide>{num}</li>
    {/each}
  </ul>
</BlossomCarousel>

<div class="controls">
  <BlossomPrev forId="my-carousel" />
  <BlossomDots forId="my-carousel" />
  <BlossomNext forId="my-carousel" />
</div>
```

```javascript
import {
  BlossomCarousel,
  BlossomPrev,
  BlossomNext,
  BlossomDots,
} from "@blossom-carousel/svelte";
```

`BlossomPrev` and `BlossomNext` disable automatically at the start and end of the scroll range. Use the default slot to replace the button label.

`BlossomDots` renders one button per marked slide. Use the default slot to customize dot appearance:

```html
<BlossomDots forId="my-carousel" let:index let:active>
  <span class:active>{index + 1}</span>
</BlossomDots>
```

Dot defaults can be themed with CSS custom properties on the component or any ancestor:

`--blossom-dots-gap`, `--blossom-dot-size`, `--blossom-dot-radius`, `--blossom-dot-color`, `--blossom-dot-opacity`, `--blossom-dot-hover-opacity`, `--blossom-dot-active-opacity`

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
