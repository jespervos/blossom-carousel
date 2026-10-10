import type { InjectionKey } from "vue";

export interface DotContext {
  index: number;
  active: boolean;
  forId: string;
  behavior?: ScrollBehavior;
}

export const DOT_CONTEXT: InjectionKey<DotContext> = Symbol("blossom-dot");
