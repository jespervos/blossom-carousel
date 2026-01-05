import { Blossom } from "@blossom-carousel/core";
import {
  ElementType,
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  JSXElementConstructor,
  ReactElement,
} from "react";

export interface BlossomCarouselHandle {
  prev: (options?: { align?: string }) => void;
  next: (options?: { align?: string }) => void;
  element: HTMLElement | null;
}

const BlossomCarousel = forwardRef<
  BlossomCarouselHandle,
  {
    children?: ReactNode | Array<ReactNode>;
    as?: ElementType;
    repeat?: boolean;
    [key: string]: unknown;
  }
>(({ children, as = "div", repeat = false, ...props }, parentRef) => {
  const Component = as as JSXElementConstructor<any>;
  const localRef = useRef<HTMLElement>(null);
  const blossomRef = useRef<ReturnType<typeof Blossom> | null>(null);

  useEffect(() => {
    if (!localRef.current) return;

    const blossom = Blossom(localRef.current, { repeat });
    blossomRef.current = blossom;

    blossom.init();

    return () => {
      blossom.destroy();
    };
  }, [repeat]);

  useImperativeHandle(
    parentRef,
    () => ({
      prev: (options?: { align?: string }) => blossomRef.current?.prev(options),
      next: (options?: { align?: string }) => blossomRef.current?.next(options),
      element: localRef.current,
    }),
    []
  );

  return (
    <Component ref={localRef} blossom-carousel="true" {...props}>
      {children}
    </Component>
  );
});

BlossomCarousel.displayName = "BlossomCarousel";

export default BlossomCarousel;
