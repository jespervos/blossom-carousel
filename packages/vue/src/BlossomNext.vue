<template>
  <button
    blossom-next
    type="button"
    :command="command"
    :commandfor="props.for"
    :disabled="!state.canNext"
    :aria-controls="props.for"
    :data-blossom-behavior="props.behavior"
    aria-label="Next slide"
  >
    <slot>›</slot>
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

const command = COMMANDS.next;
const state = useBlossomNavigation(toRef(props, "for"));
</script>

<style scoped>
:where([blossom-next]) {
  touch-action: manipulation;
}
</style>
