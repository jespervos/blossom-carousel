import type { CarouselState } from "./state";
import type { AlignOption } from "./types";

const alignmentMap = {
  center: (l: number, w: number, state: CarouselState) =>
    l + w * 0.5 - state.scrollerWidth / 2,
  end: (l: number, w: number, state: CarouselState) =>
    l + w - state.scrollerWidth + state.scrollPadding.end,
  start: (l: number, w: number, state: CarouselState) =>
    l - state.scrollPadding.start,
} as const;

function alignedPosition(
  left: number,
  width: number,
  align: AlignOption | undefined,
  state: CarouselState,
): number {
  if (state.hasSnap) return left;
  const alignFn = alignmentMap[(align || "start") as keyof typeof alignmentMap];
  return alignFn(left, width, state);
}

function findTargetPosition(
  dir: "prev" | "next",
  align: AlignOption | undefined,
  state: CarouselState,
): number | null {
  if (!state.scroller) return null;

  const left = state.scroller.scrollLeft;
  const positions = state.snapPositions.length
    ? state.snapPositions
    : state.slidePositions;

  if (dir === "prev") {
    for (let i = positions.length - 1; i >= 0; i--) {
      const posX = alignedPosition(
        positions[i].x,
        positions[i].width || 0,
        align,
        state,
      );
      if (posX < left - 1) return posX;
    }
  } else {
    for (let i = 0; i < positions.length; i++) {
      const posX = alignedPosition(
        positions[i].x,
        positions[i].width || 0,
        align,
        state,
      );
      if (posX > left + 1) return posX;
    }
  }
  return null;
}

export function prev(
  state: CarouselState,
  { align }: { align?: AlignOption } = {},
): void {
  const targetPosition = findTargetPosition("prev", align, state);
  if (targetPosition === null) return;
  state.scroller!.scrollTo({ left: targetPosition, behavior: "smooth" });
}

export function next(
  state: CarouselState,
  { align }: { align?: AlignOption } = {},
): void {
  const targetPosition = findTargetPosition("next", align, state);
  if (targetPosition === null) return;
  state.scroller!.scrollTo({ left: targetPosition, behavior: "smooth" });
}
