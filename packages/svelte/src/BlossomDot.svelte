<script lang="ts">
  import type { Snippet } from "svelte";
  import { getContext } from "svelte";
  import { COMMANDS } from "@blossom-carousel/navigation";
  import { DOT_CONTEXT, type DotContext } from "./dotContext.js";

  interface Props {
    behavior?: ScrollBehavior;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { behavior, children, ...rest }: Props = $props();

  const ctx = getContext<DotContext>(DOT_CONTEXT);
  if (!ctx) {
    console.warn("[BlossomDot] Must be used inside a BlossomDots slot.");
  }
</script>

<button
  type="button"
  data-blossom-dot
  command="{COMMANDS.gotoPrefix}{ctx?.index ?? 0}"
  commandfor={ctx?.forId ?? ""}
  aria-controls={ctx?.forId}
  aria-current={ctx?.active ?? false}
  aria-label={ctx ? `Go to slide ${ctx.index + 1}` : undefined}
  data-blossom-behavior={behavior ?? ctx?.behavior}
  {...rest}
>
  {@render children?.()}
</button>
