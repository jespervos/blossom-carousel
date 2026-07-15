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
    <div key={i}>Slide {i + 1}</div>
  ))}
</BlossomCarousel>
```

### as

Define the HTMLElement of the carousel root.

```jsx
<BlossomCarousel as="ul">
  {Array.from({ length: 12 }, (_, i) => (
    <li key={i}>Slide {i + 1}</li>
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

Place previous, next, and dot controls outside the carousel with `<BlossomPrev>`, `<BlossomNext>`, and `<BlossomDots>`. Link them to the carousel with an `id` on `<BlossomCarousel>`, and a matching `for` prop on each control and mark slides with `data-blossom-slide`.

```jsx
<BlossomCarousel id="my-carousel">
  {Array.from({ length: 12 }, (_, i) => (
    <div key={i} data-blossom-slide>
      Slide {i + 1}
    </div>
  ))}
</BlossomCarousel>

<BlossomPrev for="my-carousel" />
<BlossomDots for="my-carousel" />
<BlossomNext for="my-carousel" />
```

#### Prev/Next Buttons
`<BlossomPrev>` and `<BlossomNext>` are aware of configured scroll-snap and will navigate between snap points. When no scroll-snap is configured, they will slide the carousel proportionally.

Pass children to replace the default button icon.

```jsx
<BlossomPrev for="my-carousel">
  <span>Previous</span>
</BlossomPrev>
```

#### Dots
`<BlossomDots>` renders one button per slide marked with `data-blossom-slide`.
Default styles can be themed with CSS custom properties on the component or any ancestor:

```css
/* defaults */
--blossom-dot-size: 0.625rem;
--blossom-dot-radius: 50%;
--blossom-dot-color: currentColor;
--blossom-dot-opacity: 0.35;
--blossom-dot-hover-opacity: 0.6;
--blossom-dot-active-opacity: 1;
```

To bring your own dots, pass a render function and render `<BlossomDot>` inside it. This will configure the dot as a `<button>` with navigation wired up.
Now you can style the dot as you please and attach any button attributes you need.

```jsx
<BlossomDots for="my-carousel">
  {({ index, active }) => (
    <BlossomDot
      className="my-dot"
      data-active={active}
      aria-label={`Photo ${index + 1}`}
    >
      {index + 1}
    </BlossomDot>
  )}
</BlossomDots>
```

#### Listening for commands
Listen for `command` events on the carousel to know when any navigation control is triggered:
- previous (`--blossom-prev`)
- next (`--blossom-next`)
- dot (`--blossom-goto-{index}`).

These events are not fired by drag or free scrolling. Read `event.command` (or `event.detail.command` where the Invoker Commands polyfill applies).

```jsx
<BlossomCarousel onCommand={handleCommand}>
  {Array.from({ length: 12 }, (_, i) => (
    <div key={i} data-blossom-slide>
      Slide {i + 1}
    </div>
  ))}
</BlossomCarousel>

function handleCommand(event) {
  const command = event?.command || event?.detail?.command;
}
```

## Overscroll API

Tap into Blossom's drag engine's overscroll behavior to create your own style.

```jsx
<BlossomCarousel
  onOverscroll={(event) => {
    event.preventDefault();
    const overScroll = event.detail.left;

    Array.from(event.currentTarget.children).forEach((slide) => {
      slide.style.transform = `scale(${1 - overScroll * 0.1})`;
    });
  }}
>
  {Array.from({ length: 12 }, (_, i) => (
    <div key={i}>Slide {i + 1}</div>
  ))}
</BlossomCarousel>
```

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
