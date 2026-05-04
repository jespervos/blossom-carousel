import type { SnapPosition } from "./types.js";
import {
  dispatchScrollSnapChangeEvent,
  dispatchScrollSnapChangingEvent,
} from "./events";
import type { CarouselState } from "./state";
import { FRICTION } from "./constants.js";
import { clamp, project } from "./utils.js";

export function findSnapPositions(
  scroller: HTMLElement,
  state: CarouselState,
): void {
  let positions: { align: string; el: HTMLElement | Element }[] = [];

  const walker = document.createTreeWalker(scroller, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();

  while (node) {
    const styles = window.getComputedStyle(node as Element);
    const scrollSnapAlign = styles.scrollSnapAlign;

    if (scrollSnapAlign !== "none") {
      positions.push({
        align: scrollSnapAlign,
        el: node as Element,
      });
    }

    node = walker.nextNode();
  }

  // precompute snap positions for all slides
  const scrollerRect = scroller.getBoundingClientRect();
  let snapPositions = positions.map(({ el, align }) => {
    const elementRect = (el as HTMLElement).getBoundingClientRect();
    const clientWidth = (el as HTMLElement).clientWidth;
    const left = elementRect.left - scrollerRect.left + scroller.scrollLeft;
    const styles = window.getComputedStyle(el as Element);
    const marginStart = parseFloat(styles.scrollMarginInlineStart) || 0;
    const marginEnd = parseFloat(styles.scrollMarginInlineEnd) || 0;
    const snapAreaStart = left - marginStart;
    const snapAreaEnd = left + clientWidth + marginEnd;

    switch (align) {
      case "start":
        return {
          target: el as HTMLElement,
          x: snapAreaStart - state.scrollPadding.start,
          y: 0,
        };
      case "end":
        return {
          target: el as HTMLElement,
          x: snapAreaEnd - state.scrollerWidth + state.scrollPadding.end,
          y: 0,
        };
      case "center":
        return {
          target: el as HTMLElement,
          x: (snapAreaStart + snapAreaEnd) / 2 - state.scrollerWidth / 2,
          y: 0,
        };
      default:
        return null;
    }
  });

  // Filter out duplicates (i.e. in case of multiple rows)
  const filteredSnapPositions = snapPositions
    .filter((snapPosition) => snapPosition !== null)
    .reduce((acc: SnapPosition[], curr: SnapPosition) => {
      if (acc.length === 0 || acc[acc.length - 1].x !== curr.x) {
        acc.push(curr);
      }
      return acc;
    }, []);

  state.snapPositions = filteredSnapPositions;
}

export function shouldSnap(
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
): boolean {
  if (!state.hasSnap || !state.snapPositions.length) {
    return false;
  }

  if (state.snapMandatory) {
    return true;
  }

  const restingX = project(target, velocity, friction);
  const snapportWidth = Math.max(
    state.scrollerWidth - state.scrollPadding.start - state.scrollPadding.end,
    0,
  );
  const proximityThreshold = snapportWidth / 3;
  const nearestDistance = state.snapPositions.reduce(
    (distance, position) => Math.min(distance, Math.abs(position.x - restingX)),
    Number.POSITIVE_INFINITY,
  );

  return nearestDistance <= proximityThreshold;
}

export function dragSnap(
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
): number {
  const newSnapPosition = snapSelect(
    target,
    velocity,
    friction,
    state,
  );
  if (newSnapPosition.x !== state.activeSnapPosition.x) {
    dispatchScrollSnapChangingEvent(state.scroller, {
      snapTargetInline: (newSnapPosition || state.activeSnapPosition).target,
      snapTargetBlock: (newSnapPosition || state.activeSnapPosition).target,
    });
  }
  state.activeSnapPosition = newSnapPosition;
  const slideX = clamp(
    newSnapPosition.x,
    Math.min((state.scrollerScrollWidth - state.scrollerWidth) * state.dir, 0),
    Math.max((state.scrollerScrollWidth - state.scrollerWidth) * state.dir, 0),
  );
  const distance = slideX - target;
  const force = distance * (1 - FRICTION) * (1 / FRICTION);
  return force;
}

export function snapSelect(
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
): SnapPosition {
  const restingX = project(target, velocity, friction);
  return state.snapPositions.length
    ? state.snapPositions.reduce((prev, curr) =>
        Math.abs(curr.x - restingX) < Math.abs(prev.x - restingX) ? curr : prev,
      )
    : {
        target: null,
        x: clamp(restingX, Math.min(state.end, 0), Math.max(state.end, 0)),
        y: 0,
      };
}

export function onScrollSnapChange(
  state: CarouselState,
): void {
  dispatchScrollSnapChangeEvent(state.scroller, {
    snapTargetInline: state.activeSnapPosition.target,
    snapTargetBlock: state.activeSnapPosition.target,
  });
}

export function onSnapChanging(
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
): void {
  const newSnapPosition = snapSelect(
    target,
    velocity,
    friction,
    state,
  );
  if (newSnapPosition.x !== state.activeSnapPosition.x) {
    state.activeSnapPosition = newSnapPosition;
    dispatchScrollSnapChangingEvent(state.scroller, {
      snapTargetInline: (newSnapPosition || state.activeSnapPosition).target,
      snapTargetBlock: (newSnapPosition || state.activeSnapPosition).target,
    });
  }
}
