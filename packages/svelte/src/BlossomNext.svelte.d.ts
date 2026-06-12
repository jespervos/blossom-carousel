import { SvelteComponent } from "svelte";

export interface BlossomNextProps {
  for: string;
}

export default class BlossomNext extends SvelteComponent<
  BlossomNextProps,
  Record<string, never>,
  { default: Record<string, never> }
> {}
