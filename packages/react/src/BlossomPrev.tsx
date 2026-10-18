import React, { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useBlossomNavigation } from "./useNavigation";
import "./BlossomPrev.css";

export interface BlossomPrevProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  for: string;
  behavior?: ScrollBehavior;
  children?: ReactNode;
}

export default function BlossomPrev({
  for: carouselId,
  behavior,
  children = "Previous",
  disabled,
  ...props
}: BlossomPrevProps) {
  const state = useBlossomNavigation(carouselId);

  return (
    <button
      blossom-prev=""
      type="button"
      command={COMMANDS.prev}
      commandfor={carouselId}
      disabled={disabled ?? !state.canPrev}
      aria-controls={carouselId}
      aria-label="Previous slide"
      data-blossom-behavior={behavior}
      {...props}
    >
      {children}
    </button>
  );
}
