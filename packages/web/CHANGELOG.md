# Changelog

All notable changes to `@blossom-carousel/web` are documented in this file.

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
