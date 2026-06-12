import { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

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
      type="button"
      disabled={!state.canNext}
      aria-label="Next"
      {...commandAttrs}
    >
      {children ?? "Next"}
    </button>
  );
}

export default BlossomNext;
