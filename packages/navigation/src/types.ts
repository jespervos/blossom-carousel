export type Direction = "prev" | "next";

export interface NavigationState {
  /** Tree-order index of the active marker target, or -1 when there are none. */
  activeIndex: number;
  /** Number of marker targets (elements flagged with `data-blossom-slide`). */
  count: number;
  /** Whether the scroller can still scroll towards the start. */
  canPrev: boolean;
  /** Whether the scroller can still scroll towards the end. */
  canNext: boolean;
}
