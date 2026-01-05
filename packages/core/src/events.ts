const scrollEndEvent = new Event("scrollend", {
  bubbles: true,
  cancelable: true,
});

const dispatchEvent = (
  scroller: HTMLElement | null,
  eventName: string,
  detail?: any
) => {
  const event = detail
    ? new CustomEvent(eventName, { bubbles: true, cancelable: true, detail })
    : new Event(eventName, { bubbles: true, cancelable: true });
  scroller?.dispatchEvent(event);
  return event;
};

export const dispatchOverscrollEvent = (
  scroller: HTMLElement | null,
  detail: { left: number }
) => dispatchEvent(scroller, "overscroll", detail);

export const dispatchScrollEndEvent = (scroller: HTMLElement | null) => (
  scroller?.dispatchEvent(scrollEndEvent), scrollEndEvent
);

export const dispatchScrollSnapChangeEvent = (
  scroller: HTMLElement | null,
  detail: {
    snapTargetInline: HTMLElement | null;
    snapTargetBlock: HTMLElement | null;
  }
) => dispatchEvent(scroller, "scrollsnapchange", detail);

export const dispatchScrollSnapChangingEvent = (
  scroller: HTMLElement | null,
  detail: {
    snapTargetInline: HTMLElement | null;
    snapTargetBlock: HTMLElement | null;
  }
) => dispatchEvent(scroller, "scrollsnapchanging", detail);
