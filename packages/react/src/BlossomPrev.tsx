import React, { ReactNode } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

export interface BlossomPrevProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  for: string;
  children?: ReactNode;
}

export default function BlossomPrev({
  for: carouselId,
  children = "Previous",
  disabled,
  ...props
}: BlossomPrevProps) {
  const state = useNavigation(carouselId);

  return (
    <button
      type="button"
      command={COMMANDS.prev}
      commandfor={carouselId}
      disabled={disabled ?? !state.canPrev}
      aria-label="Previous"
      {...props}
    >
      {children}
    </button>
  );
}
