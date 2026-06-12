import { SvelteComponent } from "svelte";

export interface BlossomPrevProps {
  for: string;
}

export default class BlossomPrev extends SvelteComponent<
  BlossomPrevProps,
  Record<string, never>,
  { default: Record<string, never> }
> {}
