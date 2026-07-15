# Blossom Carousel

A native-scroll-first carousel enhanced with drag support for Svelte.

## Installation

`npm install @blossom-carousel/svelte`

[Full installation instructions](https://www.blossom-carousel.com/docs/framework-guides/svelte-sveltekit)

> **v2** requires Svelte 5 (runes + snippets) and drops Svelte 4 support. This is also what enables `BlossomDots`, `BlossomPrev`, and `BlossomNext` to server-render correctly in SvelteKit — see [Navigation controls](#navigation-controls). If you're on Svelte 4, stay on `@blossom-carousel/svelte@1`.

#### Svelte

```javascript
import { BlossomCarousel } from "@blossom-carousel/svelte";
import "@blossom-carousel/svelte/style.css";
```

#### SvelteKit

Add the import to your page or layout:

```javascript
import { BlossomCarousel } from "@blossom-carousel/svelte";
import "@blossom-carousel/svelte/style.css";
```

## Usage

```html
<BlossomCarousel>
  {#each Array(12).fill(0).map((_, i) => i + 1) as num}
    <div>{num}</div>
  {/each}
</BlossomCarousel>
```

### as

Define the HTMLElement of the carousel root.

```html
<BlossomCarousel as="ul">
  {#each Array(12).fill(0).map((_, i) => i + 1) as num}
    <li>{num}</li>
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

Place previous, next, and dot controls outside the carousel with `<BlossomPrev>`, `<BlossomNext>`, and `<BlossomDots>`. Link them to the carousel with an `id` on `<BlossomCarousel>`, and a matching `forId` prop on each control and mark slides with `data-blossom-slide`.

```html
<BlossomCarousel id="my-carousel">
  {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
    <div data-blossom-slide>Slide {num}</div>
  {/each}
</BlossomCarousel>

<BlossomPrev forId="my-carousel" />
<BlossomDots forId="my-carousel" />
<BlossomNext forId="my-carousel" />
```

#### Prev/Next Buttons
`<BlossomPrev>` and `<BlossomNext>` are aware of configured scroll-snap and will navigate between snap points. When no scroll-snap is configured, they will slide the carousel proportionally.

Pass children to replace the default button icon.

```html
<BlossomPrev forId="my-carousel">
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

To bring your own dots, pass a `children` snippet and render `<BlossomDot>` inside it. This will configure the dot as a `<button>` with navigation wired up.
Now you can style the dot as you please and attach any button attributes you need.

> **SSR notes**
>
> - Place navigation components *after* their carousel in the markup (as in the example above). During server rendering they read the slide count that the carousel registers when it renders, so controls rendered before the carousel start at zero dots and fill in on the client.
> - When the children of the carousel perform asynchronous work (`await` with SvelteKit's experimental async SSR), the slide count can't be derived on the server; dots then render empty and seed on the client instead.

```html
<BlossomDots forId="my-carousel">
  {#snippet children({ index, active })}
    <BlossomDot
      class="my-dot"
      data-active={active}
      aria-label="Photo {index + 1}"
    >
      {index + 1}
    </BlossomDot>
  {/snippet}
</BlossomDots>
```

#### Listening for commands
Listen for `command` events on the carousel to know when any navigation control is triggered:
- previous (`--blossom-prev`)
- next (`--blossom-next`)
- dot (`--blossom-goto-{index}`).

These events are not fired by drag or free scrolling. Read `event.command` (or `event.detail.command` where the Invoker Commands polyfill applies).

```html
<BlossomCarousel oncommand={handleCommand}>
  {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
    <div data-blossom-slide>Slide {num}</div>
  {/each}
</BlossomCarousel>

<script>
  function handleCommand(event) {
    const command = event?.command || event?.detail?.command;
  }
</script>
```

## Overscroll API

Tap into Blossom's drag engine's overscroll behavior to create your own style.

```html
<BlossomCarousel
  onoverscroll={(event) => {
    event.preventDefault();
    const overScroll = event.detail.left;

    Array.from(event.currentTarget.children).forEach((slide) => {
      slide.style.transform = `scale(${1 - overScroll * 0.1})`;
    });
  }}
>
  {#each Array(12).fill(0).map((_, i) => i + 1) as num (num)}
    <div>Slide {num}</div>
  {/each}
</BlossomCarousel>
```

## Examples

Explore ready-to-copy carousel patterns grouped by complexity.

[See all examples](https://www.blossom-carousel.com/docs/examples/)
