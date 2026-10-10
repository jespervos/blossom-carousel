# Changelog

All notable changes to `@blossom-carousel/web` are documented in this file.

## 2.0.0 (2026-10-10)

### Added

- Added `goTo(index, options?)` on `<blossom-carousel>`. It scrolls to the slide at a zero-based index, counting elements marked with `data-blossom-slide`.
- Added a `behavior` attribute (`"smooth"`, `"instant"`, or `"auto"`) on `<blossom-prev>`, `<blossom-next>`, `<blossom-dots>`, and `<blossom-dot>`. Scrolling stays smooth when the attribute is omitted. On `<blossom-dots>` it applies to every dot; a `<blossom-dot>` prototype can override it.
- `prev` and `next` accept `{ behavior }`.
- Calling `prev`, `next`, or `goTo` dispatches the same `command` event as the matching navigation control.

### Changed

- **Breaking:** `prev` and `next` no longer accept `{ align }` or scroll through the drag engine. Alignment follows each slide's CSS `scroll-snap-align` (or pages the scrollport when nothing snaps). Pass `{ behavior: "smooth" | "instant" | "auto" }` to control the animation. `"smooth"` is the default.

## 1.5.1 (2026-09-07)

### Fixed

- Pointed the TypeScript `types` export at `dist/index.d.ts` so consumers resolve declarations after the 1.5.0 bundle layout change.

## 1.5.0 (2026-09-02)

### Added

- `<blossom-next>` and `<blossom-prev>` keep author-provided HTML such as SVG icons instead of flattening children to text.

### Fixed

- Empty or whitespace-only content still falls back to the default `Next` / `Previous` labels.
- Reconnecting the custom elements reuses the existing inner button instead of nesting another one.

## 1.4.2 (2026-07-28)

### Fixed

- Improved SSR compatibility by making custom-element modules safe to import in non-browser runtimes.
- Guarded `customElements.define(...)` calls to avoid duplicate registrations.

## 1.4.1 (2026-07-24)

### Changed

- Updated build-time `@blossom-carousel/core` dependency to `^1.1.8`.

## 1.4.0 (2026-07-15)

### Added

- Added `<blossom-dot>` custom element as a hidden prototype cloned into `<blossom-dots>` for uniform custom markup across all dots.
- Added `renderDot` property on `<blossom-dots>` — a callback `(index, active, forId)` for per-slide dot content (e.g. thumbnails); takes priority over the `<blossom-dot>` prototype.

### Changed

- **Breaking:** Default dot styling hooks moved from `.blossom-dots` / `.blossom-dot` classes to `data-blossom-dots`, `data-blossom-dot`, and `data-blossom-dot-marker` attributes; update selectors when overriding default dot styles.
- Default dots now render a `<span data-blossom-dot-marker>` inside the button so custom dot content and themed markers can coexist; dot sizing and opacity custom properties target the marker.

## 1.3.2 (2026-06-27)

### Changed

- Added default `aria-controls` to Previous and Next navigation controls.
- Added default `aria-current` behavior for dot navigation controls based on active slide state.
- Added default `touch-action: manipulation` on navigation buttons to prevent double-tap zoom on touch devices.
- Updated navigation control styles to use zero-specificity defaults (`:where(...)`) so consumers can override styles more easily.

## 1.3.0 (2026-06-17)

### Added

- Added native navigation controls (`BlossomPrev`, `BlossomNext`, `BlossomDots`).
- Added framework examples and documentation updates for navigation controls.

### Changed

- Normalized RTL navigation geometry and optimized scroll reads in the navigation hot path.
