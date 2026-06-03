<template>
  <button
    type="button"
    :command="command"
    :commandfor="props.for"
    :disabled="!state.canPrev"
    aria-label="Previous"
  >
    <slot>Previous</slot>
  </button>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { COMMANDS } from "@blossom-carousel/navigation";
import { useNavigation } from "./useNavigation";

const props = defineProps<{ for: string }>();

const command = COMMANDS.prev;
const state = useNavigation(toRef(props, "for"));
</script>
