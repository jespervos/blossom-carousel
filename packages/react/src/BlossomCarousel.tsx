import React, {
  ElementType,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  JSXElementConstructor,
} from "react";
import { countMarkedSlides } from "./countMarkedSlides";
import { setSlideCount } from "./slideRegistry";

export interface BlossomCarouselHandle {
  prev: (options?: { align?: string }) => void;
  next: (options?: { align?: string }) => void;
  element: HTMLElement | null;
}

export interface BlossomCarouselProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode | Array<ReactNode>;
  as?: ElementType;
  repeat?: boolean;
  load?: "always" | "conditional";
}

const BlossomCarousel = forwardRef<BlossomCarouselHandle, BlossomCarouselProps>(
  ({ children, as = "div", repeat = false, load = "conditional", ...props }, parentRef) => {
    const Component = as as JSXElementConstructor<any>;
    const localRef = useRef<HTMLElement>(null);
    const blossomRef = useRef<ReturnType<typeof import("@blossom-carousel/core").Blossom> | null>(null);

    // Runs during render (server and client) rather than an effect, so a
    // sibling `BlossomDots` rendered after this carousel — server or client —
    // can seed its initial dot count before mount. Idempotent: safe to repeat
    // across re-renders and StrictMode's double-invoke.
    if (props.id) {
      setSlideCount(props.id, countMarkedSlides(children));
    }

    useEffect(() => {
      if (!localRef.current) return;

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
        prev: (options?: { align?: string }) =>
          blossomRef.current?.prev(options),
        next: (options?: { align?: string }) =>
          blossomRef.current?.next(options),
        element: localRef.current,
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
