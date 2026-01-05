import type { SnapPosition } from "./types.js";
import {
  dispatchScrollSnapChangeEvent,
  dispatchScrollSnapChangingEvent,
} from "./events";
import { state } from "./state";
import { FRICTION } from "./constants.js";
import { clamp, project } from "./utils.js";

export const snapStore = {
  positions: [] as SnapPosition[],
  activePosition: { target: null, x: 0, y: 0 } as SnapPosition,
};

export function findSnapPositions(scroller: HTMLElement): void {
  let positions: { align: string; el: HTMLElement | Element }[] = [];

  let cycles = 0;
  const traverseDOM = (node: HTMLElement | Element) => {
    cycles++;
    // break if the max depth is reached
    if (cycles > 100) return;

    const styles = window.getComputedStyle(node);
    const scrollSnapAlign = styles.scrollSnapAlign;

    // break if a snap-type value  is found
    if (scrollSnapAlign !== "none") {
      positions.push({
        align: scrollSnapAlign,
        el: node,
      });
      return;
    }

    // traverse all children
    const children = node.children;
    if (children.length === 0) return;
    for (let child of children) {
      traverseDOM(child);
    }
  };
  traverseDOM(scroller);

  // precompute snap positions for all slides
  const scrollerRect = scroller.getBoundingClientRect();
  let snapPositions = positions.map(({ el, align }, i) => {
    const elementRect = (el as HTMLElement).getBoundingClientRect();
    const clientWidth = (el as HTMLElement).clientWidth;
    const left = elementRect.left - scrollerRect.left + scroller.scrollLeft;

    switch (align) {
      case "start":
        return {
          target: el as HTMLElement,
          x: left - state.scrollPadding.start,
          y: 0,
        };
      case "end":
        return {
          target: el as HTMLElement,
          x: left + clientWidth - state.scrollerWidth + state.scrollPadding.end,
          y: 0,
        };
      case "center":
        return {
          target: el as HTMLElement,
          x: left + clientWidth * 0.5 - state.scrollerWidth / 2,
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

  snapStore.positions = filteredSnapPositions;
}

export function dragSnap(
  target: number,
  velocity: number,
  friction: number
): number {
  //TODO: add support for vertical snapping
  const newSnapPosition = snapSelect(target, velocity, friction);
  if (newSnapPosition.x !== snapStore.activePosition.x) {
    dispatchScrollSnapChangingEvent(state.scroller, {
      snapTargetInline: (newSnapPosition || snapStore.activePosition).target,
      snapTargetBlock: (newSnapPosition || snapStore.activePosition).target,
    });
  }
  snapStore.activePosition = newSnapPosition;
  const slideX = clamp(
    newSnapPosition.x,
    Math.min((state.scrollerScrollWidth - state.scrollerWidth) * state.dir, 0),
    Math.max((state.scrollerScrollWidth - state.scrollerWidth) * state.dir, 0)
  );
  const distance = slideX - target;
  const force = distance * (1 - FRICTION) * (1 / FRICTION);
  return force;
}

export function snapSelect(
  target: number,
  velocity: number,
  friction: number
): SnapPosition {
  const restingX = project(target, velocity, friction);
  return snapStore.positions.length
    ? snapStore.positions.reduce((prev, curr) =>
        Math.abs(curr.x - restingX) < Math.abs(prev.x - restingX) ? curr : prev
      )
    : {
        target: null,
        x: clamp(restingX, Math.min(state.end, 0), Math.max(state.end, 0)),
        y: 0,
      };
}

export function onScrollSnapChange(): void {
  dispatchScrollSnapChangeEvent(state.scroller, {
    snapTargetInline: snapStore.activePosition.target,
    snapTargetBlock: snapStore.activePosition.target,
  });
}

export function onSnapChanging(
  target: number,
  velocity: number,
  friction: number
): void {
  const newSnapPosition = snapSelect(target, velocity, friction);
  if (newSnapPosition.x !== snapStore.activePosition.x) {
    snapStore.activePosition = newSnapPosition;
    dispatchScrollSnapChangingEvent(state.scroller, {
      snapTargetInline: (newSnapPosition || snapStore.activePosition).target,
      snapTargetBlock: (newSnapPosition || snapStore.activePosition).target,
    });
  }
}
