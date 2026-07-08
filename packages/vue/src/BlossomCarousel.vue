<template>
  <component :is="as" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  useAttrs,
  useSlots,
  watchEffect,
} from "vue";
import { countMarkedSlideVnodes } from "./countMarkedSlides";
import { setSlideCount } from "./slideRegistry";

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

let blossom = null as any;
const root = shallowRef<HTMLElement | null>(null);
const attrs = useAttrs();
const slots = useSlots();
const app = getCurrentInstance()!.appContext.app;

watchEffect(() => {
  const id = attrs.id as string | undefined;
  if (!id) return;

  const vnodes = slots.default?.() ?? [];
  setSlideCount(app, id, countMarkedSlideVnodes(vnodes));
});

defineExpose({
  el: root,
  prev: () => blossom?.prev({ align: "center" }),
  next: () => blossom?.next({ align: "center" }),
});

onMounted(async () => {
  const hasMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  // don't load if the user has no mouse.
  // overwritten by props.load: 'always'
  if (!hasMouse && props.load !== "always") return;

  const { Blossom } = await import("@blossom-carousel/core");

  if (root.value) {
    blossom = Blossom(root.value, { repeat: props.repeat });
    blossom.init();
  }
});
onBeforeUnmount(() => {
  blossom?.destroy();
});
</script>
