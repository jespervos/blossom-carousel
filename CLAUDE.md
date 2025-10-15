# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Blossom Carousel is a native-scroll-first carousel component library with physics-based drag support. It provides a core implementation and framework-specific wrappers for React, Vue, Svelte, and Web Components.

**Key characteristics:**
- Native scrolling with CSS scroll-snap support
- Custom drag physics for fine pointer devices (mouse/trackpad) only - 0kb on touch devices
- Physics-based momentum scrolling with configurable friction and damping
- Optional repeat/infinite scroll mode
- Rubber banding overscroll effects

## Repository Structure

This is a **pnpm workspace monorepo** with the following packages:

- `packages/core` - Core TypeScript library with Vite build ([blossom-carousel.ts](packages/core/src/blossom-carousel.ts:1))
- `packages/react` - React wrapper component
- `packages/vue` - Vue 3 wrapper component
- `packages/svelte` - Svelte wrapper component
- `packages/web` - Web Component implementation
- `packages/dev` - Development sandbox (Vue-based)

All framework wrappers depend on `@blossom-carousel/core` and provide thin component layers that initialize/destroy the core Blossom instance.

## Development Commands

Use pnpm for all package management:

```bash
# Install dependencies
pnpm install

# Development servers (runs specific package dev server)
pnpm dev              # Run dev sandbox (packages/dev)
pnpm dev:react        # Run React package dev server
pnpm dev:vue          # Run Vue package dev server
pnpm dev:svelte       # Run Svelte package dev server
pnpm dev:web          # Run Web Component package dev server

# Build individual packages
cd packages/core && pnpm build
cd packages/react && pnpm build
# etc...
```

## Core Architecture

### Main Entry Point
[packages/core/src/blossom-carousel.ts](packages/core/src/blossom-carousel.ts:15) exports the `Blossom` factory function which accepts:
- `scroller: HTMLElement` - The scrollable container element
- `options: CarouselOptions` - Currently only `repeat?: boolean` for infinite scroll

Returns an object with `init()`, `destroy()`, `snap`, and `hasOverflow` properties.

### Physics System
The carousel uses a custom physics ticker ([tick function](packages/core/src/blossom-carousel.ts:423)) with:
- **Friction** (`FRICTION = 0.72`) - Applied to velocity each frame
- **Damping** (`DAMPING = 0.12`) - Smooth interpolation using exponential decay via `damp()` function
- **Velocity projection** - Predicts final resting position for snap point selection
- **Rubber banding** - 0.2x resistance when dragging beyond edges

### Key Systems
1. **Pointer interaction** - Only activates on `(hover: hover) and (pointer: fine)` media query
2. **Scroll interception** - Patches `scrollTo`, `scrollBy`, and `Element.prototype.scrollIntoView` to disable physics during programmatic scrolling
3. **Snap point calculation** - Traverses DOM to find elements with `scroll-snap-align`, computes their positions relative to scroll container
4. **Repeat mode** - Translates slides to create infinite scroll illusion, resets scroll position when reaching edges

### Important State Variables
- `virtualScroll` - The smoothed scroll position updated by physics ticker
- `target` - The target scroll position (updated by drag or velocity)
- `velocity` - Current momentum vector
- `isDragging` - Pointer down state
- `isTicking` - Whether the animation frame loop is active
- `hasOverflow` - Proxy that adds/removes event listeners when overflow changes

## Framework Wrappers

All wrappers follow the same pattern:
1. Accept children/slots and forward props to rendered element
2. Create a ref to the DOM element
3. Call `Blossom(element, options)` on mount
4. Call `blossom.init()` to start
5. Call `blossom.destroy()` on unmount

Example: [packages/react/src/BlossomCarousel.tsx](packages/react/src/BlossomCarousel.tsx:32)

## Publishing

Packages use `publishConfig.access: "public"` and are built to `dist/` directories with:
- UMD build: `dist/blossom-carousel-{package}.umd.cjs`
- ESM build: `dist/blossom-carousel-{package}.js`
- Types: `dist/index.d.ts`
- Styles: `dist/blossom-carousel-{package}.css`

Vite is used for all builds with `vite-plugin-dts` for TypeScript declarations.
