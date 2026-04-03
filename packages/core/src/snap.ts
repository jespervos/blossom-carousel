import type { SnapPosition } from "./types.js";
import {
  dispatchScrollSnapChangeEvent,
  dispatchScrollSnapChangingEvent,
} from "./events";
import type { CarouselState } from "./state";
import { FRICTION } from "./constants.js";
import { clamp, project } from "./utils.js";

type Axis = "x" | "y";

export type SnapStore = {
  positions: SnapPosition[];
  positionsY: SnapPosition[];
  activePosition: SnapPosition;
  activePositionY: SnapPosition;
};

export function createSnapStore(): SnapStore {
  return {
    positions: [],
    positionsY: [],
    activePosition: { target: null, x: 0, y: 0 },
    activePositionY: { target: null, x: 0, y: 0 },
  };
}

function getAxisConfig(axis: Axis, state: CarouselState, snapStore: SnapStore) {
  return axis === "x"
    ? {
        positions: snapStore.positions,
        active: snapStore.activePosition,
        setActive: (p: SnapPosition) => {
          snapStore.activePosition = p;
        },
        snapportSize: Math.max(
          state.scrollerWidth -
            state.scrollPadding.start -
            state.scrollPadding.end,
          0,
        ),
        scrollSize: state.scrollerScrollWidth - state.scrollerWidth,
        end: state.end,
        dir: state.dir,
      }
    : {
        positions: snapStore.positionsY,
        active: snapStore.activePositionY,
        setActive: (p: SnapPosition) => {
          snapStore.activePositionY = p;
        },
        snapportSize: Math.max(
          state.scrollerHeight -
            state.scrollPaddingBlock.start -
            state.scrollPaddingBlock.end,
          0,
        ),
        scrollSize: state.scrollerScrollHeight - state.scrollerHeight,
        end: state.endY,
        dir: 1,
      };
}

function dedup(positions: SnapPosition[], axis: Axis): SnapPosition[] {
  return positions.reduce((acc: SnapPosition[], curr) => {
    if (acc.length === 0 || acc[acc.length - 1][axis] !== curr[axis]) {
      acc.push(curr);
    }
    return acc;
  }, []);
}

export function findSnapPositions(
  scroller: HTMLElement,
  state: CarouselState,
  snapStore: SnapStore,
): void {
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
    for (let child of Array.from(children)) {
      traverseDOM(child);
    }
  };
  traverseDOM(scroller);

  // precompute snap positions for all slides
  const scrollerRect = scroller.getBoundingClientRect();
  let snapPositions = positions.map(({ el, align }) => {
    const elementRect = (el as HTMLElement).getBoundingClientRect();
    const clientWidth = (el as HTMLElement).clientWidth;
    const clientHeight = (el as HTMLElement).clientHeight;
    const left = elementRect.left - scrollerRect.left + scroller.scrollLeft;
    const top = elementRect.top - scrollerRect.top + scroller.scrollTop;

    switch (align) {
      case "start":
        return {
          target: el as HTMLElement,
          x: left - state.scrollPadding.start,
          y: top - state.scrollPaddingBlock.start,
        };
      case "end":
        return {
          target: el as HTMLElement,
          x: left + clientWidth - state.scrollerWidth + state.scrollPadding.end,
          y:
            top +
            clientHeight -
            state.scrollerHeight +
            state.scrollPaddingBlock.end,
        };
      case "center":
        return {
          target: el as HTMLElement,
          x: left + clientWidth * 0.5 - state.scrollerWidth / 2,
          y: top + clientHeight * 0.5 - state.scrollerHeight / 2,
        };
      default:
        return null;
    }
  });

  const valid = snapPositions.filter((p) => p !== null) as SnapPosition[];
  snapStore.positions = dedup(valid, "x");
  snapStore.positionsY = dedup(valid, "y");
}

export function shouldSnap(
  axis: Axis,
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
  snapStore: SnapStore,
): boolean {
  const { positions, snapportSize } = getAxisConfig(axis, state, snapStore);

  if (!state.hasSnap || !positions.length) return false;
  if (state.snapMandatory) return true;

  const resting = project(target, velocity, friction);
  const proximityThreshold = snapportSize / 3;
  const nearestDistance = positions.reduce(
    (distance, position) =>
      Math.min(distance, Math.abs(position[axis] - resting)),
    Number.POSITIVE_INFINITY,
  );

  return nearestDistance <= proximityThreshold;
}

export function snapSelect(
  axis: Axis,
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
  snapStore: SnapStore,
): SnapPosition {
  const { positions, end } = getAxisConfig(axis, state, snapStore);
  const resting = project(target, velocity, friction);

  if (positions.length) {
    return positions.reduce((prev, curr) =>
      Math.abs(curr[axis] - resting) < Math.abs(prev[axis] - resting)
        ? curr
        : prev,
    );
  }

  return axis === "x"
    ? {
        target: null,
        x: clamp(resting, Math.min(end, 0), Math.max(end, 0)),
        y: 0,
      }
    : { target: null, x: 0, y: clamp(resting, 0, Math.max(end, 0)) };
}

export function dragSnap(
  axis: Axis,
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
  snapStore: SnapStore,
): number {
  const { active, setActive, scrollSize, dir } = getAxisConfig(
    axis,
    state,
    snapStore,
  );
  const newSnapPosition = snapSelect(
    axis,
    target,
    velocity,
    friction,
    state,
    snapStore,
  );

  if (newSnapPosition[axis] !== active[axis]) {
    dispatchScrollSnapChangingEvent(state.scroller, {
      snapTargetInline: (newSnapPosition || active).target,
      snapTargetBlock: (newSnapPosition || active).target,
    });
  }
  setActive(newSnapPosition);

  const clamped =
    axis === "x"
      ? clamp(
          newSnapPosition[axis],
          Math.min(scrollSize * dir, 0),
          Math.max(scrollSize * dir, 0),
        )
      : clamp(newSnapPosition[axis], 0, Math.max(scrollSize, 0));

  const distance = clamped - target;
  return distance * (1 - FRICTION) * (1 / FRICTION);
}

export function onScrollSnapChange(
  state: CarouselState,
  snapStore: SnapStore,
): void {
  dispatchScrollSnapChangeEvent(state.scroller, {
    snapTargetInline: snapStore.activePosition.target,
    snapTargetBlock: snapStore.activePosition.target,
  });
}

export function onSnapChanging(
  axis: Axis,
  target: number,
  velocity: number,
  friction: number,
  state: CarouselState,
  snapStore: SnapStore,
): void {
  const { active, setActive } = getAxisConfig(axis, state, snapStore);
  const newSnapPosition = snapSelect(
    axis,
    target,
    velocity,
    friction,
    state,
    snapStore,
  );

  if (newSnapPosition[axis] !== active[axis]) {
    setActive(newSnapPosition);
    dispatchScrollSnapChangingEvent(state.scroller, {
      snapTargetInline: (newSnapPosition || active).target,
      snapTargetBlock: (newSnapPosition || active).target,
    });
  }
}
