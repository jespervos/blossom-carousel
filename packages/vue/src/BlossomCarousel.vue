<template>
  <component :is="as" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from "vue";

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
let blossom;

defineExpose({
  el: root,
  next: () => blossom?.next(),
  prev: () => blossom?.prev(),
  currentIndex: () => blossom?.currentIndex(),
});
onMounted(async () => {
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  // don't load if the user has no mouse.
  // overwritten by props.load: 'always'
  if (!hasMouse && props.load !== "always") return;

  const { Blossom } = await import("@blossom-carousel/core");

  blossom = Blossom(root.value, { repeat: props.repeat });
  blossom.init();
});

onBeforeUnmount(() => {
  blossom?.destroy();
});
</script>
