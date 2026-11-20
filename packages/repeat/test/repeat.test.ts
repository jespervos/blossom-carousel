import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createRepeat, CLONE_ATTR } from "../src/index";
import {
  copies,
  installLayout,
  realSlides,
  resized,
  rest,
  scrollerWith,
  uninstallLayout,
  userScroll,
  wait,
  VIEW,
} from "./layout";

// The module waits for 140 ms without a scroll before it calls the scroller at rest.
beforeAll(() => wait(200));
beforeEach(installLayout);
afterEach(uninstallLayout);

const LOOP = 12 * 300; // 12 slides of 300 px

/** Records the mutations made to the scroller's subtree while fn runs (and until it settles). */
async function mutations(s: HTMLElement, fn: () => void | Promise<void>) {
  const log: MutationRecord[] = [];
  const mo = new MutationObserver((r) => log.push(...r));
  mo.observe(s, { childList: true, subtree: true, attributes: true, characterData: true });
  await fn();
  log.push(...mo.takeRecords());
  mo.disconnect();
  return log;
}

/** True when a mutation touched one of the given nodes (moved it, or changed it or its content). */
const touches = (log: MutationRecord[], nodes: Node[]) =>
  log.some(
    (r) =>
      nodes.some((n) => n === r.target || n.contains(r.target)) ||
      [...r.addedNodes, ...r.removedNodes].some((n) => nodes.includes(n)),
  );

const touch = (s: Element, type: string, touches: number) => {
  const e = new Event(type);
  Object.defineProperty(e, "touches", { value: { length: touches } });
  s.dispatchEvent(e);
};

