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
  load: {
    type: String,
    default: "conditional",
  },
});

const root = shallowRef(null);
defineExpose({ el: root });

let blossom = null;
onMounted(async () => {
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  // don't load if the user has no mouse.
  // overwritten by props.load: 'always'
  if (!hasMouse && props.load !== "always") return;

  const { Blossom } = await import("../../core/src/index");

  blossom = Blossom(root.value);
  blossom.init();
});
onBeforeUnmount(() => {
  blossom?.destroy();
});
</script>
