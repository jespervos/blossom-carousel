<template>
  <component :is="as" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
// import { Blossom } from "../../core/dist/blossom-carousel-core.js";
// import "../../core/dist/blossom-carousel-core.css";
// import { Blossom } from "../../core/src/index";
import "../../core/src/style.css";

const props = defineProps({
  as: {
    type: String,
    default: "div",
  },
  repeat: {
    type: Boolean,
    default: false,
  },
  lazy: {
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
  if (hasMouse) return;

  const { Blossom } = await import("@blossom-carousel/core");

  blossom = Blossom(root.value, { repeat: props.repeat });
  blossom.init();
});
onBeforeUnmount(() => {
  blossom?.destroy();
});
</script>
