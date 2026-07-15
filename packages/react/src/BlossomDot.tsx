import React, { useContext } from "react";
import { COMMANDS } from "@blossom-carousel/navigation";
import { DotContext } from "./dotContext";

export interface BlossomDotProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {}

export default function BlossomDot({ children, ...props }: BlossomDotProps) {
  const ctx = useContext(DotContext);
  if (!ctx) {
    console.warn("[BlossomDot] Must be used inside a BlossomDots slot.");
  }

  return (
    <button
      type="button"
      data-blossom-dot
      command={`${COMMANDS.gotoPrefix}${ctx?.index ?? 0}`}
      commandfor={ctx?.forId ?? ""}
      aria-controls={ctx?.forId}
      aria-current={ctx?.active ?? false}
      aria-label={ctx ? `Go to slide ${ctx.index + 1}` : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
