<template>
  <component :is="as" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
import "@blossom-carousel/core/style.css";

const props = defineProps({
  as: {
    type: String,
    default: "div",
  },
  repeat: {
    type: Boolean,
    default: false,
  },
});

const root = shallowRef(null);
defineExpose({ el: root });

let blossom = null;
onMounted(async () => {
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  if (!hasMouse) return;

  const { Blossom } = await import("@blossom-carousel/core");

  blossom = Blossom(root.value);
  blossom.init();
});
onBeforeUnmount(() => {
  blossom?.destroy();
});
</script>
