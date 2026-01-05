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
    const blossomRef = useRef<InstanceType<typeof Blossom> | null>(null);

    useEffect(() => {
      if (!localRef.current) return;

      const blossom = Blossom(localRef.current, { repeat });
      blossomRef.current = blossom;

      blossom.init();

      return () => {
        blossom.destroy();
      };
    }, [repeat]);

    useImperativeHandle(parentRef, () => ({
      prev: () => blossomRef.current?.prev(),
      next: () => blossomRef.current?.next(),
      element: localRef.current,
    }));

    return (
      <Component ref={localRef} blossom-carousel="true" {...props}>
        {children}
      </Component>
    );
  }
);

BlossomCarousel.displayName = "BlossomCarousel";

export default BlossomCarousel;
