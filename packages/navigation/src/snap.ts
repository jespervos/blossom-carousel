/**
 * Self-contained, depth-agnostic readers of inline-axis scroll-snap geometry.
 * Used by the prev/next page-scroll logic and the dots' active-marker
 * computation so both are deterministic regardless of whether Blossom is
 * initialized. This intentionally does not depend on `@blossom-carousel/core`
 * so that the navigation controls stay lightweight and usable without a
 * Blossom instance.
 */

export type InlineAlign = "start" | "center" | "end";

/** Whether the scroller lays out its inline axis right-to-left. */
export function isRtl(scroller: HTMLElement): boolean {
  return getComputedStyle(scroller).direction === "rtl";
}

/**
 * The logical inline scroll offset: `0` at the inline-start edge, increasing
 * towards the inline-end. In RTL the physical `scrollLeft` runs `[-max, 0]`,
 * so it is negated to recover the same `[0, max]` range as LTR. Every snap
 * position in this package lives in this logical space, so comparisons against
 * the live scroll offset must go through this helper rather than reading
 * `scrollLeft` directly.
 */
export function logicalScrollLeft(scroller: HTMLElement, rtl: boolean): number {
  return rtl ? -scroller.scrollLeft : scroller.scrollLeft;
}

/**
 * A snap target paired with its resolved inline alignment — everything needed
 * to bring it into view via `scrollIntoView({ inline })`.
 */
export interface SnapTarget {
  /** The snap target element. */
  el: HTMLElement;
  /**
   * The resolved inline `scroll-snap-align` (never `"none"` — opting out falls
   * back to `"start"`). Maps directly onto `scrollIntoView({ inline })`.
   */
  align: InlineAlign;
}

/**
 * A {@link SnapTarget} plus its resolved snap position, used by prev/next
 * paging to locate the adjacent snap point relative to the current scroll.
 */
export interface SnapPoint extends SnapTarget {
  /**
   * The clamped logical scroll offset (see {@link logicalScrollLeft}) at which
   * the target rests when snapped.
   */
  x: number;
}

/**
 * Resolves the inline-axis component of a computed `scroll-snap-align` value.
 * Returns `"none"` when snapping is not requested on the inline axis.
 */
export function inlineSnapAlign(value: string): InlineAlign | "none" {
  if (!value || value === "none") return "none";
  const parts = value.trim().split(/\s+/);
  // `scroll-snap-align` is `<block> <inline>` when two values are present,
  // otherwise the single value applies to both axes.
  const inline = parts.length === 2 ? parts[1] : parts[0];
  return inline === "center" || inline === "end" ? inline : "start";
}

/**
 * Like `inlineSnapAlign`, but resolves the `"none"` case to `"start"` so the
 * result can be passed straight to `scrollIntoView({ inline })`.
 */
export function resolveInlineAlign(value: string): InlineAlign {
  const align = inlineSnapAlign(value);
  return align === "none" ? "start" : align;
}

/**
 * The (unclamped) logical scroll offset at which `target` would rest when
 * snapped to the given inline alignment. Unclamped on purpose: callers use the
 * raw value to tell whether a target can physically reach its snap position.
 *
 * Computed in logical coordinates (see {@link logicalScrollLeft}): in RTL the
 * inline-start edge is the physical right, so the target's offset is measured
 * from the scroller's right edge and the result compares directly against the
 * logical scroll offset in both directions.
 */
export function snapPositionFor(
  scroller: HTMLElement,
  target: HTMLElement,
  align: InlineAlign,
  scrollerRect: DOMRect,
  scrollPaddingStart: number,
  scrollPaddingEnd: number,
  rtl: boolean,
  styles: CSSStyleDeclaration = getComputedStyle(target),
): number {
  const rect = target.getBoundingClientRect();
  // Offset of the target's inline-start edge from the scrollport's
  // inline-start edge, measured along the logical scroll direction.
  const startEdge = rtl
    ? scrollerRect.right - rect.right
    : rect.left - scrollerRect.left;
  const left = startEdge + logicalScrollLeft(scroller, rtl);
  const marginStart = parseFloat(styles.scrollMarginInlineStart) || 0;
  const marginEnd = parseFloat(styles.scrollMarginInlineEnd) || 0;
  const snapAreaStart = left - marginStart;
  const snapAreaEnd = left + target.clientWidth + marginEnd;
  const scrollport = scroller.clientWidth;

  switch (align) {
    case "end":
      return snapAreaEnd - scrollport + scrollPaddingEnd;
    case "center":
      return (snapAreaStart + snapAreaEnd) / 2 - scrollport / 2;
    case "start":
    default:
      return snapAreaStart - scrollPaddingStart;
  }
}

/**
 * The snap target for each marker, in tree order (parallel to
 * `getMarkerTargets`): its element and resolved inline alignment. `goto` indexes
 * straight into the result and hands both to `scrollIntoView`, which resolves
 * the final scroll position natively — so this needs only a style read per
 * target (no layout), making it cheap to (re)build on resize/mutation.
 */
export function getMarkerSnaps(targets: HTMLElement[]): SnapTarget[] {
  return targets.map((el) => ({
    el,
    align: resolveInlineAlign(getComputedStyle(el).scrollSnapAlign),
  }));
}

/**
 * Returns the inline-axis snap points (ascending by position, near-duplicates
 * dropped) that prev/next paging steps through. Each carries its element and
 * resolved alignment so paging can `scrollIntoView` the adjacent target with
 * its own inline alignment, plus the clamped `x` used to locate it.
 */
export function getSnapPositions(scroller: HTMLElement): SnapPoint[] {
  const scrollerRect = scroller.getBoundingClientRect();
  const scrollerStyles = getComputedStyle(scroller);
  const rtl = scrollerStyles.direction === "rtl";
  const scrollPaddingStart =
    parseFloat(scrollerStyles.scrollPaddingInlineStart) || 0;
  const scrollPaddingEnd =
    parseFloat(scrollerStyles.scrollPaddingInlineEnd) || 0;
  const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);

  const walker = document.createTreeWalker(scroller, NodeFilter.SHOW_ELEMENT);
  const points: SnapPoint[] = [];

  let node = walker.nextNode();
  while (node) {
    const el = node as HTMLElement;
    const styles = getComputedStyle(el);
    const align = inlineSnapAlign(styles.scrollSnapAlign);

    if (align !== "none") {
      const x = snapPositionFor(
        scroller,
        el,
        align,
        scrollerRect,
        scrollPaddingStart,
        scrollPaddingEnd,
        rtl,
        styles,
      );
      points.push({ el, align, x: Math.min(Math.max(x, 0), maxScroll) });
    }

    node = walker.nextNode();
  }

  // Sort ascending and drop near-duplicates (e.g. multi-row carousels).
  points.sort((a, b) => a.x - b.x);
  return points.reduce<SnapPoint[]>((acc, p) => {
    if (acc.length === 0 || Math.abs(acc[acc.length - 1].x - p.x) > 1) {
      acc.push(p);
    }
    return acc;
  }, []);
}
