import { createContext } from "react";

export interface DotContext {
  index: number;
  active: boolean;
  forId: string;
  behavior?: ScrollBehavior;
}

export const DotContext = createContext<DotContext | null>(null);
