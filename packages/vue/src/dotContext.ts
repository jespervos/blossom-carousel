import type { InjectionKey } from "vue";

export interface DotContext {
  index: number;
  active: boolean;
  forId: string;
}

export const DOT_CONTEXT: InjectionKey<DotContext> = Symbol("blossom-dot");
