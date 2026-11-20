// Looping for any horizontal scroller, from the outside. The slides stay where they are, in
// the middle of a very long scroll range. Sets of copies are laid out once, around the slides,
// and are shown in other loops with the CSS translate property only: from build to the next
// rest nothing is inserted, removed or resized, so the layout (and scrollWidth) never changes
// while a scroll is under way. As the view travels, the set furthest behind it is translated
// ahead of it, only while it is off screen both where it was and where it goes. The scroll
// position is not touched while a scroll is under way: only at rest is it moved back, by whole
// loops, onto the real slides.
//
// Where the scroll can snap is kept apart from what is drawn: copies do not snap. In their
// place a fixed lattice of empty snap markers, one per slide per loop, hangs from the start
// edge of the lead box, which never moves. So the list of snap positions never changes.
//
// The slides belong to the page (or a framework): they are never moved, and nothing is
// written on them. Everything this module adds is its own, and is all that it moves.
export const CLONE_ATTR = "data-blossom-clone";
const FOCUSABLE = "a,button,input,select,textarea,summary,iframe,[tabindex],[contenteditable],[controls]";
const CONTROLS = "button,input,select,textarea,fieldset,output,object";
const STRIP = ["id", "name", "for", "form", "autofocus", "data-blossom-slide"];
const ROOM = 500000; // px of scroll range each side of the slides, at most
const MARKS = 1000; // snap markers each side of the slides, about, which bounds the range when slides snap
// px of copies left past each end of the view at any scroll event: an iPhone drew a frame 2722 px
// past the last scroll event (a fast flick, 129 ms between events), before its handler ran
const MARGIN = 4500;
const AHEAD = 2 * MARGIN; // px of copies laid out past each end of the view
const REACH = AHEAD + 2000; // the same when the slides snap: fewer moves, and more chances to make one on a snap position

const HOLD = 2000; // ms more to wait for a rest after a touch scroll that stopped dead

export type RepeatOptions = Record<string, never>;
export interface Repeat {
  /** Re-measures at the next rest, for changes the module cannot observe. */
  refresh(): void;
  /** Removes every node and style the module added. */
  destroy(): void;
}

// home: the loop the set is laid out in; slot: the loop it is shown in; t: its translate, px along the inline axis
type CopySet = { home: number; slot: number; t: number; els: HTMLElement[]; nodes: ChildNode[] };
// Internal test hook (window.__repeatDebug), read only while it is set.
type Debug = { arrange?: (phase: "before" | "after", c: number, moved: ChildNode[]) => void; shift?: (d: number) => void };
const debug = () => (window as unknown as { __repeatDebug?: Debug }).__repeatDebug;
const active = new WeakMap<HTMLElement, Repeat>();

