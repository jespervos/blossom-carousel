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
