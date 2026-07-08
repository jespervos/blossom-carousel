# Changelog

All notable changes to `@blossom-carousel/vue` are documented in this file.

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
