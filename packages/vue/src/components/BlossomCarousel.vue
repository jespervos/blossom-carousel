<template>
  <component :is="is" ref="scroller" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
import { Blossom } from "@blossom-carousel/core";

const props = defineProps({
  is: {
    type: String,
    default: "div",
  },
  repeat: {
    type: Boolean,
    default: false,
  },
});

const scroller = shallowRef(null);
defineExpose({ el: scroller });

let blossom = null;
onMounted(() => {
  blossom = Blossom(scroller.value);
  blossom.init();
});
onBeforeUnmount(() => {
  blossom.destroy();
});
</script>
