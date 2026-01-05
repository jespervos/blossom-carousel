export function dispatchOverscrollEvent(
  scroller: HTMLElement | null,
  detail: { left: number }
): CustomEvent<{ left: number }> {
  const overscrollEvent = new CustomEvent("overscroll", {
    bubbles: true,
    cancelable: true,
    detail,
  });
  scroller?.dispatchEvent(overscrollEvent);
  return overscrollEvent;
}

const scrollEndEvent = new Event("scrollend", {
  bubbles: true,
  cancelable: true,
});
export function dispatchScrollEndEvent(scroller: HTMLElement | null): Event {
  scroller?.dispatchEvent(scrollEndEvent);
  return scrollEndEvent;
}

export function dispatchScrollSnapChangeEvent(
  scroller: HTMLElement | null,
  detail: {
    snapTargetInline: HTMLElement | null;
    snapTargetBlock: HTMLElement | null;
  }
): Event {
  const scrollSnapChangeEvent = new CustomEvent("scrollsnapchange", {
    bubbles: true,
    cancelable: true,
    detail,
  });
  scroller?.dispatchEvent(scrollSnapChangeEvent);
  return scrollSnapChangeEvent;
}

export function dispatchScrollSnapChangingEvent(
  scroller: HTMLElement | null,
  detail: {
    snapTargetInline: HTMLElement | null;
    snapTargetBlock: HTMLElement | null;
  }
): Event {
  const scrollSnapChangingEvent = new CustomEvent("scrollsnapchanging", {
    bubbles: true,
    cancelable: true,
    detail,
  });
  scroller?.dispatchEvent(scrollSnapChangingEvent);
  return scrollSnapChangingEvent;
}
