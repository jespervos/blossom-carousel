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

export function prev({
  align,
}: { align?: AlignOption | undefined } = {}): void {
  if (!state.scroller) return;
  const left = state.scroller.scrollLeft;

  // find nearest snap position to the left
  const positions = snapStore.positions.length
    ? snapStore.positions
    : state.slidePositions;
  let targetPosition: number = Infinity;
  for (let i = positions.length - 1; i >= 0; i--) {
    const pos = positions[i];
    const posX = alignedPosition(pos.x, pos.width || 0, align);
    if (posX < left - 1) {
      targetPosition = posX;
      break;
    }
  }

  // if found, scroll to it
  if (targetPosition) {
    state.scroller.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });
  }
}
export function next({
  align,
}: { align?: AlignOption | undefined } = {}): void {
  if (!state.scroller) return;
  const left = state.scroller.scrollLeft;

  // find nearest snap position to the right
  const positions = snapStore.positions.length
    ? snapStore.positions
    : state.slidePositions;
  let targetPosition: number = 0;
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    const posX = alignedPosition(pos.x, pos.width || 0, align);
    if (posX > left + 1) {
      targetPosition = posX;
      break;
    }
  }

  // if found, scroll to it
  if (targetPosition) {
    state.scroller.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });
  }
}
