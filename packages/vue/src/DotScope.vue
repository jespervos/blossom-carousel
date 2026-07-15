<script setup lang="ts">
import { provide } from "vue";
import { DOT_CONTEXT } from "./dotContext";

const props = defineProps<{
  index: number;
  active: boolean;
  forId: string;
}>();

provide(DOT_CONTEXT, props);
</script>

<template>
  <slot />
</template>
