# Changelog

All notable changes to `@blossom-carousel/react` are documented in this file.

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