describe("createRepeat", () => {
  it("lays copies around the slides and puts the view on the real ones", () => {
    const s = scrollerWith(12);
    const first = realSlides(s)[0];
    createRepeat(s);

    expect(s.getAttribute("blossom-repeat")).toBe("true");
    // three sets before, four after: (view + 9000 px) / loop rounded up, each side, plus one
    expect(copies(s)).toHaveLength(7 * 12);
    expect(first.getBoundingClientRect().left).toBe(0);
    expect(s.scrollLeft).toBeGreaterThan(100000);
  });

  it("restores the markup byte for byte on destroy", () => {
    for (const gap of ["", "\n  "]) {
      const s = scrollerWith(12, { gap });
      realSlides(s)[3].innerHTML = '<a href="#x" id="a">link</a><input name="q" required>';
      const before = s.outerHTML;
      const repeat = createRepeat(s);
      expect(s.outerHTML).not.toBe(before);
      repeat.destroy();
      expect(s.outerHTML).toBe(before);
      expect(s.scrollLeft).toBe(0);
      repeat.destroy(); // a second call does nothing
      expect(s.outerHTML).toBe(before);
    }
  });

  it("keeps an author style attribute and the scroll position on destroy", async () => {
    const s = scrollerWith(12);
    s.setAttribute("style", "scroll-snap-type: x mandatory; overflow-anchor: auto;");
    const before = s.outerHTML;
    const repeat = createRepeat(s);
    const first = realSlides(s)[0];
    userScroll(s, s.scrollLeft + 3 * 300); // three slides on, in the real slides
    await rest();
    repeat.destroy();
    expect(s.outerHTML).toBe(before);
    expect(first.getBoundingClientRect().left).toBe(-900);
  });

  it("never writes on the real slides, nor moves them", async () => {
    const s = scrollerWith(12);
    const real = realSlides(s);
    const html = real.map((el) => el.outerHTML);
    const log = await mutations(s, async () => {
      const repeat = createRepeat(s);
      userScroll(s, s.scrollLeft + LOOP + 1200);
      await rest();
      repeat.destroy();
    });
    expect(touches(log, real)).toBe(false);
    expect(realSlides(s)).toEqual(real);
    expect(real.map((el) => el.outerHTML)).toEqual(html);
  });

  it("makes copies without ids, names, labels, form owners or focus", () => {
    const s = scrollerWith(12);
    const form = document.createElement("form");
    s.replaceWith(form);
    form.append(s);
    const slide = realSlides(s)[0];
    slide.id = "first";
    slide.innerHTML =
      '<label for="r1">a</label><input type="radio" id="r1" name="g" checked required>' +
      '<button name="b" autofocus>b</button><a href="#x">x</a><div tabindex="0" contenteditable>e</div>';
    createRepeat(s);

    const all = copies(s);
    expect(all.length).toBeGreaterThan(0);
    expect(s.querySelectorAll(`[${CLONE_ATTR}][id], [${CLONE_ATTR}] [id]`)).toHaveLength(0);
    expect(s.querySelectorAll(`[${CLONE_ATTR}] [name], [${CLONE_ATTR}] [for], [${CLONE_ATTR}] [autofocus]`)).toHaveLength(0);
    for (const c of all) {
      expect(c.getAttribute("aria-hidden")).toBe("true");
      expect(c.tabIndex).toBe(-1);
      expect(c.hasAttribute("data-blossom-slide")).toBe(false);
      for (const e of c.querySelectorAll<HTMLElement>("a, button, input, [tabindex], [contenteditable]"))
        expect(e.tabIndex).toBe(-1);
    }
    // navigation still sees 12 slides; the form only its own controls
    expect(s.querySelectorAll("[data-blossom-slide]")).toHaveLength(12);
    expect(form.elements).toHaveLength(2);
    expect(document.querySelector('input[name="g"]:checked')?.closest(`[${CLONE_ATTR}]`)).toBeNull();
  });

  it("keeps :nth-child parity with an odd number of slides", () => {
    const s = scrollerWith(7, { w: 400 });
    createRepeat(s);
    const kids = Array.from(s.children);
    const parity = (el: Element) => kids.indexOf(el) % 2;
    const real = realSlides(s);
    expect(copies(s).length).toBeGreaterThan(0);
    for (const c of copies(s)) expect(parity(c)).toBe(parity(real[Number(c.dataset.i)]));
  });

  it("falls back to a plain strip when the slides do not fill the view", () => {
    const s = scrollerWith(3);
    const before = s.innerHTML;
    createRepeat(s);
    expect(s.getAttribute("blossom-repeat")).toBe("false");
    expect(s.innerHTML).toBe(before);
    expect(s.scrollLeft).toBe(0);
  });

  it("starts looping once enough slides are added, and stops when they go", async () => {
    const s = scrollerWith(3);
    createRepeat(s);
    for (let i = 3; i < 6; i++) s.insertAdjacentHTML("beforeend", `<div class="slide" data-i="${i}">${i + 1}</div>`);
    await rest();
    expect(s.getAttribute("blossom-repeat")).toBe("true");
    expect(realSlides(s).map((el) => el.textContent)).toEqual(["1", "2", "3", "4", "5", "6"]);
    realSlides(s).slice(3).forEach((el) => el.remove());
    await rest();
    expect(s.getAttribute("blossom-repeat")).toBe("false");
    expect(copies(s)).toHaveLength(0);
  });

  it("moves only its own nodes when the slides change, framework style", async () => {
    const s = scrollerWith(12);
    createRepeat(s);
    const at = () => realSlides(s)[0].getBoundingClientRect().left;
    const check = async (change: () => void, order: string[]) => {
      const real = realSlides(s);
      let mine: MutationRecord[] = [];
      const log = await mutations(s, change);
      // what the change itself did, then what the module did at rest
      mine = await mutations(s, rest);
      expect(log.length).toBeGreaterThan(0);
      expect(touches(mine, [...new Set([...real, ...realSlides(s)])])).toBe(false);
      expect(realSlides(s).map((el) => el.textContent)).toEqual(order);
      // the first set after the slides copies them in their new order
      const after = copies(s).filter((c) => c.compareDocumentPosition(realSlides(s).at(-1)!) & Node.DOCUMENT_POSITION_PRECEDING);
      expect(after.slice(0, order.length).map((c) => c.textContent)).toEqual(order);
      expect(copies(s)).toHaveLength(7 * order.length);
      expect(at()).toBe(0);
    };
    const nums = (...n: number[]) => n.map(String);
    const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

    // appended at the very end (after the module's trail box), like appendChild
    await check(() => s.insertAdjacentHTML("beforeend", '<div class="slide" data-i="12">13</div>'), nums(...range(1, 13)));
    // removed
    await check(() => realSlides(s)[1].remove(), nums(1, ...range(3, 13)));
    // moved before another slide, like insertBefore
    await check(() => s.insertBefore(realSlides(s)[4], realSlides(s)[0]), nums(6, 1, 3, 4, 5, ...range(7, 13)));
    // new content in a slide
    await check(() => (realSlides(s)[0].textContent = "6!"), ["6!", ...nums(1, 3, 4, 5, ...range(7, 13))]);
  });

  it("only translates copies while a scroll is under way, and moves the view home at rest", async () => {
    const s = scrollerWith(12);
    createRepeat(s);
    const home = s.scrollLeft;
    const kids = Array.from(s.childNodes);
    const log = await mutations(s, () => userScroll(s, home + 3 * LOOP + VIEW));
    // under way: the scroll stays where the user put it, no node comes or goes, only copies' style changes
    expect(s.scrollLeft).toBe(home + 3 * LOOP + VIEW);
    expect(Array.from(s.childNodes)).toEqual(kids);
    expect(log.every((r) => r.type === "attributes" && r.attributeName === "style" && (r.target as Element).hasAttribute(CLONE_ATTR))).toBe(true);
    expect(log.length).toBeGreaterThan(0);
    // copies drawn on screen did not move
    const onScreen = copies(s).filter((c) => {
      const b = c.getBoundingClientRect();
      return b.right > 0 && b.left < VIEW;
    });
    expect(onScreen.every((c) => !c.style.getPropertyValue("translate"))).toBe(true);
    await rest();
    // at rest, three whole loops back: the same slides on screen, now the real ones
    expect(s.scrollLeft).toBe(home + VIEW);
    expect(realSlides(s)[0].getBoundingClientRect().left).toBe(-VIEW);
    expect(copies(s).every((c) => !c.style.getPropertyValue("translate"))).toBe(true);
  });

  it("waits for the end of a touch before it moves the view", async () => {
    const s = scrollerWith(12);
    createRepeat(s);
    const home = s.scrollLeft;
    const touch = (type: string, touches: number) => {
      const e = new Event(type);
      Object.defineProperty(e, "touches", { value: { length: touches } });
      s.dispatchEvent(e);
    };
    touch("touchstart", 1);
    userScroll(s, home + LOOP + VIEW);
    await rest();
    expect(s.scrollLeft).toBe(home + LOOP + VIEW);
    touch("touchend", 0);
    await rest();
    expect(s.scrollLeft).toBe(home + VIEW);
  });

  it("re-measures at rest when a slide resizes", async () => {
    const s = scrollerWith(12);
    createRepeat(s);
    resized(s); // the first notification is the observer's initial one
    const slide = realSlides(s)[0];
    slide.dataset.w = "500";
    resized(slide);
    // one set before, two after, and the loop is 200 px longer
    const first = copies(s).find((c) => c.compareDocumentPosition(realSlides(s).at(-1)!) & Node.DOCUMENT_POSITION_PRECEDING)!;
    expect(first.getBoundingClientRect().left - slide.getBoundingClientRect().left).toBe(LOOP + 200);
    expect(slide.getBoundingClientRect().left).toBe(0);
  });

  it("puts the copies back in place, off screen, when a slide resizes while a scroll is under way", () => {
    const s = scrollerWith(12);
    createRepeat(s);
    resized(s); // the first notification is the observer's initial one
    const start = s.scrollLeft;
    touch(s, "touchstart", 1);
    userScroll(s, start + 3 * LOOP + VIEW); // the sets from before the slides are now after them
    const slide = realSlides(s)[2];
    slide.dataset.w = "420";
    resized(slide);
    expect(s.scrollLeft).toBe(start + 3 * LOOP + VIEW); // under a finger: no scroll write
    // in the order drawn, every box starts where the one before it ends: no gap, no overlap
    const boxes = [...realSlides(s), ...copies(s)].map((el) => el.getBoundingClientRect()).sort((a, b) => a.left - b.left);
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].left).toBe(boxes[i - 1].right);
  });

  it("goes to the first and the last slide on Home and End, not to the empty ends of the range", async () => {
    const s = scrollerWith(12);
    createRepeat(s);
    const start = s.scrollLeft;
    userScroll(s, start + 2 * LOOP + 5 * 300); // slide 6, in another loop
    const key = (k: string, target: Element = s) => target.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
    const drawnAt = (i: number) => [...realSlides(s), ...copies(s)].filter((el) => (el as HTMLElement).dataset.i === String(i)).map((el) => el.getBoundingClientRect().left);
    expect(key("Home")).toBe(false); // handled
    expect(s.scrollLeft).toBe(start + 2 * LOOP);
    expect(drawnAt(0)).toContain(0);
    key("End");
    expect(drawnAt(11).some((x) => x >= 0 && x + 300 <= VIEW)).toBe(true);
    expect(Math.abs(s.scrollLeft - start)).toBeLessThan(3 * LOOP);
    // a key in a field is the field's
    const field = document.createElement("input");
    realSlides(s)[0].append(field);
    const before = s.scrollLeft;
    expect(key("Home", field)).toBe(true);
    expect(s.scrollLeft).toBe(before);
  });

  it("waits longer before it moves the view when a touch scroll stops dead (a finger the page does not hear)", async () => {
    const s = scrollerWith(12);
    createRepeat(s);
    const start = s.scrollLeft;
    touch(s, "touchstart", 1);
    touch(s, "touchend", 0);
    userScroll(s, start + LOOP);
    await wait(16);
    userScroll(s, start + LOOP + VIEW); // 1000 px in 16 ms, then nothing
    await rest();
    await wait(300);
    expect(s.scrollLeft).toBe(start + LOOP + VIEW);
    await wait(2200);
    expect(s.scrollLeft).toBe(start + VIEW);
  });

  it("measures from slides with a box, and copies hidden ones too", () => {
    const s = scrollerWith(12);
    const hidden = realSlides(s)[0];
    hidden.style.display = "none";
    createRepeat(s);
    expect(s.getAttribute("blossom-repeat")).toBe("true");
    const second = realSlides(s)[1];
    expect(second.getBoundingClientRect().left).toBe(0);
    const twin = copies(s).find((c) => c.dataset.i === "1" && c.getBoundingClientRect().left > 0)!;
    expect(twin.getBoundingClientRect().left).toBe(11 * 300);
    expect(copies(s).filter((c) => c.dataset.i === "0").every((c) => c.style.display === "none")).toBe(true);
  });

  it("replaces an earlier instance on the same scroller instead of copying its copies", () => {
    const s = scrollerWith(12);
    const before = s.outerHTML;
    const a = createRepeat(s);
    const b = createRepeat(s);
    expect(copies(s)).toHaveLength(7 * 12);
    expect(copies(s).some((c) => c.parentElement?.closest(`[${CLONE_ATTR}]`))).toBe(false);
    a.destroy(); // already replaced: no effect
    expect(copies(s)).toHaveLength(7 * 12);
    b.destroy();
    expect(s.outerHTML).toBe(before);
  });

  it("also stands in for snap targets inside the slides", () => {
    const s = scrollerWith(12);
    for (const el of realSlides(s)) el.innerHTML = '<span style="scroll-snap-align: center">x</span><i>y</i>';
    createRepeat(s);
    for (const c of copies(s)) {
      expect(c.querySelector("span")!.style.getPropertyValue("scroll-snap-align")).toBe("none");
      expect(c.querySelector("i")!.hasAttribute("style")).toBe(false);
      expect(c.style.getPropertyValue("scroll-snap-align")).toBe("");
    }
    const marks = s.firstElementChild!.querySelectorAll<HTMLElement>(":scope > div > div");
    expect(marks.length % 12).toBe(0);
    expect([...marks].every((m) => m.style.scrollSnapAlign === "center")).toBe(true);
  });

  it("gives the lattice the snap positions of the other loops when slides snap", () => {
    const s = scrollerWith(12);
    for (const el of realSlides(s)) el.style.scrollSnapAlign = "start";
    createRepeat(s);
    expect(copies(s).every((c) => c.style.getPropertyValue("scroll-snap-align") === "none")).toBe(true);
    const marks = s.firstElementChild!.querySelectorAll<HTMLElement>(":scope > div > div");
    expect(marks.length % 12).toBe(0);
    expect(marks.length).toBeGreaterThan(12);
    expect([...marks].every((m) => m.style.scrollSnapAlign === "start")).toBe(true);
  });
});
