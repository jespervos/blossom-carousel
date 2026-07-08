# Changelog

All notable changes to `@blossom-carousel/svelte` are documented in this file.

## 2.0.0 (2026-07-08)

### Changed

- **Breaking:** Migrated components to Svelte 5 runes and snippets, dropping Svelte 4 slots and reactive statements; the `svelte` peer dependency now requires `^5.0.0`.
- Ship uncompiled source via `svelte-package` instead of a client-only Vite bundle, so consumers compile each component for the right environment. This fixes SSR crashing with `document is not defined` on the published artifact.

### Added

- Added SSR dot seeding: the carousel renders its children through a server probe, counts `data-blossom-slide` markers with a tag-aware scanner, and stashes the total in a per-id registry that a sibling `BlossomDots` reads to seed its dot count before mount. Contexts are forwarded into the probe so slides using `getContext` render identically, and the registry entry is cleared on destroy to avoid leaks and stale counts.
- Async-SSR render failures fall back to client-side dot seeding.
- The private navigation package is now vendored into `dist`, with a browser-mapped stub that keeps the server renderer out of client bundles.

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
