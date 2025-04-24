<template>
  <component :is="is" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup>
import { onMounted, onBeforeUnmount, shallowRef } from "vue";
// import { Blossom } from "../../core/dist/blossom-carousel-core.js";
// import "../../core/dist/blossom-carousel-core.css";
import { Blossom } from "../../core/src/index";
import "../../core/src/style.css";

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

const root = shallowRef(null);
defineExpose({ el: root });

let blossom = null;
onMounted(() => {
  blossom = Blossom(root.value, { repeat: props.repeat });
  blossom.init();
});
onBeforeUnmount(() => {
  blossom.destroy();
});
</script>
