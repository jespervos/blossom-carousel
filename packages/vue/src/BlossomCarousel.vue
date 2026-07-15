<template>
  <component :is="as" ref="root" blossom-carousel="true">
    <slot />
  </component>
</template>

<script lang="ts">
import { Comment, Fragment, isVNode, type VNode } from "vue";
import { SLIDE_ATTR } from "@blossom-carousel/navigation";

function hasSlideMarker(props: VNode["props"]): boolean {
  if (!props) return false;
  return SLIDE_ATTR in props || "dataBlossomSlide" in props;
}

function collectChildVnodes(vnode: VNode): VNode[] {
  const { children } = vnode;
  if (!children) return [];
  if (Array.isArray(children)) {
    return children.filter(isVNode);
  }
  if (typeof children === "object" && "default" in children) {
    const slot = children.default;
    if (typeof slot === "function") {
      return slot().filter(isVNode);
    }
  }
  return [];
}

function walkVnodes(vnodes: VNode[]): number {
  let count = 0;

  for (const vnode of vnodes) {
    if (!isVNode(vnode) || vnode.type === Comment) continue;

    if (hasSlideMarker(vnode.props)) {
      count++;
    }

    if (vnode.type === Fragment || vnode.children) {
      count += walkVnodes(collectChildVnodes(vnode));
    }
  }

  return count;
}

/** Counts slot vnodes flagged with `data-blossom-slide`, depth-agnostically. */
export function countMarkedSlideVnodes(vnodes: VNode[]): number {
  return walkVnodes(vnodes);
}
</script>

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
import { setSlideCount } from "./useNavigation";

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
