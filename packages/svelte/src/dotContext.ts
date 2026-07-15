export const DOT_CONTEXT = Symbol("blossom-dot");

export interface DotContext {
  index: number;
  active: boolean;
  forId: string;
}
