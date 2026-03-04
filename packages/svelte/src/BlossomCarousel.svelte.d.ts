import { SvelteComponent } from "svelte";

export interface BlossomCarouselProps {
  as?: string;
  load?: "always" | "conditional";
  repeat?: boolean;
  [key: string]: any;
}

export default class BlossomCarousel extends SvelteComponent<BlossomCarouselProps> {
  prev(options?: { align?: string }): void;
  next(options?: { align?: string }): void;
}
