# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for React.

## Installation

`npm install @blossom-carousel/react`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/react-nextjs)

#### React

```jsx
import { BlossomCarousel } from "@blossom-carousel/react";
import "@blossom-carousel/core/style.css";

function App() {
  return <BlossomCarousel>{/* slides */}</BlossomCarousel>;
}
```

#### Next.js

Add the import to your page or component:

```jsx
import { BlossomCarousel } from "@blossom-carousel/react";
import "@blossom-carousel/core/style.css";

export default function Page() {
  return <BlossomCarousel>{/* slides */}</BlossomCarousel>;
}
```

## Usage

```jsx
<BlossomCarousel>
  {Array.from({ length: 12 }, (_, i) => (
    <div>{i}</div>
  ))}
</BlossomCarousel>
```

### as

Define the HTMLElement of the carousel root.

```jsx
<BlossomCarousel as="ul">
  {Array.from({ length: 12 }, (_, i) => (
    <div>{i}</div>
  ))}
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
const blossomRef = useRef(null);
blossomRef.current.prev({ align: "center" });
blossomRef.current.next({ align: "center" });
```

## Navigation

Add prev/next buttons and pagination dots with the `BlossomPrev`, `BlossomNext` and `BlossomDots` components. They connect to the carousel through its `id`, so they can be placed anywhere in your markup. Mark each slide with the `data-blossom-slide` attribute so the dots know what to paginate.

```jsx
import {
  BlossomCarousel,
  BlossomPrev,
  BlossomNext,
  BlossomDots,
} from "@blossom-carousel/react";
import "@blossom-carousel/react/style.css"; // default dot styles

function App() {
  return (
    <>
      <BlossomCarousel id="my-carousel">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} data-blossom-slide>
            {i + 1}
          </div>
        ))}
      </BlossomCarousel>
      <BlossomPrev for="my-carousel" />
      <BlossomDots for="my-carousel" />
      <BlossomNext for="my-carousel" />
    </>
  );
}
```

The controls work without any JavaScript wiring: the buttons are disabled automatically at the edges, and the active dot follows the scroll position — even when the user scrolls or drags natively.

### Custom button content

`BlossomPrev` and `BlossomNext` render their children inside the button:

```jsx
<BlossomPrev for="my-carousel">←</BlossomPrev>
<BlossomNext for="my-carousel">→</BlossomNext>
```

### Custom dot content

`BlossomDots` accepts a render function with the dot `index` and its `active` state:

```jsx
<BlossomDots for="my-carousel">
  {({ index, active }) => <span>{active ? "●" : index + 1}</span>}
</BlossomDots>
```

### Styling the dots

The default dot styles have zero specificity, so any rule of your own (e.g. `.blossom-dot { ... }`) overrides them. You can also theme them with custom properties on the dots component or any ancestor:

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
