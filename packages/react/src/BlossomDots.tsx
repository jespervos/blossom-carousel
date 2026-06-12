import { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";
import "./dots.css";

export interface BlossomDotsProps {
  /** Id of the carousel scroller this control targets. */
  for: string;
  /** Optional custom dot content, rendered inside each dot button. */
  children?: (props: { index: number; active: boolean }) => ReactNode;
}

function BlossomDots({ for: forId, children }: BlossomDotsProps) {
  const state = useNavigation(forId);

  return (
    <div
      className="blossom-dots"
      role="group"
      aria-label="Choose slide to display"
    >
      {Array.from({ length: state.count }, (_, i) => {
        const active = state.activeIndex === i;
        // `command`/`commandfor` (Invoker Commands API) aren't in React's
        // attribute types yet; spreading avoids module augmentation.
        const commandAttrs = {
          command: `${COMMANDS.gotoPrefix}${i}`,
          commandfor: forId,
        };
        return (
          <button
            key={i}
            type="button"
            className="blossom-dot"
            aria-current={active ? "true" : undefined}
            aria-label={`Go to slide ${i + 1}`}
            {...commandAttrs}
          >
            {children?.({ index: i, active })}
          </button>
        );
      })}
    </div>
  );
}

export default BlossomDots;
