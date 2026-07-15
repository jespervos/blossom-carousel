# Changelog

All notable changes to `@blossom-carousel/vue` are documented in this file.

## 1.5.0 (2026-07-15)

### Added

- Added `BlossomDot` for fully custom dot buttons with navigation and accessibility attributes wired automatically.
- Added custom dot rendering on `BlossomDots` via the default slot — render a `<BlossomDot>` to replace the default marker and control markup per slide.

### Changed

- **Breaking:** Default dot styling hooks moved from `.blossom-dots` / `.blossom-dot` classes to `data-blossom-dots`, `data-blossom-dot`, and `data-blossom-dot-marker` attributes; update selectors when overriding default dot styles.
- **Breaking:** Slot content on `BlossomDots` now replaces the entire default dot button — render `<BlossomDot>` explicitly instead of injecting content into the built-in marker.
- Default dots now render a `<span data-blossom-dot-marker>` inside the button so custom dot content and themed markers can coexist; dot sizing and opacity custom properties target the marker.

## 1.4.0 (2026-07-08)

### Added

- Added SSR dot seeding: `BlossomCarousel` walks its slot vnodes during setup to count marked slides and stores the total in a per-id registry, so a sibling `BlossomDots` renders the correct number of dots on the server and avoids flashing an empty list during hydration.

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
