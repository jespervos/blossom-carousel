# Blossom Svelte

A native-scroll-first carousel for Svelte.

## Installation

`npm install @blossom-carousel/svelte`

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

## Examples

- [Simple](https://www.blossom-carousel.com/examples/simple)
- [Variable widths](https://www.blossom-carousel.com/examples/variable-widths)
- [CSS Grid](https://www.blossom-carousel.com/examples/css-grid)
- [Multiple rows](https://www.blossom-carousel.com/examples/multiple-rows)
- [Snapping](https://www.blossom-carousel.com/examples/snapping)
- [Grouping](https://www.blossom-carousel.com/examples/grouping)
- [Sticky](https://www.blossom-carousel.com/examples/sticky)
- [Coverflow](https://www.blossom-carousel.com/examples/coverflow)
- [Hover](https://www.blossom-carousel.com/examples/hover)
