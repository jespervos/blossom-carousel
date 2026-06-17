import React, { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

export interface BlossomNextProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  for: string;
  children?: ReactNode;
}

export default function BlossomNext({
  for: carouselId,
  children = "Next",
  disabled,
  ...props
}: BlossomNextProps) {
  const state = useNavigation(carouselId);

  return (
    <button
      type="button"
      command={COMMANDS.next}
      commandfor={carouselId}
      disabled={disabled ?? !state.canNext}
      aria-label="Next"
      {...props}
    >
      {children}
    </button>
  );
}
