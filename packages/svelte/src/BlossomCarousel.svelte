<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { Snippet } from "svelte";
  import type { Blossom } from "@blossom-carousel/core";
  import { registerSlideCountFromSnippet } from "./ssrSlideCount.js";
  import { deleteSlideCount } from "./slideRegistry.js";

  interface Props {
    as?: string;
    load?: "always" | "conditional";
    repeat?: boolean;
    children?: Snippet;
    [key: string]: unknown;
  }

  let {
    as = "div",
    load = "conditional",
    repeat = false,
    children,
    ...rest
  }: Props = $props();

  // Runs once, during component construction — server and client — so a
  // sibling BlossomDots rendered after this carousel in document order can
  // seed its initial dot count before mount, mirroring the Vue/React SSR
  // fix. Intentionally not reactive to later `id`/children changes: SSR
  // renders a fresh instance per request, and live updates after mount are
  // handled by observeNavigationState instead.
  // svelte-ignore state_referenced_locally
  const registeredId = typeof rest.id === "string" ? rest.id : undefined;
  if (registeredId) {
    // svelte-ignore state_referenced_locally
    registerSlideCountFromSnippet(registeredId, children);
  }

  let root: HTMLElement | undefined;
  let blossom: ReturnType<typeof Blossom> | undefined;

  onMount(async () => {
    if (root) {
      const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      // don't load if the user has no mouse.
      // overwritten by props.load: 'always'
      if (!hasMouse && load !== "always") return;

      const { Blossom } = await import("@blossom-carousel/core");

      blossom = Blossom(root, { repeat });
      blossom.init();
    }
  });

  onDestroy(() => {
    blossom?.destroy();
    // On the server, onDestroy runs when the request's render completes —
    // after any sibling navigation components have read the count — so this
    // releases the registry entry per request (see slideRegistry.ts).
    if (registeredId) deleteSlideCount(registeredId);
  });

  export function prev(options?: { align?: string }) {
    blossom?.prev(options);
  }

  export function next(options?: { align?: string }) {
    blossom?.next(options);
  }
</script>

<svelte:element this={as} bind:this={root} blossom-carousel="true" {...rest}>
  {@render children?.()}
</svelte:element>
