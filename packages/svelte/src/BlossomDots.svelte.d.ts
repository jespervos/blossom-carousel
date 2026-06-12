import { SvelteComponent } from "svelte";

export interface BlossomDotsProps {
  for: string;
}

export default class BlossomDots extends SvelteComponent<
  BlossomDotsProps,
  Record<string, never>,
  { default: { index: number; active: boolean } }
> {}
