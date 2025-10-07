import { Blossom } from "@blossom-carousel/core";
import {
  ElementType,
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const BlossomCarousel = forwardRef(
  (
    {
      children,
      as: Component = "div",
      repeat = false,
      ...props
    }: {
      children?: ReactNode | Array<ReactNode>;
      as?: ElementType;
      repeat?: boolean;

      [key: string]: unknown;
    },
    parentRef:
      | RefObject<HTMLElement | null>
      | null
      | ((instance: HTMLElement | null) => void)
  ) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (!localRef.current) return;

      const blossom = Blossom(localRef.current, { repeat });

      blossom.init();

      return () => {
        blossom.destroy();
      };
    }, [repeat]);

    useImperativeHandle<HTMLElement | null, HTMLElement | null>(
      parentRef,
      () => localRef.current
    );

    return (
      <Component ref={localRef} blossom-carousel="true" {...props}>
        {children}
      </Component>
    );
  }
);

BlossomCarousel.displayName = "BlossomCarousel";

export default BlossomCarousel;
