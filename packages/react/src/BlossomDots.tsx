import React, { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

export interface BlossomDotsProps {
  for: string;
  children?: (props: { index: number; active: boolean }) => ReactNode;
}

export default function BlossomDots({ for: carouselId, children }: BlossomDotsProps) {
  const state = useNavigation(carouselId);

  return (
    <div className="blossom-dots" role="group" aria-label="Choose slide to display">
      {Array.from({ length: state.count }, (_, index) => (
        <button
          key={index}
          type="button"
          className="blossom-dot"
          command={`${COMMANDS.gotoPrefix}${index}`}
          commandfor={carouselId}
          aria-current={state.activeIndex === index}
          aria-label={`Go to slide ${index + 1}`}
        >
          {children?.({ index, active: state.activeIndex === index })}
        </button>
      ))}
    </div>
  );
}
