<script setup lang="ts">
import { Comment, toRef, type VNode } from "vue";
import { COMMANDS } from "@blossom-carousel/navigation";
import DotScope from "./DotScope.vue";
import { useNavigation } from "./useNavigation";

defineOptions({ inheritAttrs: false });

const props = defineProps<{ for: string }>();
const slots = defineSlots<{
  default?: (props: { index: number; active: boolean }) => VNode[];
}>();

const gotoPrefix = COMMANDS.gotoPrefix;
const state = useNavigation(toRef(props, "for"));

/** Slot exists even for comment-only content between tags; ignore those. */
function usesCustomSlot(): boolean {
  return (slots.default?.({ index: 0, active: false }) ?? []).some(
    (node) => node.type !== Comment,
  );
}
</script>

<template>
  <div data-blossom-dots role="group" aria-label="Choose slide to display">
    <template v-if="usesCustomSlot()">
      <DotScope
        v-for="(_, i) in state.count"
        :key="`dot-${i}`"
        :index="i"
        :active="state.activeIndex === i"
        :for-id="props.for"
      >
        <slot :index="i" :active="state.activeIndex === i" />
      </DotScope>
    </template>
    <template v-else>
      <button
        v-for="(_, i) in state.count"
        :key="`dot-${i}`"
        type="button"
        data-blossom-dot
        :command="`${gotoPrefix}${i}`"
        :commandfor="props.for"
        :aria-controls="props.for"
        :aria-current="state.activeIndex === i"
        :aria-label="`Go to slide ${i + 1}`"
      >
        <span data-blossom-dot-marker />
      </button>
    </template>
  </div>
</template>
