# Changelog

All notable changes to Blossom Carousel will be documented in this file.

## 2026-06-27

### Improved

- Added default `aria-controls` to Previous and Next navigation controls across React, Svelte, Vue, and Web components.
- Added default `aria-current` behavior for dot navigation controls based on active slide state across React, Svelte, Vue, and Web components.
- Added default `touch-action: manipulation` on navigation buttons to prevent double-tap zoom on touch devices.
- Updated framework control styles to use zero-specificity defaults (`:where(...)`) so consumers can override styles more easily.

## 2026-06-12

### Added

- Added navigation controls (`BlossomPrev`, `BlossomNext`, `BlossomDots`) for Vue, React and Svelte, plus native Web controls.
- Added framework examples and documentation updates for navigation controls.

### Improved

- Normalized RTL navigation geometry and optimized scroll reads in the navigation package hot path.

## 2026-05-19

### Improved

- Fixed an issue where overscroll would not clamp to the carousel boundaries on non-snap carousels.

## 2026-05-17

### Improved

- Fixed an issue where elements with position: sticky would compute their sticky position as snap position instead of their real offset.

## 2026-05-03

### Added

- Added scroll-margin support

## 2026-04-10

### Added

- 📐 Added `resolveCSSLength()` utility to resolve arbitrary CSS length values (including `calc()`) to pixels.
- ⚡ Added lazy loading support to the React package with a `load` prop (`"always"` | `"conditional"`), dynamically importing `@blossom-carousel/core` only on pointer-capable devices by default.

### Improved

- 🎨 Wrapped default styles in `@layer blossom-carousel` so they can be overridden without `!important` (e.g. by Tailwind utilities).
- 🧹 Consolidated snap state (`snapPositions`, `activeSnapPosition`) into `CarouselState`, removing the separate `SnapStore`.

## 2026-04-07

### Added

- ⏮️ Added `prev()` and `next()` methods for programmatic carousel navigation, including optional alignment support.
- 🎯 Added support for `scroll-snap-type: proximity` for softer, native snap behavior.
- 🔒 Added `scrollLock` handling using `@bramus/style-observer` so overflow/style changes are picked up automatically.

### Improved

- 🌳 Improved the TreeWalker-based snap discovery logic to better detect snap targets in more complex layouts.
