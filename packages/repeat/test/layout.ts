// A minimal inline layout for jsdom, which has none: the scroller's element children sit
// side by side from its start edge, each as wide as its `data-w` attribute (300 by default;
// a box with an inline `inline-size`, like the module's spacers, that wide), moved by an
// inline `translate`, and inline `display: none` ones take no room and have no box. Everything else
// has an empty box. A scroller is VIEW px wide and scrolls instantly, clamped.
export const VIEW = 1000;

const scrollers = new Set<HTMLElement>();
const proto = Element.prototype;
const original = { rect: proto.getBoundingClientRect, rects: proto.getClientRects };

const shown = (el: Element) => (el as HTMLElement).style?.display !== "none";
function width(el: Element) {
  if (!shown(el)) return 0;
  const inline = (el as HTMLElement).style?.getPropertyValue("inline-size");
  return parseFloat(inline || el.getAttribute("data-w") || "300");
}
const rect = (left: number, w: number, top = 0, h = 100) =>
  ({ left, right: left + w, x: left, y: top, top, bottom: top + h, width: w, height: h, toJSON() {} }) as DOMRect;

function scrollWidth(s: HTMLElement) {
  return Array.from(s.children).reduce((sum, el) => sum + width(el), 0);
}

function box(el: Element): DOMRect | null {
  if (isScroller(el)) return rect(0, VIEW);
  const s = el.parentElement;
  if (!s || !isScroller(s) || !shown(el)) return null;
  let x = 0;
  for (let n = el.previousElementSibling; n; n = n.previousElementSibling) x += width(n);
  const t = parseFloat((el as HTMLElement).style.getPropertyValue("translate")) || 0;
  return rect(x - s.scrollLeft + t, width(el));
}

/** A scroller in the layout with `count` slides (data-i, text i + 1). */
export function scrollerWith(count: number, { gap = "", w = 300 } = {}): HTMLElement {
  const s = document.createElement("div");
  s.innerHTML = Array.from({ length: count }, (_, i) => `<div class="slide" data-blossom-slide data-i="${i}" data-w="${w}">${i + 1}</div>`).join(gap);
  document.body.append(s);
  makeScroller(s);
  return s;
}

/** Lays out s as a scroller (elements with a `blossom-carousel` attribute are ones already). */
export function makeScroller(s: HTMLElement) {
  scrollers.add(s);
}
const isScroller = (el: Element) => scrollers.has(el as HTMLElement) || el.hasAttribute("blossom-carousel");
const lefts = new WeakMap<Element, number>();
const own = (name: string) => Object.getOwnPropertyDescriptor(Element.prototype, name)!;
const patched: Record<string, PropertyDescriptor> = {
  clientWidth: { get(this: HTMLElement) { return isScroller(this) ? VIEW : own("clientWidth").get!.call(this); } },
  scrollWidth: { get(this: HTMLElement) { return isScroller(this) ? Math.max(VIEW, scrollWidth(this)) : own("scrollWidth").get!.call(this); } },
  scrollLeft: {
    get(this: HTMLElement) { return isScroller(this) ? lefts.get(this) ?? 0 : own("scrollLeft").get!.call(this); },
    set(this: HTMLElement, v: number) {
      if (isScroller(this)) lefts.set(this, Math.max(0, Math.min(v, this.scrollWidth - VIEW)));
      else own("scrollLeft").set!.call(this, v);
    },
  },
  scrollTo: {
    value(this: HTMLElement, o: ScrollToOptions) {
      if (isScroller(this)) this.scrollLeft = o.left ?? this.scrollLeft;
    },
  },
  scrollBy: {
    value(this: HTMLElement, o: ScrollToOptions) {
      if (isScroller(this)) this.scrollLeft += o.left ?? 0;
    },
  },
};

/** A user scroll that ends at once: moves the scroll position, fires `scroll` and `scrollend`. */
export function userScroll(s: HTMLElement, left: number) {
  s.scrollLeft = left;
  s.dispatchEvent(new Event("scroll"));
  s.dispatchEvent(new Event("scrollend"));
}

type Callback = ResizeObserverCallback;
export const resizeObservers = new Set<{ cb: Callback; targets: Set<Element> }>();
class FakeResizeObserver {
  private entry: { cb: Callback; targets: Set<Element> };
  constructor(cb: Callback) {
    this.entry = { cb, targets: new Set() };
    resizeObservers.add(this.entry);
  }
  observe(el: Element) {
    this.entry.targets.add(el);
  }
  unobserve(el: Element) {
    this.entry.targets.delete(el);
  }
  disconnect() {
    resizeObservers.delete(this.entry);
  }
}
/** Delivers a resize notification to every observer that watches el. */
export function resized(el: Element) {
  for (const o of [...resizeObservers]) if (o.targets.has(el)) o.cb([], o as unknown as ResizeObserver);
}

export function installLayout() {
  proto.getBoundingClientRect = function (this: Element) {
    return box(this) ?? rect(0, 0, 0, 0);
  };
  proto.getClientRects = function (this: Element) {
    const b = box(this);
    return (b ? [b] : []) as unknown as DOMRectList;
  };
  (globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver;
  for (const [name, d] of Object.entries(patched)) Object.defineProperty(HTMLElement.prototype, name, { ...d, configurable: true });
}

export function uninstallLayout() {
  proto.getBoundingClientRect = original.rect;
  proto.getClientRects = original.rects;
  for (const s of scrollers) s.remove();
  scrollers.clear();
  resizeObservers.clear();
  delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  for (const name of Object.keys(patched)) delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Past the module's rest delay (150 ms after the last scroll, plus its 140 ms quiet time). */
export const rest = () => wait(320);

export const copies = (s: Element) => Array.from(s.querySelectorAll<HTMLElement>("[data-blossom-clone]"));
export const realSlides = (s: Element) =>
  Array.from(s.children).filter((c) => c.classList.contains("slide") && !c.hasAttribute("data-blossom-clone"));
