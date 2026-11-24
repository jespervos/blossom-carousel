import {
  BlossomCarousel,
  BlossomDot,
  BlossomDots,
  BlossomNext,
  BlossomPrev,
  useBlossomNavigation,
  type BlossomCarouselHandle,
  type NavigationState,
} from "@blossom-carousel/react";

export function Example() {
  const state: NavigationState = useBlossomNavigation("c");
  const count: number = state.count;
  return (
    <>
      <BlossomCarousel id="c" repeat>
        <div>{count}</div>
      </BlossomCarousel>
      {/* @ts-expect-error repeat is a boolean */}
      <BlossomCarousel repeat="not-a-boolean" />
      <BlossomPrev for="c" />
      {/* @ts-expect-error `for` is required */}
      <BlossomNext />
      <BlossomDots for="c">
        {({ index, active }) => (
          <BlossomDot data-active={active}>{index.toFixed(0)}</BlossomDot>
        )}
      </BlossomDots>
    </>
  );
}

export function go(handle: BlossomCarouselHandle) {
  handle.goTo(1, { behavior: "smooth" });
  // @ts-expect-error unknown method
  handle.missing();
}
