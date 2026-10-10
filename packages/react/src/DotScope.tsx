import React, { type ReactNode } from "react";
import { DotContext } from "./dotContext";

export interface DotScopeProps {
  index: number;
  active: boolean;
  forId: string;
  behavior?: ScrollBehavior;
  children: ReactNode;
}

export default function DotScope({
  index,
  active,
  forId,
  behavior,
  children,
}: DotScopeProps) {
  return (
    <DotContext.Provider value={{ index, active, forId, behavior }}>
      {children}
    </DotContext.Provider>
  );
}
