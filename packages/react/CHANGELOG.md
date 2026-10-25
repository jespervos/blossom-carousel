# Changelog

All notable changes to `@blossom-carousel/react` are documented in this file.

## 1.7.1 (2026-10-25)

### Fixed

- The published ESM and CommonJS bundles use `react/jsx-runtime` instead of `jsxDEV` from `react/jsx-dev-runtime`. The 1.7.0 bundles failed to render with production React (#44).

## 1.7.0 (2026-10-18)

### Added

- Exported `useBlossomNavigation` so custom React controls can read `canPrev`, `canNext`, `activeIndex`, and `count`. The `NavigationState` type was already exported.

### Changed

- `BlossomCarousel` registers its navigation commands in a layout effect instead of an effect. A parent's `useLayoutEffect` can now call `goTo(index, { behavior: "instant" })` to position the carousel before the first paint.
- `useBlossomNavigation` skips re-renders while scrolling when `activeIndex`, `count`, `canPrev`, and `canNext` have not changed.

## 1.6.1 (2026-10-18)

### Fixed

- Pointed the TypeScript `types` export at `dist/index.d.ts` so consumers resolve declarations after the 1.6.0 bundle layout change (#37).

## 1.6.0 (2026-10-10)

### Added

- Added `goTo(index, options?)` on the carousel ref. It scrolls to the slide at a zero-based index, counting elements marked with `data-blossom-slide`.
- Added a `behavior` prop (`"smooth"`, `"instant"`, or `"auto"`) on `BlossomPrev`, `BlossomNext`, `BlossomDots`, and `BlossomDot`. Scrolling stays smooth when the prop is omitted. On `BlossomDots` it applies to every dot; a `BlossomDot` can override it.
- `prev` and `next` accept `{ behavior }`.
- Programmatic navigation uses native scrolling, so `prev`, `next`, and `goTo` work on touch devices where the drag engine is not loaded.
- Calling `prev`, `next`, or `goTo` dispatches the same `command` event as the matching navigation control.

### Changed

- `prev` and `next` scroll with native snapping. Alignment follows each slide's CSS `scroll-snap-align` (or pages the scrollport when nothing snaps). `{ behavior }` controls the animation, and `"smooth"` is the default.

## 1.5.2 (2026-07-24)

### Changed

- Updated `@blossom-carousel/core` dependency to `^1.1.8`.

## 1.5.1 (2026-07-15)

### Fixed

- Forward HTML attributes (e.g. `className`) from `BlossomDots` to its root element.

## 1.5.0 (2026-07-15)

### Added

- Added `BlossomDot` for fully custom dot buttons with navigation and accessibility attributes wired automatically.
- Added custom dot rendering on `BlossomDots` via a `children` render prop — return a `<BlossomDot>` to replace the default marker and control markup per slide.

### Changed

- **Breaking:** Default dot styling hooks moved from `.blossom-dots` / `.blossom-dot` classes to `data-blossom-dots`, `data-blossom-dot`, and `data-blossom-dot-marker` attributes; update selectors when overriding default dot styles.
- **Breaking:** A `children` render prop on `BlossomDots` now replaces the entire default dot button — render `<BlossomDot>` explicitly instead of injecting content into the built-in marker.
- Default dots now render a `<span data-blossom-dot-marker>` inside the button so custom dot content and themed markers can coexist; dot sizing and opacity custom properties target the marker.

## 1.4.0 (2026-07-08)

### Added

- Added SSR dot seeding: `BlossomCarousel` counts marked slides during render and stores the total in a per-id registry, so a sibling `BlossomDots` renders the correct number of dots on the server and avoids flashing an empty list during hydration.

## 1.3.2 (2026-06-27)

### Changed

- Added default `aria-controls` to Previous and Next navigation controls.
- Added default `aria-current` behavior for dot navigation controls based on active slide state.
- Added default `touch-action: manipulation` on navigation buttons to prevent double-tap zoom on touch devices.
- Updated navigation control styles to use zero-specificity defaults (`:where(...)`) so consumers can override styles more easily.

## 1.3.0 (2026-06-17)

### Added

- Added navigation controls (`BlossomPrev`, `BlossomNext`, `BlossomDots`).
- Added framework examples and documentation updates for navigation controls.

### Changed

- Normalized RTL navigation geometry and optimized scroll reads in the navigation hot path.

## 1.1.1 (2026-04-20)

### Added

- Added lazy loading support with a `load` prop (`"always"` | `"conditional"`), dynamically importing `@blossom-carousel/core` only on pointer-capable devices by default.
