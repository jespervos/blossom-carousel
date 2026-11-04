import React, {
  ElementType,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  JSXElementConstructor,
} from "react";
import { createCommands, registerCommands } from "@blossom-carousel/navigation";
import { countMarkedSlides } from "./countMarkedSlides";
import { setSlideCount } from "./slideRegistry";

export interface BlossomCarouselHandle {
  prev: (options?: { behavior?: ScrollBehavior }) => void;
  next: (options?: { behavior?: ScrollBehavior }) => void;
  goTo: (index: number, options?: { behavior?: ScrollBehavior }) => void;
  element: HTMLElement | null;
}

export type BlossomOverscrollEvent = CustomEvent<{ left: number }>;

export type BlossomCommandEvent = CustomEvent<{
  command?: string;
  behavior?: ScrollBehavior;
  source?: Element | null;
}> & {
  command?: string;
  source?: Element | null;
};

export interface BlossomCarouselProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "onCommand"> {
  children?: ReactNode | Array<ReactNode>;
  as?: ElementType;
  repeat?: boolean;
  load?: "always" | "conditional";
  /** Fires while the drag engine rubber-bands past an edge. Call `preventDefault()` to replace the default effect. */
  onOverscroll?: (event: BlossomOverscrollEvent) => void;
  /** Fires when a navigation control or `prev`/`next`/`goTo` navigates the carousel. */
  onCommand?: (event: BlossomCommandEvent) => void;
}

// `useLayoutEffect` warns when rendered on the server in React < 19.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BlossomCarousel = forwardRef<BlossomCarouselHandle, BlossomCarouselProps>(
  (
    {
      children,
      as = "div",
      repeat = false,
      load = "conditional",
      onOverscroll,
      onCommand,
      ...props
    },
    parentRef,
  ) => {
    const Component = as as JSXElementConstructor<any>;
    const localRef = useRef<HTMLElement>(null);
    const blossomRef = useRef<ReturnType<typeof import("@blossom-carousel/core").Blossom> | null>(null);

    // React DOM drops unknown `on*` props on intrinsic elements, so these are
    // attached natively. Refs keep the latest handlers without re-subscribing.
    const onOverscrollRef = useRef(onOverscroll);
    const onCommandRef = useRef(onCommand);
    onOverscrollRef.current = onOverscroll;
    onCommandRef.current = onCommand;

    // Runs during render (server and client) rather than an effect, so a
    // sibling `BlossomDots` rendered after this carousel — server or client —
    // can seed its initial dot count before mount. Idempotent: safe to repeat
    // across re-renders and StrictMode's double-invoke.
    if (props.id) {
      setSlideCount(props.id, countMarkedSlides(children));
    }

    // Registered in a layout effect so commands work as soon as the carousel is
    // in the DOM: a parent's `useLayoutEffect` can call `goTo(i, { behavior:
    // "instant" })` to position the carousel before the first paint.
    useIsomorphicLayoutEffect(() => {
      const scroller = localRef.current;
      if (!scroller) return;

      const handleCommand = (event: Event) =>
        onCommandRef.current?.(event as BlossomCommandEvent);
      scroller.addEventListener("command", handleCommand);
      const unregister = registerCommands(scroller);

      return () => {
        unregister();
        scroller.removeEventListener("command", handleCommand);
      };
    }, []);

    useEffect(() => {
      const scroller = localRef.current;
      if (!scroller) return;

      const handleOverscroll = (event: Event) =>
        onOverscrollRef.current?.(event as BlossomOverscrollEvent);
      scroller.addEventListener("overscroll", handleOverscroll);
      return () => scroller.removeEventListener("overscroll", handleOverscroll);
    }, []);

    useEffect(() => {
      const scroller = localRef.current;
      if (!scroller) return;

      const hasMouse = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;

      if (!hasMouse && load !== "always") return;

      let destroyed = false;

      import("@blossom-carousel/core").then(({ Blossom }) => {
        if (destroyed || !localRef.current) return;

        const blossom = Blossom(localRef.current, { repeat });
        blossomRef.current = blossom;
        blossom.init();
      });

      return () => {
        destroyed = true;
        blossomRef.current?.destroy();
        blossomRef.current = null;
      };
    }, [repeat, load]);

    useImperativeHandle(
      parentRef,
      () => ({
        ...createCommands(() => localRef.current),
        get element() {
          return localRef.current;
        },
      }),
      [],
    );

    return (
      <Component ref={localRef} blossom-carousel="true" {...props}>
        {children}
      </Component>
    );
  },
);

BlossomCarousel.displayName = "BlossomCarousel";

export default BlossomCarousel;
