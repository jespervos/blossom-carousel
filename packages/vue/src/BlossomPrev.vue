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
import { useNavigation } from "./useNavigation";

const props = defineProps<{
  for: string;
  behavior?: ScrollBehavior;
}>();

const command = COMMANDS.prev;
const state = useNavigation(toRef(props, "for"));
</script>

<style scoped>
:where([blossom-prev]) {
  touch-action: manipulation;
}
</style>
