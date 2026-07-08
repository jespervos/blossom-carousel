import { Children, isValidElement, type ReactNode } from "react";

const SLIDE_ATTR = "data-blossom-slide";

function hasSlideMarker(props: unknown): boolean {
  return !!props && typeof props === "object" && SLIDE_ATTR in props;
}

function walk(children: ReactNode): number {
  let count = 0;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (hasSlideMarker(child.props)) {
      count++;
    }

    const nestedChildren = (child.props as { children?: ReactNode } | null)?.children;
    if (nestedChildren !== undefined) {
      count += walk(nestedChildren);
    }
  });

  return count;
}

/** Counts elements flagged with `data-blossom-slide`, depth-agnostically. */
export function countMarkedSlides(children: ReactNode): number {
  return walk(children);
}
