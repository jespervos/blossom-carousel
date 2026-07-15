<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";
  import { DOT_CONTEXT, type DotContext } from "./dotContext.js";

  interface Props {
    index: number;
    active: boolean;
    forId: string;
    children: Snippet<[{ index: number; active: boolean }]>;
  }

  let { index, active, forId, children }: Props = $props();

  setContext(DOT_CONTEXT, {
    get index() {
      return index;
    },
    get active() {
      return active;
    },
    get forId() {
      return forId;
    },
  } satisfies DotContext);
</script>

{@render children({ index, active })}
