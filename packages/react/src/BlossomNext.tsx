import React, { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useBlossomNavigation } from "./useNavigation";
import "./BlossomNext.css";

export interface BlossomNextProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  for: string;
  behavior?: ScrollBehavior;
  children?: ReactNode;
}

export default function BlossomNext({
  for: carouselId,
  behavior,
  children = "Next",
  disabled,
  ...props
}: BlossomNextProps) {
  const state = useBlossomNavigation(carouselId);

  return (
    <button
      blossom-next=""
      type="button"
      command={COMMANDS.next}
      commandfor={carouselId}
      disabled={disabled ?? !state.canNext}
      aria-controls={carouselId}
      aria-label="Next slide"
      data-blossom-behavior={behavior}
      {...props}
    >
      {children}
    </button>
  );
}
