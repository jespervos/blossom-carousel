import type { CarouselState } from "./state";
import type { SnapStore } from "./snap";
import type { AlignOption } from "./types";

type Axis = "x" | "y";

type AxisConfig = {
  scrollPos: number;
  positions: { x: number; y: number; width?: number; height?: number }[];
  posKey: Axis;
  sizeKey: "width" | "height";
  scrollToKey: "left" | "top";
  viewportSize: number;
  paddingEnd: number;
  paddingStart: number;
};

function getAxisConfig(
  axis: Axis,
  state: CarouselState,
  snapStore: SnapStore,
): AxisConfig {
  const scroller = state.scroller!;
  if (axis === "x") {
    return {
      scrollPos: scroller.scrollLeft,
      positions: snapStore.positions.length
        ? snapStore.positions
        : state.slidePositions,
      posKey: "x",
      sizeKey: "width",
      scrollToKey: "left",
      viewportSize: state.scrollerWidth,
      paddingEnd: state.scrollPadding.end,
      paddingStart: state.scrollPadding.start,
    };
  }
  return {
    scrollPos: scroller.scrollTop,
    positions: snapStore.positionsY.length
      ? snapStore.positionsY
      : state.slidePositions,
    posKey: "y",
    sizeKey: "height",
    scrollToKey: "top",
    viewportSize: state.scrollerHeight,
    paddingEnd: state.scrollPaddingBlock.end,
    paddingStart: state.scrollPaddingBlock.start,
  };
}

const alignFns = {
  center: (pos: number, size: number, viewportSize: number) =>
    pos + size * 0.5 - viewportSize / 2,
  end: (pos: number, size: number, viewportSize: number, paddingEnd: number) =>
    pos + size - viewportSize + paddingEnd,
  start: (
    pos: number,
    _size: number,
    _viewportSize: number,
    _paddingEnd: number,
    paddingStart: number,
  ) => pos - paddingStart,
} as const;

function alignedPosition(
  pos: number,
  size: number,
  align: AlignOption | undefined,
  config: AxisConfig,
  hasSnap: boolean,
): number {
  if (hasSnap) return pos;
  const fn = alignFns[(align || "start") as keyof typeof alignFns];
  return fn(
    pos,
    size,
    config.viewportSize,
    config.paddingEnd,
    config.paddingStart,
  );
}

function findTargetPos(
  dir: "prev" | "next",
  align: AlignOption | undefined,
  state: CarouselState,
  config: AxisConfig,
): number | null {
  const { scrollPos, positions, posKey, sizeKey } = config;

  if (dir === "prev") {
    for (let i = positions.length - 1; i >= 0; i--) {
      const p = alignedPosition(
        positions[i][posKey],
        positions[i][sizeKey] || 0,
        align,
        config,
        state.hasSnap,
      );
      if (p < scrollPos - 1) return p;
    }
  } else {
    for (let i = 0; i < positions.length; i++) {
      const p = alignedPosition(
        positions[i][posKey],
        positions[i][sizeKey] || 0,
        align,
        config,
        state.hasSnap,
      );
      if (p > scrollPos + 1) return p;
    }
  }
  return null;
}

function navigate(
  dir: "prev" | "next",
  state: CarouselState,
  snapStore: SnapStore,
  { align, axis = "x" }: { align?: AlignOption; axis?: Axis } = {},
): void {
  if (!state.scroller) return;
  const config = getAxisConfig(axis, state, snapStore);
  const targetPosition = findTargetPos(dir, align, state, config);
  if (targetPosition === null) return;
  state.scroller.scrollTo({
    [config.scrollToKey]: targetPosition,
    behavior: "smooth",
  });
}

export function prev(
  state: CarouselState,
  snapStore: SnapStore,
  opts?: { align?: AlignOption; axis?: Axis },
): void {
  navigate("prev", state, snapStore, opts);
}

export function next(
  state: CarouselState,
  snapStore: SnapStore,
  opts?: { align?: AlignOption; axis?: Axis },
): void {
  navigate("next", state, snapStore, opts);
}
