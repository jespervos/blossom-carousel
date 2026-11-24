<template>
  <button
    blossom-prev
    type="button"
    :command="command"
    :commandfor="props.for"
    :disabled="!state.canPrev"
    :aria-controls="props.for"
    :data-blossom-behavior="props.behavior"
    aria-label="Previous slide"
  >
    <slot>‹</slot>
  </button>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useBlossomNavigation } from "./useNavigation";

const props = defineProps<{
  for: string;
  behavior?: ScrollBehavior;
}>();
// Declared explicitly: the inferred slot type refers to a generated helper
// variable that the declaration bundler drops, leaving a dangling name.
defineSlots<{ default?: () => unknown }>();

const command = COMMANDS.prev;
const state = useBlossomNavigation(toRef(props, "for"));
</script>

<style scoped>
:where([blossom-prev]) {
  touch-action: manipulation;
}
</style>
