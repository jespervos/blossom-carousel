# Changelog

All notable changes to Blossom Carousel will be documented in this file.

## Unreleased — 2026-04-10

### Added
- 📐 Added `resolveCSSLength()` utility to resolve arbitrary CSS length values (including `calc()`) to pixels.
- ⚡ Added lazy loading support to the React package with a `load` prop (`"always"` | `"conditional"`), dynamically importing `@blossom-carousel/core` only on pointer-capable devices by default.

### Improved
- 🎨 Wrapped default styles in `@layer blossom-carousel` so they can be overridden without `!important` (e.g. by Tailwind utilities).
- 🧹 Consolidated snap state (`snapPositions`, `activeSnapPosition`) into `CarouselState`, removing the separate `SnapStore`.

## Unreleased — 2026-04-07

### Added
- ⏮️ Added `prev()` and `next()` methods for programmatic carousel navigation, including optional alignment support.
- 🎯 Added support for `scroll-snap-type: proximity` for softer, native snap behavior.
- 🔒 Added `scrollLock` handling using `@bramus/style-observer` so overflow/style changes are picked up automatically.

### Improved
- 🌳 Improved the TreeWalker-based snap discovery logic to better detect snap targets in more complex layouts.
