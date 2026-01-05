import "./style.css";
import type { Point, HasOverflow, CarouselOptions } from "./types";
import { state } from "./state";
import { damp, round } from "./utils";
import { FRICTION, DAMPING } from "./constants";
import { dispatchOverscrollEvent, dispatchScrollEndEvent } from "./events";
import {
  findSnapPositions,
  onScrollSnapChange,
  onSnapChanging,
  dragSnap,
} from "./snap";
import { prev, next } from "./methods";

export const Blossom = (scroller: HTMLElement, options: CarouselOptions) => {
  state.scroller = scroller;
  let snap = <boolean>true;
  const pointerStart: Point = { x: 0, y: 0 };
  const target: Point = { x: 0, y: 0 };
  const velocity: Point = { x: 0, y: 0 };
  const distanceMovedSincePointerDown: Point = new Proxy(
    { x: 0, y: 0 },
    {
      set(target, prop: keyof Point, value) {
        const old = target[prop];
        if (old === value) return true;

        target[prop] = value;

        if (target.x >= 10 || target.y >= 10) {
          isTicking.value = true;
        }

        return true;
      },
    }
  );
  const hasOverflow: HasOverflow = new Proxy(
    { x: false, y: false },
    {
      set(target, prop: keyof HasOverflow, value) {
        const old = target[prop];
        if (old === value) return true;

        target[prop] = value;

        if (target.x || target.y) {
          scroller.setAttribute("has-overflow", "true");
          scroller.addEventListener("pointerdown", onPointerDown);
          scroller.addEventListener("wheel", onWheel, { passive: false });
        } else {
          scroller.removeAttribute("has-overflow");
          scroller.removeEventListener("pointerdown", onPointerDown);
          scroller.removeEventListener("wheel", onWheel);
        }

        return true;
      },
    }
  );
  let raf: number | null = null;
  let links: NodeListOf<HTMLAnchorElement> | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let restoreScrollMethods: () => void;

  function init() {
    scroller?.setAttribute("blossom-carousel", "true");
    links = scroller?.querySelectorAll("a[href]") || null;
    links?.forEach((el) => {
      el.addEventListener("click", onLinkClick);
    });
    window.addEventListener("keydown", onKeydown);
    scroller.addEventListener("scroll", onScroll);

    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(scroller);

    mutationObserver = new MutationObserver(onMutation);
    mutationObserver.observe(scroller, {
      attributes: false,
      childList: true,
      subtree: false,
    });

    const hasMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    state.dir = scroller.closest('[dir="rtl"]') ? -1 : 1;

    const { scrollSnapType } = window.getComputedStyle(scroller);
    state.hasSnap = scrollSnapType !== "none";
    scroller.style.setProperty("--snap-type", scrollSnapType);
    if (hasMouse) {
      scroller.style.setProperty("scroll-snap-type", "none");
    }

    scroller.setAttribute("has-snap", snap ? "true" : "false");
    scroller.setAttribute("has-repeat", options?.repeat ? "true" : "false");

    restoreScrollMethods = interceptScrollIntoViewCalls((target) => {
      if (target === scroller || scroller.contains(target))
        isTicking.value = false;
    });
  }

  function destroy() {
    scroller.removeAttribute("blossom-carousel");
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    if (raf) cancelAnimationFrame(raf);

    window.removeEventListener("keydown", onKeydown);
    scroller.removeEventListener("scroll", onScroll);

    links?.forEach((el) => {
      el.removeEventListener("click", onLinkClick);
    });

    restoreScrollMethods?.();
  }

  function onLinkClick(e: MouseEvent): void {
    if (distanceMovedSincePointerDown.x > 10) {
      e.preventDefault();
    }
  }

  function onResize(): void {
    if (!scroller) return;

    const hasTouch = "ontouchmove" in window;
    state.scrollerScrollWidth = scroller.scrollWidth;
    state.scrollerWidth = scroller.clientWidth;
    state.scrollerScrollHeight = scroller.scrollHeight;
    state.scrollerHeight = scroller.clientHeight;

    const styles = window.getComputedStyle(scroller);
    hasOverflow.x =
      !hasTouch &&
      state.scrollerScrollWidth > state.scrollerWidth &&
      ["auto", "scroll"].includes(styles.getPropertyValue("overflow-x"));
    hasOverflow.y =
      !hasTouch &&
      state.scrollerScrollHeight > state.scrollerHeight &&
      ["auto", "scroll"].includes(styles.getPropertyValue("overflow-y"));
    state.padding.end = parseInt(styles.paddingInlineEnd) || 0;
    state.padding.start = parseInt(styles.paddingInlineStart) || 0;
    state.scrollPadding.start = parseInt(styles.scrollPaddingInlineStart) || 0;
    state.scrollPadding.end = parseInt(styles.scrollPaddingInlineEnd) || 0;
    state.dir = scroller.closest('[dir="rtl"]') ? -1 : 1;
    state.end =
      (state.scrollerScrollWidth - state.scrollerWidth - 4) * state.dir;

    if (state.hasSnap) {
      findSnapPositions(scroller);
    } else {
      state.slidePositions = Array.from(scroller.children).map((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const left = rect.left - scrollerRect.left + scroller.scrollLeft;
        return {
          target: el as HTMLElement,
          x: left - state.scrollPadding.start,
          y: 0,
          width: rect.width,
          height: rect.height,
        };
      });
    }
    if (options?.repeat) onRepeat(null, null);
  }

  function onMutation(): void {
    onResize();
  }

  function onScroll() {
    if (options?.repeat) {
      onRepeat(null, null);
      return;
    }

    if (state.isDragging || !scroller) return;

    const scrollStart = scroller.scrollLeft;

    if (scrollStart < 0) {
      dispatchOverscrollEvent(scroller, { left: scrollStart * -1 });
    } else if (scrollStart > state.scrollerScrollWidth - state.scrollerWidth) {
      dispatchOverscrollEvent(scroller, {
        left:
          scrollStart * -1 + state.scrollerScrollWidth - state.scrollerWidth,
      });
    }
  }

  /*********************
   **** Drag events ****
   *********************/

  const virtualScroll: Point = {
    x: 0,
    y: 0,
  };

  function onPointerDown(e: PointerEvent): void {
    if (!scroller) return;

    if (hasOverflow.x) {
      virtualScroll.x = scroller.scrollLeft;
      pointerStart.x = e.clientX;
      velocity.x = 0;
    }

    if (hasOverflow.y) {
      virtualScroll.y = scroller.scrollTop;
      pointerStart.y = e.clientY;
      velocity.y = 0;
    }

    distanceMovedSincePointerDown.x = 0;
    state.isDragging = true;

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  function onPointerMove(e: PointerEvent): void {
    e.preventDefault();

    if (hasOverflow.x) {
      const deltaX = pointerStart.x - e.clientX;
      target.x += deltaX;
      velocity.x += deltaX;
      pointerStart.x = e.clientX;
      distanceMovedSincePointerDown.x += Math.abs(deltaX);
    }

    if (hasOverflow.y) {
      const deltaY = pointerStart.y - e.clientY;
      target.y += deltaY;
      velocity.y += deltaY;
      pointerStart.y = e.clientY;
      distanceMovedSincePointerDown.y += Math.abs(deltaY);
    }
  }

  function onPointerUp(): void {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);

    state.isDragging = false;

    if (distanceMovedSincePointerDown.x <= 10) return;
    if (hasOverflow.x) velocity.x *= 2;
    if (hasOverflow.y) velocity.y *= 2;

    velocity.x = dragSnap(target.x, velocity.x, FRICTION);
    preventGlobalClick();
  }

  function onWheel(e: WheelEvent): void {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      isTicking.value = false;
      if (state.isDragging || !scroller) return;
      if (hasOverflow.x) virtualScroll.x = scroller.scrollLeft;
      if (hasOverflow.y) virtualScroll.y = scroller.scrollTop;
    }
  }

  function onKeydown(e: KeyboardEvent): void {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      isTicking.value = false;
  }

  /*********************
   ******* REPEAT ******
   *********************/

  function onRepeat(_: null | undefined, x: number | null): void {
    if (!scroller) return;

    const scrollStart = x ?? scroller.scrollLeft;
    const distanceToStartEdge = state.padding.start - scrollStart;
    const distanceToEndEdge =
      scrollStart -
      (state.scrollerScrollWidth - state.scrollerWidth - state.padding.end);
    const slides = Array.from(scroller.children) as HTMLElement[];

    const offsetSlides = (
      startIdx: number,
      endIdx: number,
      threshold: number,
      isEnd: boolean
    ) => {
      let offset = 0;
      const step = isEnd ? -1 : 1;
      const baseOffset = isEnd
        ? -(state.scrollerScrollWidth - state.scrollerWidth)
        : state.scrollerScrollWidth - state.scrollerWidth;

      for (let i = startIdx; isEnd ? i >= endIdx : i < endIdx; i += step) {
        const thresholdCheck = isEnd ? offset > threshold : offset > threshold;
        slides[i].style.translate = `${thresholdCheck ? 0 : baseOffset}px 0`;
        offset += slides[i].clientWidth;
      }
    };

    offsetSlides(
      slides.length - 1,
      slides.length / 2,
      distanceToStartEdge,
      true
    );
    offsetSlides(0, slides.length / 2, distanceToEndEdge, false);

    if (state.isDragging) return;

    const left =
      scrollStart > state.end ? 4 : scrollStart < 4 ? state.end : null;
    if (!left) return;
    __scrollingInternally = true;
    scroller.scrollTo({
      left,
      behavior: "instant" as ScrollBehavior,
    });
  }

  /******************
   ***** Ticker *****
   ******************/

  function onScrollEnd(e: Event) {
    if (isTicking.value) {
      e.stopPropagation();
    }
  }

  type TickingState = { value: boolean };
  const isTicking: TickingState = new Proxy(
    { value: false },
    {
      set(ticking: TickingState, prop: keyof TickingState, value: boolean) {
        snap = !value;
        const old = ticking[prop];
        if (old === value) return true;

        if (!scroller) return false;

        scroller.setAttribute("has-snap", snap ? "true" : "false");

        // start ticker
        if (value && !isTicking.value) {
          lastTick = performance.now();
          if (hasOverflow.x) target.x = scroller.scrollLeft;
          if (hasOverflow.y) target.y = scroller.scrollTop;

          scroller.addEventListener("scrollend", onScrollEnd, {
            capture: true,
            passive: false,
          });

          if (!raf) {
            raf = requestAnimationFrame(tick);
          }
        }
        // stop ticker
        else if (!value) {
          if (raf) cancelAnimationFrame(raf);
          raf = null;
          scroller.removeEventListener("scrollend", onScrollEnd);
        }

        ticking[prop] = value;

        return true;
      },
    }
  );

  let frameDelta = 0;
  let lastTick = 0;
  function tick(t: number): void {
    raf = requestAnimationFrame(tick);
    frameDelta = t - lastTick;

    if (!scroller) return;

    if (hasOverflow.x) {
      velocity.x *= FRICTION;
      if (!state.isDragging) {
        target.x += velocity.x;
        virtualScroll.x = damp(virtualScroll.x, target.x, DAMPING, frameDelta);
      } else {
        virtualScroll.x = damp(virtualScroll.x, target.x, FRICTION, frameDelta);
      }
    }

    if (hasOverflow.y) {
      velocity.y *= FRICTION;
      if (!state.isDragging) {
        target.y += velocity.y;
        virtualScroll.y = damp(virtualScroll.y, target.y, DAMPING, frameDelta);
      } else {
        virtualScroll.y = damp(virtualScroll.y, target.y, FRICTION, frameDelta);
      }
    }

    if (options?.repeat) {
      if (virtualScroll.x > state.end) {
        virtualScroll.x = target.x = 4;
      }
      if (virtualScroll.x < 4) {
        virtualScroll.x = target.x = state.end;
      }
    }

    __scrollingInternally = true;
    scroller.scrollTo({
      left: virtualScroll.x,
      top: virtualScroll.y,
      behavior: "instant" as ScrollBehavior,
    });

    if (state.isDragging && state.hasSnap) {
      onSnapChanging(target.x, velocity.x, FRICTION);
    }

    if (!state.isDragging && round(velocity.x, 8) === 0) {
      isTicking.value = false;
      dispatchScrollEndEvent(scroller);
      if (state.hasSnap) {
        onScrollSnapChange();
      }
    }

    if (!options?.repeat) {
      applyRubberBanding(round(virtualScroll.x, 2));
    } else {
      onRepeat(null, virtualScroll.x);
    }

    lastTick = t;
  }

  let rubberBandOffset = 0;
  function applyRubberBanding(left: number): void {
    if (!scroller) return;

    //TODO: add support for vertical rubber banding
    const edge = state.end;

    let targetOffset = 0;
    if (left * state.dir <= 0) {
      targetOffset = state.isDragging ? left * -0.2 : 0;
    } else if (left * state.dir > edge * state.dir) {
      targetOffset = state.isDragging ? (left - edge) * -0.2 : 0;
    }
    rubberBandOffset = damp(
      rubberBandOffset,
      targetOffset,
      state.isDragging ? 0.8 : DAMPING,
      frameDelta
    );

    if (Math.abs(rubberBandOffset) > 0.01) {
      const evt = dispatchOverscrollEvent(scroller, { left: rubberBandOffset });
      if (evt.defaultPrevented) return;
      scroller.style.transform = `translateX(${round(rubberBandOffset, 3)}px)`;
      return;
    }

    scroller.style.transform = "";
    rubberBandOffset = 0;
  }

  /******************************
   ********* METHODS **************
   ******************************/

  let __scrollingInternally = false;

  const scrollTo = scroller.scrollTo.bind(scroller);
  scroller.scrollTo = function (...args: any[]) {
    const internal = __scrollingInternally === true;
    if (!internal) isTicking.value = false;
    __scrollingInternally = false;
    scrollTo(...args);
  };

  const scrollBy = scroller.scrollBy.bind(scroller);
  scroller.scrollBy = function (...args: any[]) {
    const internal = __scrollingInternally === true;
    if (!internal) isTicking.value = false;
    __scrollingInternally = false;
    scrollBy(...args);
  };

  function interceptScrollIntoViewCalls(
    onExternalScroll: (target: Element, method: string, args: any[]) => void
  ) {
    const stopFns: Array<() => void> = [];

    // Patch scrollIntoView for all elements
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    if (originalScrollIntoView) {
      Element.prototype.scrollIntoView = function (
        arg?: boolean | ScrollIntoViewOptions
      ): void {
        onExternalScroll(this, "scrollIntoView", [arg]);
        return originalScrollIntoView.call(this, arg);
      };
      stopFns.push(() => {
        Element.prototype.scrollIntoView = originalScrollIntoView;
      });
    }

    return () => stopFns.forEach((fn) => fn());
  }

  /******************************
   ********* UTILS **************
   ******************************/

  function preventGlobalClick(): void {
    const clickPreventHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener("click", clickPreventHandler, true);
    };
    // Use capture phase to catch the event before it reaches the element
    window.addEventListener("click", clickPreventHandler, true);
  }

  return {
    snap,
    hasOverflow,
    init,
    destroy,
    prev,
    next,
  };
};
