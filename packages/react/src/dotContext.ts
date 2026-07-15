import { createContext } from "react";

export interface DotContext {
  index: number;
  active: boolean;
  forId: string;
}

export const DotContext = createContext<DotContext | null>(null);
