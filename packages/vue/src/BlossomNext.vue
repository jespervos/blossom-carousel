<template>
  <button
    type="button"
    :command="command"
    :commandfor="props.for"
    :disabled="!state.canNext"
    aria-label="Next"
  >
    <slot>Next</slot>
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
