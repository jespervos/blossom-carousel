import { SvelteComponentTyped } from "svelte";

export interface BlossomCarouselProps {
  as?: string;
  [key: string]: any;
}

export default class BlossomCarousel extends SvelteComponentTyped<
  BlossomCarouselProps,
  {},
  { default: {} }
> {}
