# Changelog

All notable changes to `@blossom-carousel/core` are documented in this file.

## 1.1.8 (2026-07-24)

### Fixed

- Reset the internal animation target on `pointerdown` to prevent jumpy re-dragging while deceleration is still in progress. [#27](https://github.com/jespervos/blossom-carousel/pull/27)([@alachie](https://github.com/alachie))

## 1.1.7 (2026-06-02)

### Fixed

- Changed the wheel event listener to `{ passive: true }` to avoid blocking scroll.
- Corrected the package `types` field to point at the emitted `dist/src/index.d.ts`.

## 1.1.6 (2026-05-29)

### Fixed

- Fixed an issue where overscroll would not clamp to the carousel boundaries on non-snap carousels.

## 1.1.5 (2026-05-17)

### Fixed

- Fixed an issue where elements with `position: sticky` would compute their sticky position as a snap position instead of their real offset.

## 1.1.4 (2026-05-03)

### Added

- Added scroll-margin support.

## 1.1.3 (2026-04-20)

### Added

- Added `resolveCSSLength()` utility to resolve arbitrary CSS length values (including `calc()`) to pixels.

### Changed

- Wrapped default styles in `@layer blossom-carousel` so they can be overridden without `!important` (e.g. by Tailwind utilities).
- Consolidated snap state (`snapPositions`, `activeSnapPosition`) into `CarouselState`, removing the separate `SnapStore`.

## 1.1.0 (2026-04-07)

### Added

- Added `prev()` and `next()` methods for programmatic carousel navigation, including optional alignment support.
- Added support for `scroll-snap-type: proximity` for softer, native snap behavior.
- Added `scrollLock` handling using `@bramus/style-observer` so overflow/style changes are picked up automatically.

### Changed

- Improved the TreeWalker-based snap discovery logic to better detect snap targets in more complex layouts.
