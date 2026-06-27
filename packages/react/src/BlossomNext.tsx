import { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";
import "./BlossomNext.css";

export interface BlossomNextProps {
  /** Id of the carousel scroller this control targets. */
  for: string;
  children?: ReactNode;
}

function BlossomNext({ for: forId, children }: BlossomNextProps) {
  const state = useNavigation(forId);

  // `command`/`commandfor` (Invoker Commands API) aren't in React's attribute
  // types yet; spreading keeps them type-safe without module augmentation.
  const commandAttrs = { command: COMMANDS.next, commandfor: forId };

  return (
    <button
      blossom-next=""
      type="button"
      disabled={!state.canNext}
      aria-controls={forId}
      aria-label="Next slide"
      {...commandAttrs}
    >
      {children ?? "›"}
    </button>
  );
}

export default BlossomNext;
