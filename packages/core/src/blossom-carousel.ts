interface Point {
  x: number;
  y: number;
}

interface HasOverflow {
  x: boolean;
  y: boolean;
}

interface SnapPoint {
  target: HTMLElement | null;
  x: number;
}

interface CarouselOptions {
  repeat?: boolean;
}

export const Blossom = (scroller: HTMLElement, options: CarouselOptions) => {
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
          setIsTicking(true);
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

  let end = 300;
  let raf: number | null = null;
  let isDragging = false;
  let scrollerScrollWidth = 300;
  let scrollerWidth = 300;
  let scrollerScrollHeight = 300;
  let scrollerHeight = 300;
  const padding = { start: 0, end: 0 };
  const scrollPadding = { start: 0, end: 0 };
  let snapPoints: SnapPoint[] = [];
  let links: NodeListOf<HTMLAnchorElement> | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let hasSnap = false;
  let restoreScrollMethods: () => void;
  let dir = 1;
  let activeSnapPoint: SnapPoint = { target: null, x: 0 };

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

    dir = scroller.closest('[dir="rtl"]') ? -1 : 1;

    const { scrollSnapType } = window.getComputedStyle(scroller);
    hasSnap = scrollSnapType !== "none";
    scroller.style.setProperty("--snap-type", scrollSnapType);
    if (hasMouse) {
      scroller.style["scroll-snap-type"] = "none";
    }

    scroller.setAttribute("has-repeat", options?.repeat ? "true" : "false");

    restoreScrollMethods = interceptScrollIntoViewCalls((target) => {
      if (target === scroller || scroller.contains(target)) setIsTicking(false);
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
    scrollerScrollWidth = scroller.scrollWidth;
    scrollerWidth = scroller.clientWidth;
    scrollerScrollHeight = scroller.scrollHeight;
    scrollerHeight = scroller.clientHeight;

    const styles = window.getComputedStyle(scroller);
    hasOverflow.x =
      !hasTouch &&
      scrollerScrollWidth > scrollerWidth &&
      ["auto", "scroll"].includes(styles.getPropertyValue("overflow-x"));
    hasOverflow.y =
      !hasTouch &&
      scrollerScrollHeight > scrollerHeight &&
      ["auto", "scroll"].includes(styles.getPropertyValue("overflow-y"));
    padding.end = parseInt(styles.paddingInlineEnd) || 0;
    padding.start = parseInt(styles.paddingInlineStart) || 0;
    scrollPadding.start = parseInt(styles.scrollPaddingInlineStart) || 0;
    scrollPadding.end = parseInt(styles.scrollPaddingInlineEnd) || 0;
    dir = scroller.closest('[dir="rtl"]') ? -1 : 1;
    end = (scrollerScrollWidth - scrollerWidth - 4) * dir;

    snapPoints = !hasSnap ? [] : findSnapPoints(scroller);

    if (options?.repeat) onRepeat(null, null);
  }

  function onMutation(): void {
    onResize();
  }

  function findSnapPoints(scroller: HTMLElement): SnapPoint[] {
    let points: { align: string; el: HTMLElement | Element }[] = [];

    let cycles = 0;
    const traverseDOM = (node: HTMLElement | Element) => {
      cycles++;
      // break if the max depth is reached
      if (cycles > 100) return;

      const styles = window.getComputedStyle(node);
      const scrollSnapAlign = styles.scrollSnapAlign;

      // break if a snap-type value  is found
      if (scrollSnapAlign !== "none") {
        points.push({
          align: scrollSnapAlign,
          el: node,
        });
        return;
      }

      // traverse all children
      const children = node.children;
      if (children.length === 0) return;
      for (let child of children) {
        traverseDOM(child);
      }
    };
    traverseDOM(scroller);

    // precompute snap point for all slides
    const scrollerRect = scroller.getBoundingClientRect();
    let snapPoints = points.map(({ el, align }, i) => {
      const elementRect = (el as HTMLElement).getBoundingClientRect();
      const clientWidth = (el as HTMLElement).clientWidth;
      const left = elementRect.left - scrollerRect.left + scroller.scrollLeft;

      switch (align) {
        case "start":
          return { target: el as HTMLElement, x: left - scrollPadding.start };
        case "end":
          return {
            target: el as HTMLElement,
            x: left + clientWidth - scrollerWidth + scrollPadding.end,
          };
        case "center":
          return {
            target: el as HTMLElement,
            x: left + clientWidth * 0.5 - scrollerWidth / 2,
          };
        default:
          return null;
      }
    });

    // Filter out duplicates (i.e. in case of multiple rows)
    const filteredSnapPoints = snapPoints
      .filter((snapPoint): snapPoint is SnapPoint => snapPoint !== null)
      .reduce((acc: SnapPoint[], curr: SnapPoint) => {
        if (acc.length === 0 || acc[acc.length - 1].x !== curr.x) {
          acc.push(curr);
        }
        return acc;
      }, []);

    return filteredSnapPoints;
  }

  function onScroll() {
    if (options?.repeat) {
      onRepeat(null, null);
      return;
    }

    if (isDragging || !scroller) return;

    const scrollStart = scroller.scrollLeft;

    if (scrollStart < 0) {
      const left = scrollStart * -1;
      dispatchOverscrollEvent(left);
    } else if (scrollStart > scrollerScrollWidth - scrollerWidth) {
      const left = scrollStart * -1 + scrollerScrollWidth - scrollerWidth;
      dispatchOverscrollEvent(left);
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
    isDragging = true;

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

    isDragging = false;

    if (distanceMovedSincePointerDown.x <= 10) return;
    if (hasOverflow.x) velocity.x *= 2;
    if (hasOverflow.y) velocity.y *= 2;

    dragSnap();
    preventGlobalClick();
  }

  function onWheel(e: WheelEvent): void {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      setIsTicking(false);
      if (isDragging || !scroller) return;
      if (hasOverflow.x) virtualScroll.x = scroller.scrollLeft;
      if (hasOverflow.y) virtualScroll.y = scroller.scrollTop;
    }
  }

  function onKeydown(e: KeyboardEvent): void {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      setIsTicking(false);
  }

  function dragSnap(): void {
    //TODO: add support for vertical snapping
    const newSnapPoint = snapSelect({ axis: "x" });
    if (newSnapPoint.x !== activeSnapPoint.x) {
      dispatchScrollSnapChangingEvent(newSnapPoint);
    }
    activeSnapPoint = newSnapPoint;
    const slideX = clamp(
      newSnapPoint.x,
      Math.min((scrollerScrollWidth - scrollerWidth) * dir, 0),
      Math.max((scrollerScrollWidth - scrollerWidth) * dir, 0)
    );
    const distance = slideX - target.x;
    const force = distance * (1 - FRICTION) * (1 / FRICTION);
    velocity.x = force;
  }

  /*********************
   ***** WRAP *****
   *********************/

  function onRepeat(_: null | undefined, x: number | null): void {
    if (!scroller) return;

    const scrollStart = x ?? scroller.scrollLeft;
    const distanceToStartEdge = padding.start - scrollStart;
    const distanceToEndEdge =
      scrollStart - (scrollerScrollWidth - scrollerWidth - padding.end);
    const slides = Array.from(scroller.children) as HTMLElement[];

    /**
     * TODO: compute amount of slides to offset
     */

    // offset end slides to start
    let ows = 0;
    for (let i = slides.length - 1; i >= slides.length / 2; i--) {
      const offsetX =
        ows > distanceToStartEdge ? 0 : -(scrollerScrollWidth - scrollerWidth);
      ows += slides[i].clientWidth;
      slides[i].style.translate = `${offsetX}px 0`;
    }

    // offset start slides to end
    let owe = 0;
    for (let i = 0; i < slides.length / 2; i++) {
      const offsetX =
        owe > distanceToEndEdge ? 0 : scrollerScrollWidth - scrollerWidth;
      owe += slides[i].clientWidth;
      slides[i].style.translate = `${offsetX}px 0`;
    }

    if (isDragging) return;

    // loop
    const left = scrollStart > end ? 4 : scrollStart < 4 ? end : null;
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
    if (isTicking) {
      e.stopPropagation();
    }
  }

  const FRICTION = 0.72;
  const DAMPING = 0.12;
  let isTicking = false;

  function setIsTicking(bool: boolean): void {
    if (!scroller) return;

    // start ticker
    if (bool && !isTicking) {
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
    else if (!bool) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      scroller.removeEventListener("scrollend", onScrollEnd);
    }

    isTicking = bool;
    snap = !bool;
    scroller.setAttribute("has-snap", snap ? "true" : "false");
  }

  let frameDelta = 0;
  let lastTick = 0;
  function tick(t: number): void {
    raf = requestAnimationFrame(tick);
    frameDelta = t - lastTick;

    if (!scroller) return;

    if (hasOverflow.x) {
      velocity.x *= FRICTION;
      if (!isDragging) {
        target.x += velocity.x;
        virtualScroll.x = damp(virtualScroll.x, target.x, DAMPING, frameDelta);
      } else {
        virtualScroll.x = damp(virtualScroll.x, target.x, FRICTION, frameDelta);
      }
    }

    if (hasOverflow.y) {
      velocity.y *= FRICTION;
      if (!isDragging) {
        target.y += velocity.y;
        virtualScroll.y = damp(virtualScroll.y, target.y, DAMPING, frameDelta);
      } else {
        virtualScroll.y = damp(virtualScroll.y, target.y, FRICTION, frameDelta);
      }
    }

    if (options?.repeat) {
      if (virtualScroll.x > end) {
        virtualScroll.x = target.x = 4;
      }
      if (virtualScroll.x < 4) {
        virtualScroll.x = target.x = end;
      }
    }

    __scrollingInternally = true;
    scroller.scrollTo({
      left: virtualScroll.x,
      top: virtualScroll.y,
      behavior: "instant" as ScrollBehavior,
    });

    if (isDragging) {
      if (hasSnap) {
        const newSnapPoint = snapSelect({ axis: "x" });
        if (newSnapPoint.x !== activeSnapPoint.x) {
          activeSnapPoint = newSnapPoint;
          dispatchScrollSnapChangingEvent(newSnapPoint);
        }
      }
    }

    if (!isDragging && round(velocity.x, 8) === 0) {
      setIsTicking(false);
      dispatchScrollEndEvent();
      if (hasSnap) {
        dispatchScrollSnapChangeEvent();
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
    const edge = end;

    let targetOffset = 0;
    if (left * dir <= 0) {
      targetOffset = isDragging ? left * -0.2 : 0;
    } else if (left * dir > edge * dir) {
      targetOffset = isDragging ? (left - edge) * -0.2 : 0;
    }
    rubberBandOffset = damp(
      rubberBandOffset,
      targetOffset,
      isDragging ? 0.8 : DAMPING,
      frameDelta
    );

    if (Math.abs(rubberBandOffset) > 0.01) {
      const evt = dispatchOverscrollEvent(rubberBandOffset);
      if (evt.defaultPrevented) return;
      scroller.style.transform = `translateX(${round(rubberBandOffset, 3)}px)`;
      return;
    }

    scroller.style.transform = "";
    rubberBandOffset = 0;
  }

  function dispatchOverscrollEvent(
    left: number
  ): CustomEvent<{ left: number }> {
    const overscrollEvent = new CustomEvent("overscroll", {
      bubbles: true,
      cancelable: true,
      detail: { left },
    });
    scroller?.dispatchEvent(overscrollEvent);
    return overscrollEvent;
  }

  const scrollEndEvent = new Event("scrollend", {
    bubbles: true,
    cancelable: true,
  });
  function dispatchScrollEndEvent(): Event {
    scroller?.dispatchEvent(scrollEndEvent);
    return scrollEndEvent;
  }

  function dispatchScrollSnapChangeEvent(): Event {
    const scrollSnapChangeEvent = new CustomEvent("scrollsnapchange", {
      bubbles: true,
      cancelable: true,
      detail: {
        snapTargetInline: activeSnapPoint.target,
        snapTargetBlock: activeSnapPoint.target,
      },
    });
    scroller?.dispatchEvent(scrollSnapChangeEvent);
    return scrollSnapChangeEvent;
  }

  function dispatchScrollSnapChangingEvent(snapPoint: SnapPoint): Event {
    const scrollSnapChangingEvent = new CustomEvent("scrollsnapchanging", {
      bubbles: true,
      cancelable: true,
      detail: {
        snapTargetInline: (snapPoint || activeSnapPoint).target,
        snapTargetBlock: (snapPoint || activeSnapPoint).target,
      },
    });
    scroller?.dispatchEvent(scrollSnapChangingEvent);
    return scrollSnapChangingEvent;
  }

  /******************************
   ********* METHODS **************
   ******************************/

  let __scrollingInternally = false;

  const scrollTo = scroller.scrollTo.bind(scroller);
  scroller.scrollTo = function (options) {
    const internal = __scrollingInternally === true;
    if (!internal) setIsTicking(false);
    __scrollingInternally = false;
    scrollTo(options);
  };

  const scrollBy = scroller.scrollBy.bind(scroller);
  scroller.scrollBy = function (options) {
    const internal = __scrollingInternally === true;
    if (!internal) setIsTicking(false);
    __scrollingInternally = false;
    scrollBy(options);
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

  interface AxisOption {
    axis: "x" | "y";
  }

  function project({ axis = "x" }: AxisOption): number {
    return target[axis] + velocity[axis] / (1 - FRICTION);
  }

  function snapSelect({ axis = "x" }: AxisOption): SnapPoint {
    const restingX = project({ axis });
    return snapPoints.length
      ? snapPoints.reduce((prev, curr) =>
          Math.abs(curr.x - restingX) < Math.abs(prev.x - restingX)
            ? curr
            : prev
        )
      : {
          target: null,
          x: clamp(restingX, Math.min(end, 0), Math.max(end, 0)),
        };
  }

  function preventGlobalClick(): void {
    const clickPreventHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener("click", clickPreventHandler, true);
    };
    // Use capture phase to catch the event before it reaches the element
    window.addEventListener("click", clickPreventHandler, true);
  }

  function lerp(x: number, y: number, t: number): number {
    return (1 - t) * x + t * y;
  }

  function damp(x: number, y: number, t: number, delta: number): number {
    return lerp(x, y, 1 - Math.exp(Math.log(1 - t) * (delta / (1000 / 60))));
  }

  function clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    }

    return value;
  }

  function round(value: number, precision: number = 0): number {
    const multiplier = Math.pow(10, precision);
    return Math.round(value * multiplier) / multiplier;
  }

  return {
    snap,
    hasOverflow,
    init,
    destroy,
  };
};
