<template>
  <div class="blossom-dots" role="group" aria-label="Choose slide to display">
    <button
      v-for="(_, i) in state.count"
      :key="i"
      type="button"
      class="blossom-dot"
      :command="`${gotoPrefix}${i}`"
      :commandfor="props.for"
      :aria-current="state.activeIndex === i ? 'true' : undefined"
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
  Dot defaults live in @blossom-carousel/vue/style.css and are wrapped in
  :where() so they carry zero specificity: any consumer rule (e.g. a plain
  `.blossom-dot { ... }`) overrides them without specificity battles.
  The themeable values are also exposed as custom properties:
    --blossom-dots-gap, --blossom-dot-size, --blossom-dot-radius,
    --blossom-dot-color, --blossom-dot-opacity, --blossom-dot-hover-opacity,
    --blossom-dot-active-opacity
  These inherit, so they can be set on the component or any ancestor.
-->
