# @blossom-carousel/repeat

Private workspace package: the looping add-on behind the `repeat` option of the framework packages. It is bundled into each of them at build time and is not published on its own.

```ts
import { createRepeat } from "@blossom-carousel/repeat";

const repeat = createRepeat(scroller); // any horizontal scroller, with or without core
repeat.refresh(); // re-measure at the next rest, after a change the module cannot observe
repeat.destroy(); // remove every node and style it added
```

## How it works

The real slides stay in their natural layout in the middle of a very long scroll range. Sets of copies sit around them in a fixed DOM order and are shown in other loops with the CSS `translate` property only, and only while they are off screen. From the build to the next rest nothing else changes: no node is inserted or removed, no spacer changes size, the scroll position is not written and scroll snapping is not toggled. At rest the view is moved by whole loops back onto the real slides, which looks the same. With scroll snap, copies do not snap; a fixed lattice of empty markers stands in for them, so the list of snap positions never changes.

## Known limits

- **Very fast flicks.** The module keeps at least 4500 px of copies past each edge of the view at every scroll event (the fastest step recorded on an iPhone was 2722 px between two scroll events, 129 ms apart). A frame drawn more than 4500 px past the last scroll event shows empty space until the next scroll event. iOS draws a frame before it fires its scroll event, so the module cannot prevent this. Raising the margin costs memory (more copies) and nothing else.
- **A slide changes size during a scroll** (an image loads, content changes, an author resize). Copies are placed from the sizes the slides and copies have now, but only copies that are off screen are moved. A copy that is on screen when it is out of place keeps its place until it leaves the screen. Copies of the slide that changed keep its old size and content until the scroll comes to rest, when everything is built again. With scroll snap, the snap markers for the other loops keep their old positions until rest. So a scroll that ends in another loop can rest off by the size change, and the browser snaps again after the rebuild.
- **A finger that catches a momentum scroll and holds still** may send no touch or pointer event on iOS. The module waits 2 s longer for a rest when a touch scroll stops dead (its last step faster than 300 px/s) instead of slowing down. It also counts pointer events as a finger when they arrive. A finger held still for more than about 2.5 s with no event at all can still have the scroll moved home under it. The same is true when the scroll slowed down to its stop under the finger: Chromium keeps animating a snap under a held finger. This was tested only with touch emulation in Chromium, not on an iPhone.
- **Home and End** on a focused carousel go to the first or last slide of the loop the view is in, in every engine. In a plain strip only WebKit scrolls the carousel on these keys; Chromium and Firefox leave the carousel alone, and the key can scroll the page instead. Page Up and Page Down do not scroll a horizontal carousel in any engine and are left alone. A key pressed in a text field is left to the field. WebKit on macOS hands Home and End in a single-line field to the scroller, which then goes to an empty end of the range.
- **Desktop Safari, a mouse wheel without phases, with scroll snap.** Any style change inside a snapping scroller makes WebKit snap at once, mid-wheel. The module moves copies when the view is on a snap position, or within 12 px of one. It moves them anywhere else only when it runs short of copies. Measured over a 20,000 px wheel: 2–3 such snaps, each 4–11 px. Before this change there were 2–3 snaps of 67–125 px.
- **Scroll-driven animations.** `animation-timeline: view()` uses where a copy is laid out, not where `translate` shows it. A translated copy on screen gets the progress of a box far away, for example opacity 1 or 0 where the real slide at the same place has 0.54. This cannot be fixed from outside the layout without moving copies in the layout, which would break the rule that nothing changes during a scroll.
- **Layouts that do not loop.** Grids with fixed track sizes (`grid-auto-columns: 300px`), and slides that are not direct children of the scroller, stay a plain strip.
- **Copies are look-alikes.** Only clicks on a copy are forwarded to the real slide. Other events (`pointerdown`, `contextmenu`, keys) are not.
- **CSS-only layout changes** with no DOM change and no resize of a slide or the scroller need `refresh()`.
