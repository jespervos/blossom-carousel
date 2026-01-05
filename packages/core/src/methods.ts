import { state } from "./state";
import { snapStore } from "./snap";
import type { AlignOption, SnapPosition } from "./types";

function alignedPosition(
  left: number,
  width: number,
  align: AlignOption | undefined
): number {
  if (state.hasSnap) return left;

  switch (align) {
    case "center":
      return left + width * 0.5 - state.scrollerWidth / 2;
    case "end":
      return left + width - state.scrollerWidth + state.scrollPadding.end;
    case "start":
    default:
      return left - state.scrollPadding.start;
  }
}

function findTargetPosition(dir: "prev" | "next", align?: AlignOption): number {
  if (!state.scroller) return 0;

  const left = state.scroller.scrollLeft;
  const positions = snapStore.positions.length
    ? snapStore.positions
    : state.slidePositions;

  if (dir === "prev") {
    for (let i = positions.length - 1; i >= 0; i--) {
      const posX = alignedPosition(
        positions[i].x,
        positions[i].width || 0,
        align
      );
      if (posX < left - 1) return posX;
    }
  } else {
    for (let i = 0; i < positions.length; i++) {
      const posX = alignedPosition(
        positions[i].x,
        positions[i].width || 0,
        align
      );
      if (posX > left + 1) return posX;
    }
  }
  return 0;
}

export function prev({ align }: { align?: AlignOption } = {}): void {
  const targetPosition = findTargetPosition("prev", align);
  if (!targetPosition) return;
  state.scroller!.scrollTo({ left: targetPosition, behavior: "smooth" });
}

export function next({ align }: { align?: AlignOption } = {}): void {
  const targetPosition = findTargetPosition("next", align);
  if (!targetPosition) return;
  state.scroller!.scrollTo({ left: targetPosition, behavior: "smooth" });
}
