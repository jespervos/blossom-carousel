<template>
  <div class="blossom-dots" role="group" aria-label="Choose slide to display">
    <button
      v-for="(_, i) in state.count"
      :key="i"
      type="button"
      class="blossom-dot"
      :command="`${gotoPrefix}${i}`"
      :commandfor="props.for"
      :aria-current="state.activeIndex === i"
      :aria-label="`Go to slide ${i + 1}`"
    >
      <slot :index="i" :active="state.activeIndex === i" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

const props = defineProps<{ for: string }>();

const gotoPrefix = COMMANDS.gotoPrefix;
const state = useNavigation(toRef(props, "for"));
</script>

<!--
  Defaults are wrapped in :where() so they carry zero specificity: any consumer
  rule (e.g. a plain `.blossom-dot { ... }`) overrides them without specificity
  battles. The themeable values are also exposed as custom properties:
    --blossom-dots-gap, --blossom-dot-size, --blossom-dot-radius,
    --blossom-dot-color, --blossom-dot-opacity, --blossom-dot-hover-opacity,
    --blossom-dot-active-opacity
  These inherit, so they can be set on the component or any ancestor.
-->
<style scoped>
:where(.blossom-dots) {
  display: flex;
  gap: var(--blossom-dots-gap, 0.5rem);
  align-items: center;
  justify-content: center;
}

:where(.blossom-dot) {
  inline-size: var(--blossom-dot-size, 0.625rem);
  block-size: var(--blossom-dot-size, 0.625rem);
  padding: 0;
  border: 0;
  border-radius: var(--blossom-dot-radius, 50%);
  background: var(--blossom-dot-color, currentColor);
  opacity: var(--blossom-dot-opacity, 0.35);
  cursor: pointer;
  transition: opacity 0.2s ease;
  touch-action: manipulation;
}

:where(.blossom-dot:hover) {
  opacity: var(--blossom-dot-hover-opacity, 0.6);
}

:where(.blossom-dot[aria-current="true"]) {
  opacity: var(--blossom-dot-active-opacity, 1);
}

@media (prefers-reduced-motion: reduce) {
  :where(.blossom-dot) {
    transition: none;
  }
}
</style>
