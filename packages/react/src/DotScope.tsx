import React, { type ReactNode } from "react";
import { DotContext } from "./dotContext";

export interface DotScopeProps {
  index: number;
  active: boolean;
  forId: string;
  children: ReactNode;
}

export default function DotScope({
  index,
  active,
  forId,
  children,
}: DotScopeProps) {
  return (
    <DotContext.Provider value={{ index, active, forId }}>
      {children}
    </DotContext.Provider>
  );
}
