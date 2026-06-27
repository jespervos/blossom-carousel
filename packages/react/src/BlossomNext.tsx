import React, { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";
import "./BlossomNext.css";

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
      blossom-next=""
      type="button"
      command={COMMANDS.next}
      commandfor={carouselId}
      disabled={disabled ?? !state.canNext}
      aria-controls={carouselId}
      aria-label="Next slide"
      {...props}
    >
      {children}
    </button>
  );
}
