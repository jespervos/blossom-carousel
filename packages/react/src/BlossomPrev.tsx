import { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

export interface BlossomPrevProps {
  /** Id of the carousel scroller this control targets. */
  for: string;
  children?: ReactNode;
}

function BlossomPrev({ for: forId, children }: BlossomPrevProps) {
  const state = useNavigation(forId);

  // `command`/`commandfor` (Invoker Commands API) aren't in React's attribute
  // types yet; spreading keeps them type-safe without module augmentation.
  const commandAttrs = { command: COMMANDS.prev, commandfor: forId };

  return (
    <button
      type="button"
      disabled={!state.canPrev}
      aria-label="Previous"
      {...commandAttrs}
    >
      {children ?? "Previous"}
    </button>
  );
}

export default BlossomPrev;
