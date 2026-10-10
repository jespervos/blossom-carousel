<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";
  import { DOT_CONTEXT, type DotContext } from "./dotContext.js";

  interface Props {
    index: number;
    active: boolean;
    forId: string;
    behavior?: ScrollBehavior;
    children: Snippet<[{ index: number; active: boolean }]>;
  }

  let { index, active, forId, behavior, children }: Props = $props();

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
    get behavior() {
      return behavior;
    },
  } satisfies DotContext);
</script>

{@render children({ index, active })}
