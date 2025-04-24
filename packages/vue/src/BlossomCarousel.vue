<template>
  <component :is="as" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
import { Blossom } from "@blossom-carousel/core";
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
onMounted(() => {
  blossom = Blossom(root.value);
  blossom.init();
});
onBeforeUnmount(() => {
  blossom.destroy();
});
</script>
