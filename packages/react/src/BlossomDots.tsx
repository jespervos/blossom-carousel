import React, { type ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import DotScope from "./DotScope";
import { useNavigation } from "./useNavigation";

export interface BlossomDotsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  for: string;
  children?: (props: { index: number; active: boolean }) => ReactNode;
}

const gotoPrefix = COMMANDS.gotoPrefix;

function usesCustomRender(
  render: BlossomDotsProps["children"],
): render is NonNullable<BlossomDotsProps["children"]> {
  if (!render) return false;
  const probe = render({ index: 0, active: false });
  return probe != null && typeof probe !== "boolean";
}

export default function BlossomDots({
  for: carouselId,
  children,
  ...props
}: BlossomDotsProps) {
  const state = useNavigation(carouselId);
  const custom = usesCustomRender(children);

  return (
    <div
      data-blossom-dots
      role="group"
      aria-label="Choose slide to display"
      {...props}
    >
      {custom
        ? Array.from({ length: state.count }, (_, index) => {
            const active = state.activeIndex === index;
            return (
              <DotScope
                key={index}
                index={index}
                active={active}
                forId={carouselId}
              >
                {children({ index, active })}
              </DotScope>
            );
          })
        : Array.from({ length: state.count }, (_, index) => (
            <button
              key={index}
              type="button"
              data-blossom-dot=""
              command={`${gotoPrefix}${index}`}
              commandfor={carouselId}
              aria-controls={carouselId}
              aria-current={state.activeIndex === index}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span data-blossom-dot-marker="" />
            </button>
          ))}
    </div>
  );
}
