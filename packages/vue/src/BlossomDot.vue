<script setup lang="ts">
import { inject } from "vue";
import { COMMANDS } from "@blossom-carousel/navigation";
import { DOT_CONTEXT } from "./dotContext";

defineOptions({ inheritAttrs: false });

const ctx = inject(DOT_CONTEXT);
if (!ctx) {
  console.warn("[BlossomDot] Must be used inside a BlossomDots slot.");
}
</script>

<template>
  <button
    type="button"
    data-blossom-dot
    :command="`${COMMANDS.gotoPrefix}${ctx?.index ?? 0}`"
    :commandfor="ctx?.forId ?? ''"
    :aria-controls="ctx?.forId"
    :aria-current="ctx?.active ?? false"
    :aria-label="ctx ? `Go to slide ${ctx.index + 1}` : undefined"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
