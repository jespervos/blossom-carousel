# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for React.

## Installation

`npm install @blossom-carousel/react`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/react-nextjs)

#### React

```jsx
import { BlossomCarousel } from "@blossom-carousel/react";
import "@blossom-carousel/react/style.css";

function App() {
  return <BlossomCarousel>{/* slides */}</BlossomCarousel>;
}
```

#### Next.js

Add the import to your page or component:

```jsx
import { BlossomCarousel } from "@blossom-carousel/react";
import "@blossom-carousel/react/style.css";

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

### Navigation controls

`BlossomPrev`, `BlossomNext`, and `BlossomDots` wire up prev/next and dot navigation using the native Invoker Commands API. They work without a Blossom ref — give the carousel an `id`, mark slides with `data-blossom-slide`, and point controls at that id with the `for` prop.

```jsx
<BlossomCarousel id="my-carousel">
  <ul>
    {Array.from({ length: 12 }, (_, i) => (
      <li key={i} data-blossom-slide>
        Slide {i + 1}
      </li>
    ))}
  </ul>
</BlossomCarousel>

<div className="controls">
  <BlossomPrev for="my-carousel" />
  <BlossomDots for="my-carousel" />
  <BlossomNext for="my-carousel" />
</div>
```

```jsx
import {
  BlossomCarousel,
  BlossomPrev,
  BlossomNext,
  BlossomDots,
} from "@blossom-carousel/react";
```

`BlossomPrev` and `BlossomNext` disable automatically at the start and end of the scroll range. Pass children to replace the button label.

`BlossomDots` renders one button per marked slide. Pass a render function to customize dot appearance:

```jsx
<BlossomDots for="my-carousel">
  {({ index, active }) => <span className={active ? "active" : ""}>{index + 1}</span>}
</BlossomDots>
```

Dot defaults can be themed with CSS custom properties on the component or any ancestor:

`--blossom-dots-gap`, `--blossom-dot-size`, `--blossom-dot-radius`, `--blossom-dot-color`, `--blossom-dot-opacity`, `--blossom-dot-hover-opacity`, `--blossom-dot-active-opacity`

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
