<template>
  <button
    blossom-next
    type="button"
    :command="command"
    :commandfor="props.for"
    :disabled="!state.canNext"
    :aria-controls="props.for"
    aria-label="Next slide"
  >
    <slot>›</slot>
  </button>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

const props = defineProps<{ for: string }>();

const command = COMMANDS.next;
const state = useNavigation(toRef(props, "for"));
</script>

<style scoped>
:where([blossom-next]) {
  touch-action: manipulation;
}
</style>
