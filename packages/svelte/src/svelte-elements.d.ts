import "svelte/elements";

declare module "svelte/elements" {
  export interface HTMLAttributes<T extends EventTarget> {
    "blossom-carousel"?: string;
  }
}
