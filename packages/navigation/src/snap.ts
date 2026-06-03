/**
 * Self-contained, depth-agnostic readers of inline-axis scroll-snap geometry.
 * Used by the prev/next page-scroll logic and the dots' active-marker
 * computation so both are deterministic regardless of whether Blossom is
 * initialized. This intentionally does not depend on `@blossom-carousel/core`
 * so that the navigation controls stay lightweight and usable without a
 * Blossom instance.
 */

export type InlineAlign = "start" | "center" | "end";

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
 * The (unclamped) `scrollLeft` at which `target` would rest when snapped to the
 * given inline alignment. Unclamped on purpose: callers use the raw value to
 * tell whether a target can physically reach its snap position.
 */
export function snapPositionFor(
  scroller: HTMLElement,
  target: HTMLElement,
  align: InlineAlign,
  scrollerRect: DOMRect,
  scrollPaddingStart: number,
  scrollPaddingEnd: number,
  styles: CSSStyleDeclaration = getComputedStyle(target),
): number {
  const rect = target.getBoundingClientRect();
  const left = rect.left - scrollerRect.left + scroller.scrollLeft;
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
 * Returns the candidate `scrollLeft` positions (ascending) that the inline-axis
 * snap targets resolve to, clamped to the scrollable range.
 */
export function getSnapPositions(scroller: HTMLElement): number[] {
  const scrollerRect = scroller.getBoundingClientRect();
  const scrollerStyles = getComputedStyle(scroller);
  const scrollPaddingStart =
    parseFloat(scrollerStyles.scrollPaddingInlineStart) || 0;
  const scrollPaddingEnd =
    parseFloat(scrollerStyles.scrollPaddingInlineEnd) || 0;
  const maxScroll = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);

  const walker = document.createTreeWalker(scroller, NodeFilter.SHOW_ELEMENT);
  const positions: number[] = [];

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
        styles,
      );
      positions.push(Math.min(Math.max(x, 0), maxScroll));
    }

    node = walker.nextNode();
  }

  // Sort ascending and drop near-duplicates (e.g. multi-row carousels).
  positions.sort((a, b) => a - b);
  return positions.reduce<number[]>((acc, x) => {
    if (acc.length === 0 || Math.abs(acc[acc.length - 1] - x) > 1) acc.push(x);
    return acc;
  }, []);
}