export function createRepeat(scroller: HTMLElement, _options: RepeatOptions = {}): Repeat {
  active.get(scroller)?.destroy(); // one instance per scroller: a second one would copy the first one's copies
  const mine = new WeakSet<Node>();
  const watched = new WeakSet<Element>();
  const origin = new WeakMap<Element, Element>(); // copy -> the real slide it copies
  const hadStyle = scroller.hasAttribute("style");
  let sets: CopySet[] = [];
  let spacers: HTMLElement[] = []; // lead, trail, parity
  let snapping = false; // the slides (or elements in them) snap: copies do not, the lattice does
  let targets: Element[] = []; // what snaps in the real slides
  let room = ROOM;
  let at0 = NaN; // where the first slide is, from the lead's start edge
  let head: Element = scroller, i0 = 0; // the first slide with a box, and its index among the slides
  let loop = 0; // length of one set of slides, px
  let side = 0; // sets of copies laid out each side of the slides
  let cur = 0; // the loop the view is in: 0 is the real slides
  let signature = "";
  let touching = false, lastTouch = -1e9, lastScroll = 0, timer = 0, dead = false;
  let pressed = 0; // when a touch pointer went down, while it is down
  let speed = 0, lastPos = 0; // px/s of the last step of the scroll
  let ended = true; // the browser said scrollend since the last scroll
  let stale = false; // a slide or the scroller resized while not at rest
  let anchoring: string | null = null;

  const rtl = () => getComputedStyle(scroller).direction === "rtl";
  // along the inline axis, from the start edge
  const pos = (el: Element) => (rtl() ? -el.getBoundingClientRect().right : el.getBoundingClientRect().left);
  const off = (el: Element) => pos(el) - pos(spacers[0]);
  const viewStart = () => {
    const r = scroller.getBoundingClientRect();
    return rtl() ? -(r.left + scroller.clientLeft + scroller.clientWidth) : r.left + scroller.clientLeft;
  };
  const slides = () => Array.from(scroller.children).filter((el) => !mine.has(el) && !/^(SCRIPT|STYLE|TEMPLATE)$/.test(el.tagName));
  // slides with a box (display: none ones are copied, but not measured)
  const drawn = () => slides().filter((el) => el.getClientRects().length > 0);
  const quiet = () => performance.now() - lastScroll;
  // A touch scroll that stopped dead, not slowing down: a finger most likely caught it and holds
  // still, which iOS may not tell the page (no touch or pointer event at all): wait longer for it.
  const need = () => (ended ? 140 : 500) + (lastTouch > -1e9 && speed > 300 ? HOLD : 0);
  const atRest = () =>
    !touching && !(pressed && performance.now() - pressed < 5000) &&
    performance.now() - lastTouch > 150 && // momentum starts a moment after the finger lifts
    scroller.getAttribute("has-snap") !== "false" && // core's drag ticker is idle
    quiet() > need();
  // instant, so scroll-behavior: smooth does not animate it
  const shift = (d: number) =>
    Math.abs(d) > 0.01 && (debug()?.shift?.(d), scroller.scrollTo({ left: scroller.scrollLeft + d * (rtl() ? -1 : 1), behavior: "instant" }));
  // At rest, while the snap positions themselves change: nothing snaps until they are back.
  function still(fn: () => void) {
    const st = scroller.style, v = st.getPropertyValue("scroll-snap-type"), p = st.getPropertyPriority("scroll-snap-type");
    st.setProperty("scroll-snap-type", "none", "important"), void scroller.offsetWidth;
    try { fn(); } finally { void scroller.offsetWidth, v ? st.setProperty("scroll-snap-type", v, p) : st.removeProperty("scroll-snap-type"); }
  }

  function copy(real: Element[], gap: Text | null, home: number): CopySet {
    const els: HTMLElement[] = [], body: ChildNode[] = [];
    real.forEach((el, i) => {
      if (i && gap) body.push(gap.cloneNode() as Text);
      const c = el.cloneNode(true) as HTMLElement, src = [el, ...el.querySelectorAll("*")];
      [c, ...c.querySelectorAll<HTMLElement>("*")].forEach((e, j) => {
        for (const a of STRIP) e.removeAttribute(a);
        if (targets.includes(src[j])) e.style.setProperty("scroll-snap-align", "none", "important"); // the lattice snaps for it
      });
      c.setAttribute(CLONE_ATTR, "");
      c.setAttribute("aria-hidden", "true");
      // seen and clickable (see onClick), but not reachable by keyboard or assistive tech
      for (const e of [c, ...c.querySelectorAll<HTMLElement>(FOCUSABLE)]) e.tabIndex = -1;
      for (const e of [c, ...c.querySelectorAll(CONTROLS)]) if (e.matches(CONTROLS)) e.setAttribute("form", ""); // in no form
      origin.set(c, el);
      els.push(c), body.push(c);
    });
    // :nth-child(odd/even) reads the same on a copy as on its slide: an even number of elements
    // per set, and between the slides and each set (so on the slides' side)
    if (real.length % 2) home > 0 ? body.unshift(hidden()) : body.push(hidden());
    // whitespace between inline-block slides is part of the layout: it goes on the side of the slides
    const g = gap && (gap.cloneNode() as Text);
    const nodes = g ? (home > 0 ? [g, ...body] : [...body, g]) : body;
    nodes.forEach((n) => mine.add(n));
    return { home, slot: home, t: 0, els, nodes };
  }

  function clear() {
    for (const s of sets) s.nodes.forEach((n) => n.remove());
    spacers.forEach((n) => n.remove());
    sets = [];
    spacers = [];
    loop = side = cur = 0;
    at0 = NaN;
    if (anchoring !== null) (scroller.style.overflowAnchor = anchoring), (anchoring = null);
  }

  // 1px tall: Gecko leaves a box of no area in a flex container out of the scrollable overflow
  const spacer = (px: number) => {
    const e = document.createElement("div");
    e.setAttribute("aria-hidden", "true");
    e.style.cssText =
      `display:inline-block!important;inline-size:${px}px!important;flex:none!important;block-size:1px!important;min-inline-size:0!important;max-inline-size:none!important;` +
      "margin:0!important;padding:0!important;border:0!important;visibility:hidden!important;scroll-snap-align:none!important;vertical-align:top!important";
    mine.add(e);
    return e;
  };

  // no box, no gap: only counts for :nth-child
  const hidden = () => {
    const e = document.createElement("div");
    e.style.cssText = "display:none!important";
    mine.add(e);
    return e;
  };

  // Is the set, where it is drawn, in the scrollport?
  const seen = (s: CopySet) => {
    const v = scroller.getBoundingClientRect();
    return s.els.some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > v.left + 0.5 && r.left < v.right - 0.5; });
  };
  // Where loop w starts (from the lead's start edge), from the sizes the slides and the copies have
  // now: a slide may have changed size since the build, and only at rest is it all built again.
  function places() {
    const lay = (s: CopySet) => off(s.els[i0]) - s.t; // where the set is laid out
    const p0 = head.isConnected ? off(head) : at0, r =lay(sets[0]) - p0, l = lay(sets[1]) - lay(sets[0]); // the slides' loop, a set's
    return { lay, at: (w: number) => p0 + (w > 0 ? r + (w - 1) * l : w * l) };
  }

  /**
   * Show the sets of copies around loop c. A set already in one of the loops wanted is not
   * moved; the others, behind the view, are translated to the free loops, each only if it is
   * off screen where it is (unless now: at rest, in the task of a shift). A set that is off its
   * place (a slide changed size) is put back on it, also only off screen.
   */
  function arrange(c: number, now = false) {
    const max = Math.floor(room / loop) - side - 2;
    c = Math.max(-max, Math.min(max, c));
    // the loops nearest c, without the slides' own
    const want: number[] = [];
    for (let d = 0; want.length < sets.length; d++)
      for (const s of d ? [c + d, c - d] : [c]) if (s && want.length < sets.length) want.push(s);
    const free = want.filter((w) => !sets.some((s) => s.slot === w)).sort((a, b) => a - b);
    const move = sets.filter((s) => !want.includes(s.slot)).sort((a, b) => a.slot - b.slot);
    const to = new Map(move.map((s, i) => [s, free[i]]));
    const { lay, at } = places();
    const go = sets.map((s) => [s, to.get(s) ?? s.slot, at(to.get(s) ?? s.slot) - lay(s)] as const)
      .filter(([s, , t]) => Math.abs(t - s.t) > 0.5 && (now || !seen(s))); // onto the screen only where the view outran the copies: an empty loop
    const moved = go.flatMap(([s]) => s.els);
    debug()?.arrange?.("before", c, moved);
    const dir = rtl() ? -1 : 1;
    // an author transition that covers translate (transition: all) would fly the copies across the view
    const was = moved.map((el) => [el.style.getPropertyValue("transition"), el.style.getPropertyPriority("transition")]);
    for (const el of moved) el.style.setProperty("transition", "none", "important");
    for (const [s, w, t] of go) {
      (s.slot = w), (s.t = Math.abs(t) < 0.5 ? 0 : t);
      for (const el of s.els) s.t ? el.style.setProperty("translate", `${t * dir}px`, "important") : el.style.removeProperty("translate");
    }
    if (moved[0]) void getComputedStyle(moved[0]).translate; // the new place is in before the transition is back
    moved.forEach((el, i) => (was[i][0] ? el.style.setProperty("transition", was[i][0], was[i][1]) : el.style.removeProperty("transition")));
    if (move.every((s) => s.slot === to.get(s))) cur = c; // else: try again on the next scroll
    debug()?.arrange?.("after", c, moved);
  }

  // one empty snap area per snap target per loop, but the slides' own: they snap themselves
  function lattice(real: Element[]) {
    const box = document.createElement("div");
    box.style.cssText = "position:absolute;inset-inline-start:0;top:0;inline-size:0;block-size:0;pointer-events:none";
    const marks = real.map((el) => {
      const cs = getComputedStyle(el);
      return `position:absolute;top:0;block-size:1px;inline-size:${el.getBoundingClientRect().width}px;` +
        `scroll-snap-align:${cs.scrollSnapAlign};scroll-snap-stop:${cs.scrollSnapStop};` +
        `scroll-margin-inline:${cs.scrollMarginInlineStart} ${cs.scrollMarginInlineEnd};inset-inline-start:`;
    });
    const at = real.map(off);
    const k = Math.floor(room / loop) - 1;
    const html: string[] = [];
    for (let s = -k; s <= k; s++) if (s) marks.forEach((m, i) => html.push(`<div style="${m}${at[i] + s * loop}px"></div>`));
    box.innerHTML = html.join("");
    mine.add(box);
    spacers[0].style.setProperty("position", "relative", "important");
    spacers[0].append(box);
  }

  function build() {
    const all = slides(), real = drawn();
    const first = real[0];
    const keep = first && pos(first); // where the first slide is drawn now, kept through the rebuild
    clear();
    stale = false;
    for (const el of all) if (!watched.has(el)) watched.add(el), ro.observe(el);
    signature = all.map((el) => el.outerHTML).join("");
    scroller.setAttribute("blossom-repeat", "false");
    if (!first) return;
    targets = real.flatMap((el) => [el, ...el.querySelectorAll("*")]).filter((e) => getComputedStyle(e).scrollSnapAlign.split(" ").some((v) => v !== "none"));
    snapping = targets.length > 0;
    const ws = all[1]?.previousSibling;
    const gap = ws instanceof Text && !ws.data.trim() ? ws : null;
    // one set after the slides tells how long a loop is
    sets = [copy(all, gap, 1)];
    all[all.length - 1].after(...sets[0].nodes);
    loop = pos(sets[0].els[all.indexOf(first)]) - pos(first);
    if (!(loop > scroller.clientWidth)) return clear(), void shift(pos(first) - keep); // too few to loop
    side = Math.ceil((scroller.clientWidth + (snapping ? REACH : AHEAD)) / loop);
    room = snapping ? Math.min(ROOM, Math.max(20 * loop, (MARKS * loop) / targets.length)) : ROOM;
    room = Math.max(room, (side + 4) * loop); // a loop longer than the room: room for the sets
    // laid out once: side sets before the slides, side + 1 after, then never moved in the DOM
    for (let h = 2; h <= side + 1; h++) sets.push(copy(all, gap, h)), sets[h - 2].nodes.at(-1)!.after(...sets[h - 1].nodes);
    const before: CopySet[] = [];
    for (let h = -side; h < 0; h++) before.push(copy(all, gap, h));
    all[0].before(...before.flatMap((s) => s.nodes));
    sets.push(...before);
    // lead, trail, and one hidden element so that the slides keep their :nth-child parity
    spacers = [spacer(room - side * loop), spacer(room - (side + 2) * loop), hidden()];
    anchoring = scroller.style.overflowAnchor;
    scroller.style.overflowAnchor = "none"; // or the browser scrolls along with the boxes
    scroller.prepend(spacers[0], spacers[2]);
    scroller.append(spacers[1]);
    at0 = off(first);
    // a layout where a box before the slides does not push them (fixed grid tracks): no loop
    if (at0 < room - loop) return clear(), void shift(pos(first) - keep);
    (head = first), (i0 = all.indexOf(first));
    if (snapping) lattice(targets);
    scroller.setAttribute("blossom-repeat", "true");
    shift(pos(first) - keep);
    follow();
  }

  // The scroll that would put el on its snap position (start when it has none), as navigation reads it.
  // A copy is placed as the slide it copies.
  function offset(el: Element, none = "start") {
    let align = getComputedStyle(origin.get(el) ?? el).scrollSnapAlign.split(" ").pop();
    if (align === "none") align = none;
    const s = scroller.getBoundingClientRect(), b = el.getBoundingClientRect(), cs = getComputedStyle(scroller);
    const ps = parseFloat(cs.scrollPaddingInlineStart) || 0, pe = parseFloat(cs.scrollPaddingInlineEnd) || 0;
    const [l, r] = rtl() ? [pe, ps] : [ps, pe];
    const start = (align !== "end" && align !== "center") !== rtl();
    return align === "center" ? b.left + b.width / 2 - (s.left + l + (s.width - l - r) / 2)
      : start ? b.left - s.left - l : b.right - s.right + r;
  }

  // The view is on a snap position, in any loop: the copies and the lattice repeat the real
  // snap targets every loop px.
  const aligned = (within = 0.5) => targets.some((t) => {
    const r = ((offset(t) % loop) + loop) % loop;
    return Math.min(r, loop - r) < within;
  });
  // While scrolling: keep copies around the view, once it is well into another loop (no back
  // and forth at a seam). Only translates change, of copies off screen. Any style change inside
  // a snapping scroller (a translate too) makes WebKit snap it at once when it sees no gesture
  // under way (a wheel without phases): so when the slides snap, sets are moved while the view
  // is on a snap position, where that snap has nothing to do; as the copies ahead run shorter,
  // near one (that snap moves the view by a few px); and only when they run short anywhere else.
  function follow() {
    if (!loop) return;
    const x = viewStart() - pos(spacers[0]) - at0;
    const out = Math.max(cur * loop - x, x - (cur + 1) * loop); // how far the view is past loop cur
    if (out > (snapping ? REACH : AHEAD) - MARGIN || (snapping && out > loop / 4 && aligned(out > REACH - MARGIN - 1500 ? 12 : 0.5)))
      arrange(Math.floor((x + 0.5) / loop));
    else if (stale) arrange(cur); // a set off its place, now off screen
  }

  // At rest: move the scroll by whole loops, so that what is aligned is a real slide. Off a snap
  // position (WebKit's keyboard scroll, a proximity rest) every engine snaps a scroll we make (or
  // snapping turned back on), so it waits for a rest on one, unless it must happen now.
  function home(now = false) {
    const first = drawn()[0];
    if (!loop || !first || (snapping && !now && !aligned())) return;
    const d = offset(first);
    // within half a slide of its place, the first slide is the aligned one
    const k = Math.floor(((rtl() ? d : -d) + first.getBoundingClientRect().width / 2) / loop);
    if (!k) return;
    // its copy in loop k (none for a slide added since the build)
    const from = sets.find((s) => s.slot === k)?.els.find((c) => origin.get(c) === first);
    // the view and the sets in one task: nothing is painted or snaps in between.
    // Past every copy (the end of the range was reached) there is no set to measure: by whole loops.
    still(() => (shift(from ? pos(first) - pos(from) : -k * loop), arrange(cur - k, true)));
  }

  function sync() {
    if (dead) return;
    if (!atRest()) {
      // again once the scroll is quiet, or the finger has been off long enough (coarse clocks: never at 150 ms sharp)
      const wait = Math.max(need() + 20 - quiet(), 160 - (performance.now() - lastTouch));
      if (!touching && wait > 0) clearTimeout(timer), (timer = window.setTimeout(sync, wait));
      return;
    }
    home();
    if (stale || slides().map((el) => el.outerHTML).join("") !== signature) home(true), still(build);
  }

  const later = () => (clearTimeout(timer), (timer = window.setTimeout(sync, 150)));
  const onScroll = () => {
    const t = performance.now(), p = scroller.scrollLeft;
    (speed = t - lastScroll < 100 ? (Math.abs(p - lastPos) / Math.max(1, t - lastScroll)) * 1000 : 0), (lastPos = p), (lastScroll = t);
    follow(), (ended = !("onscrollend" in window)), later();
  };
  const onEnd = () => ((ended = true), later());
  const onTouch = (e: TouchEvent) =>
    (touching = e.touches.length > 0) || ((lastTouch = performance.now()), later());
  const onPointer = (e: PointerEvent) =>
    e.pointerType === "touch" && (e.type === "pointerdown" ? (pressed = performance.now()) : ((pressed = 0), (lastTouch = performance.now()), later()));
  // A copy has no listeners of its own: its clicks go to the same element in the real slide,
  // with their modifier keys (a cmd/ctrl-click on a link still opens a tab).
  const onClick = (e: MouseEvent) => {
    const hit = e.target as Element;
    const c = e.isTrusted && hit.closest?.(`[${CLONE_ATTR}]`);
    let to = c && origin.get(c);
    if (!c || !to) return;
    const path: number[] = [];
    for (let n = hit; n !== c; n = n.parentElement!) path.unshift(Array.prototype.indexOf.call(n.parentElement!.children, n));
    for (const i of path) to = to?.children[i];
    e.preventDefault(), e.stopImmediatePropagation();
    to?.dispatchEvent(new MouseEvent("click", e));
  };
  // Home and End: the first and the last slide of the loop the view is in, not the empty ends of
  // the range (WebKit scrolls there). Not while a field or another listener has the key.
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement, real = drawn();
    if (!loop || !real[0] || e.defaultPrevented || e.altKey || e.metaKey || !/^(Home|End)$/.test(e.key) ||
      t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    e.preventDefault();
    const d = offset(real[0]), k = Math.floor(((rtl() ? d : -d) + 0.5) / loop);
    const end = e.key === "End" ? offset(real[real.length - 1], "end") : d;
    scroller.scrollBy({ left: end + k * loop * (rtl() ? -1 : 1), behavior: "smooth" });
  };
  // no focus inside a copy
  const onDown = (e: MouseEvent) => (e.target as Element).closest?.(`[${CLONE_ATTR}]`) && e.preventDefault();

  // Someone else changed the slides (not us, not inside a copy, not core's attributes on the scroller).
  const inCopy = (n: Node) => mine.has(n) || !!n.parentElement?.closest(`[${CLONE_ATTR}]`);
  const mo = new MutationObserver((records) => {
    if (records.some((r) => r.target === scroller
        ? r.type === "childList" && [...r.addedNodes, ...r.removedNodes].some((n) => !mine.has(n))
        : !inCopy(r.target)))
      clearTimeout(timer), (timer = window.setTimeout(sync, 0));
  });
  // A slide (or the scroller) changed size: at rest re-measure.
  let observed = false;
  const ro = new ResizeObserver(() => {
    if (dead) return;
    if (!observed) return void (observed = true);
    // never move the scroll under a finger: the copies off screen are put in place, the rest waits
    if (!atRest()) return void ((stale = true), loop && arrange(cur), later());
    home(true), still(build);
  });
  ro.observe(scroller);
  still(build);
  const first = drawn()[0];
  if (loop && getComputedStyle(first).scrollSnapAlign !== "none") shift((rtl() ? -1 : 1) * offset(first)), follow();
  mo.observe(scroller, { childList: true, subtree: true, attributes: true, characterData: true });
  const listeners: [string, (e: never) => void, boolean][] = [["scroll", onScroll, false], ["scrollend", onEnd, false],
    ["touchstart", onTouch, false], ["touchmove", onTouch, false], ["touchend", onTouch, false], ["touchcancel", onTouch, false], ["click", onClick, true], ["mousedown", onDown, true], ["keydown", onKey, false],
    ["pointerdown", onPointer, false], ["pointerup", onPointer, false], ["pointercancel", onPointer, false]];
  for (const [t, f, capture] of listeners) scroller.addEventListener(t, f as EventListener, { capture, passive: !capture && f !== onKey });

  const self: Repeat = {
    refresh() {
      if (!dead) (stale = true), later();
    },
    destroy() {
      if (dead) return;
      dead = true;
      if (active.get(scroller) === self) active.delete(scroller);
      mo.disconnect(), ro.disconnect(), clearTimeout(timer);
      for (const [t, f, capture] of listeners) scroller.removeEventListener(t, f as EventListener, capture);
      home(true);
      const real = drawn()[0];
      const keep = real && pos(real);
      still(() => (clear(), real && shift(pos(real) - keep)));
      scroller.removeAttribute("blossom-repeat");
      if (!hadStyle && !scroller.getAttribute("style")) scroller.removeAttribute("style");
    },
  };
  active.set(scroller, self);
  return self;
}
