interface Point {
  x: number;
  y: number;
}

interface HasOverflow {
  x: boolean;
  y: boolean;
}

interface CarouselOptions {
  repeat?: boolean;
}

interface CurrentIndex {
  value: number;
  onChange: ((index: number) => void) | null;
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
          scroller.addEventListener("touchstart", onPointerDown, { passive: false });
          scroller.addEventListener("pointerdown", onPointerDown, { passive: false });
          scroller.addEventListener("wheel", onWheel, { passive: false });
        } else {
					scroller.removeAttribute("has-overflow");
          scroller.removeEventListener("touchstart", onPointerDown);
          scroller.removeEventListener("pointerdown", onPointerDown);
          scroller.removeEventListener("wheel", onWheel);
        }

        return true;
      },
    }
  );

  const currentIndex: CurrentIndex = new Proxy(
    { value: 0, onChange: null },
    {
      set(target, prop: keyof CurrentIndex, value) {
        const old = target[prop];
        if (old === value) return true;

        target[prop] = value;

        // Trigger callback when value changes
        if (prop === "value" && target.onChange) {
          target.onChange(value as number);
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
  const securityMargin = 0;
  const padding = { start: 0, end: 0 };
  const scrollPadding = { start: 0, end: 0 };
	let gap = 0;
  let snapPoints: number[] = [];
  let snapElements: HTMLElement[] = [];
  let snapAlignments: ScrollLogicalPosition[] = [];
  const virtualSnapPoints: number[] = [];
  let slides: HTMLElement[] = [];
  let links: NodeListOf<HTMLAnchorElement> | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let hasSnap = false;
  let hasMouse = false;
	const hasTouch = "ontouchmove" in window;
  let restoreScrollMethods: () => void;
  let dir = 1;

  function init() {
    scroller?.setAttribute("blossom-carousel", "true");
    slides = Array.from(scroller.children) as HTMLElement[];

    links = scroller?.querySelectorAll("a[href]") || null;
    links?.forEach((el) => {
      el.addEventListener("click", onLinkClick);
    });
    window.addEventListener("keydown", onKeydown);
    scroller.addEventListener("scroll", onScroll);

    dir = scroller.closest('[dir="rtl"]') ? -1 : 1;

    const { scrollSnapType } = window.getComputedStyle(scroller);
    hasSnap = scrollSnapType !== "none";
    scroller.style.setProperty("--snap-type", scrollSnapType);
    scroller.setAttribute("has-repeat", options?.repeat ? "true" : "false");

		hasMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

		// if (hasMouse && options?.repeat) {
			scroller.style["scroll-snap-type"] = "none";
		// }

    restoreScrollMethods = interceptScrollIntoViewCalls((target) => {
      if (target === scroller || scroller.contains(target)) setIsTicking(false);
    });

		resizeObserver = new ResizeObserver(onResize);
    // If scroller width matches parent width, observe parent for resize events
    // (ResizeObserver may not fire on elements sized by their containers)
    const parent = scroller.parentElement;
    if (parent && scroller.clientWidth === parent.clientWidth) {
      resizeObserver.observe(parent);
    } else {
      resizeObserver.observe(scroller);
    }

    mutationObserver = new MutationObserver(onMutation);
    mutationObserver.observe(scroller, {
      attributes: false,
      childList: true,
      subtree: false,
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

		setIsTicking(false);

		// reset translates
		for (let i = 0; i < snapElements.length; i++) {
			const el = snapElements[i];
			el.style.translate = '';
		}

    scrollerScrollWidth = scroller.scrollWidth;
    scrollerWidth = scroller.clientWidth;
    scrollerScrollHeight = scroller.scrollHeight;
    scrollerHeight = scroller.clientHeight;

    const styles = window.getComputedStyle(scroller);
    hasOverflow.x =
      // !hasTouch &&
      scrollerScrollWidth > scrollerWidth &&
      ["auto", "scroll"].includes(styles.getPropertyValue("overflow-x"));
    hasOverflow.y =
      // !hasTouch &&
      scrollerScrollHeight > scrollerHeight &&
      ["auto", "scroll"].includes(styles.getPropertyValue("overflow-y"));
		padding.start = parseInt(styles.paddingInlineStart) || 0;
    padding.end = parseInt(styles.paddingInlineEnd) || 0;
    scrollPadding.start = parseInt(styles.scrollPaddingInlineStart) || 0;
    scrollPadding.end = parseInt(styles.scrollPaddingInlineEnd) || 0;
    dir = scroller.closest('[dir="rtl"]') ? -1 : 1;
    gap = parseInt(styles.gap) || parseInt(styles.columnGap) || 0;
    end = (scrollerScrollWidth - scrollerWidth - securityMargin + gap) * dir;

    const result = !hasSnap
      ? { points: [], elements: [], alignments: [], sizes: [] }
      : findSnapPoints(scroller);
    snapPoints = result.points;
    snapElements = result.elements;
    snapAlignments = result.alignments;

		// animateToSlideX(snapPoints[currentIndex.value]);
		target.x = virtualScroll.x = snapPoints[currentIndex.value];
		scroller.scrollTo({ left: virtualScroll.x, behavior: "instant" });
		if (options?.repeat) {
			onRepeat();
		}
  }

  function onMutation(): void {
    onResize();
  }

  function findSnapPoints(scroller: HTMLElement): {
    points: number[];
    elements: HTMLElement[];
    alignments: ScrollLogicalPosition[];
  } {
    const points: { align: string; el: HTMLElement | Element }[] = [];

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
      for (const child of children) {
        traverseDOM(child);
      }
    };
    traverseDOM(scroller);

    // precompute snap point for all slides
    const scrollerRect = scroller.getBoundingClientRect();
    const snapData = points.map(({ el, align }) => {
      const elementRect = (el as HTMLElement).getBoundingClientRect();
      const clientWidth = (el as HTMLElement).clientWidth;
      const left = elementRect.left - scrollerRect.left + scroller.scrollLeft;

      let position: number | null = null;
      switch (align) {
        case "start":
          position = left - scrollPadding.start;
          break;
        case "end":
          position = left + clientWidth - scrollerWidth + scrollPadding.end;
          break;
        case "center":
          position = left + clientWidth * 0.5 - scrollerWidth / 2;
          break;
      }

      return { position, element: el as HTMLElement, align };
    });

    // Filter out duplicates (i.e. in case of multiple rows)
    const filteredData: { position: number; element: HTMLElement; align: ScrollLogicalPosition }[] = [];
    const seenPositions = new Set<number>();

    for (const item of snapData) {
      if (item.position !== null && !seenPositions.has(item.position)) {
        seenPositions.add(item.position);
        filteredData.push({ position: item.position, element: item.element, align: item.align });
      }
    }

    return {
      points: filteredData.map(d => d.position),
      elements: filteredData.map(d => d.element),
      alignments: filteredData.map(d => d.align),
    };
  }

  function onScroll() {
		if (isDragging || !scroller) return;

		if(!isTicking) {
			virtualScroll.x = target.x = scroller.scrollLeft
		}

		if (options?.repeat) {
			onRepeat();
      updateCurrentIndex();
      return;
    }

    const scrollStart = scroller.scrollLeft;

    if (scrollStart < 0) {
      const left = scrollStart * -1;
      dispatchOverscrollEvent(left);
    } else if (scrollStart > scrollerScrollWidth - scrollerWidth) {
      const left = scrollStart * -1 + scrollerScrollWidth - scrollerWidth;
      dispatchOverscrollEvent(left);
    }

    updateCurrentIndex();
  }

  /*********************
   **** Drag events ****
   *********************/

  const virtualScroll: Point = {
    x: 0,
    y: 0,
  };

  function onPointerDown(e: PointerEvent | TouchEvent): void {
    if (!scroller) return;

    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    if (hasOverflow.x) {
      virtualScroll.x = scroller.scrollLeft;
      target.x = scroller.scrollLeft;
      pointerStart.x = clientX;
      velocity.x = 0;
    }

    if (hasOverflow.y) {
      virtualScroll.y = scroller.scrollTop;
      target.y = scroller.scrollTop;
      pointerStart.y = clientY;
      velocity.y = 0;
    }

    distanceMovedSincePointerDown.x = 0;
		isDragging = true;

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("touchend", onPointerUp, { passive: true });
  }

  function onPointerMove(e: PointerEvent | TouchEvent): void {
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

		if (hasOverflow.x) {
			const deltaX = pointerStart.x - clientX;
      target.x += deltaX;
      velocity.x += deltaX;
      pointerStart.x = clientX;
      distanceMovedSincePointerDown.x += Math.abs(deltaX);
    }

    if (hasOverflow.y) {
			const deltaY = pointerStart.y - clientY;
      target.y += deltaY;
      velocity.y += deltaY;
      pointerStart.y = clientY;
      distanceMovedSincePointerDown.y += Math.abs(deltaY);
    }

		if(distanceMovedSincePointerDown.x > 2 || distanceMovedSincePointerDown.y > 2) scroller.classList.add("blossom-dragging");
  }

  function onPointerUp(): void {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("touchmove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    window.removeEventListener("touchend", onPointerUp);

    isDragging = false;
    scroller.classList.remove("blossom-dragging");

    if (distanceMovedSincePointerDown.x <= 10) return;
    if (hasOverflow.x) velocity.x *= 2;
    if (hasOverflow.y) velocity.y *= 2;

		dragSnap();
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
		let slideX: number | undefined;

		if(options?.repeat && snapElements.length > 0) {
			// Strict single-step using helpers
			const n = snapPoints.length;
			if (n >= 2) {
				const ci = ((currentIndex.value % n) + n) % n;
				const step: 1 | -1 = (velocity.x * dir) >= 0 ? 1 : -1;
				const targetIdx = (ci + step + n) % n;
				slideX = computeRepeatSlideX(targetIdx, step);
			} else {
				slideX = snapSelect({ axis: "x" });
			}
		} else if(!options?.repeat && snapElements.length) {
			slideX = clamp(
			  snapSelect({ axis: "x" }),
			  Math.min((scrollerScrollWidth - scrollerWidth) * dir, 0),
			  Math.max((scrollerScrollWidth - scrollerWidth) * dir, 0)
			)
		}

		if (slideX === undefined) return

		animateToSlideX(slideX);
  }

  /*********************
   ***** WRAP *****
   *********************/

  function onRepeat(): void {
		if (!scroller) return;

		const loopWidth = scrollerScrollWidth - scrollerWidth + gap;
		if (loopWidth === 0) return;

		if (virtualScroll.x >= end) {
			virtualScroll.x -= loopWidth;
			target.x -= loopWidth;
			if(!isTicking) {
				scroller.scrollTo({ left: virtualScroll.x, behavior: "instant" });
			}
		} else if (virtualScroll.x <= securityMargin) {
			virtualScroll.x += loopWidth;
			target.x += loopWidth;
			if(!isTicking) {
				scroller.scrollTo({ left: virtualScroll.x, behavior: "instant" });
			}
		}

		// const scrollLeft = x ?? scroller.scrollLeft;
		const scrollLeft = virtualScroll.x;

		// Compute offsets for snapped elements first to produce a dense virtualSnapPoints
		const newVirtual: number[] = new Array(snapPoints.length);
		const elementOffset = new Map<HTMLElement, number>();
		for (let i = 0; i < snapElements.length; i++) {
			const el = snapElements[i];
			const basePoint = snapPoints[i] ?? 0;
			const alignement = snapAlignments[i] ?? 'start';
			const dx = alignement === 'start' ? 0 : alignement === 'end' ? (scrollerWidth - el.clientWidth) / 2 : (-scrollerWidth + el.clientWidth) / 2;
			const raw = (scrollLeft - basePoint + dx) / loopWidth;
			const k = Math.round(raw + (velocity.x >= 0 ? 0.001 : -0.001));
			const offsetX = k * loopWidth;
			el.style.translate = `${offsetX}px 0`;
			elementOffset.set(el, offsetX);
			newVirtual[i] = basePoint + offsetX;
		}

		// Translate non-snap slides to the nearest previous snapped slide's cycle
		for (let i = 0; i < slides.length; i++) {
			const el = slides[i];
			if (elementOffset.has(el)) continue;
			let prevTranslate = 0;
			for (let j = i - 1; j >= 0; j--) {
				const prevEl = slides[j];
				const val = elementOffset.get(prevEl);
				if (val !== undefined) { prevTranslate = val; break; }
			}
			el.style.translate = `${prevTranslate}px 0`;
		}

		// Replace contents of virtualSnapPoints with the dense array
		virtualSnapPoints.length = 0;
		for (let i = 0; i < newVirtual.length; i++) virtualSnapPoints.push(newVirtual[i]);
  }

  /******************
   ***** Ticker *****
   ******************/

  // const FRICTION = 0.94;
  const FRICTION = 0.72;
  // const DAMPING = 0.20;
  const DAMPING = 0.12;
  let isTicking = false;
  function setIsTicking(bool: boolean): void {
    if (!scroller) return;

    if (bool && !isTicking) {
      lastTick = performance.now();
      if (hasOverflow.x) target.x = scroller.scrollLeft;
      if (hasOverflow.y) target.y = scroller.scrollTop;

      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    } else if (!bool && raf) {
      cancelAnimationFrame(raf);
      raf = null;
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
			onRepeat();
    } else {
      applyRubberBanding(round(virtualScroll.x, 2));
    }

		__scrollingInternally = true;
    scroller.scrollTo({
      left: virtualScroll.x,
      top: virtualScroll.y,
      behavior: "instant" as ScrollBehavior,
    });

    updateCurrentIndex();

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

  /******************************
   ********* METHODS **************
   ******************************/

  let __scrollingInternally = false;

  const scrollTo = scroller.scrollTo.bind(scroller);
  scroller.scrollTo = (options) => {
    const internal = __scrollingInternally === true;
    if (!internal) setIsTicking(false);
    __scrollingInternally = false;
    scrollTo(options);
  };

  const scrollBy = scroller.scrollBy.bind(scroller);
  scroller.scrollBy = (options) => {
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
        originalScrollIntoView.call(this, arg);
      };
      stopFns.push(() => {
        Element.prototype.scrollIntoView = originalScrollIntoView;
      });
    }

    return () => stopFns.forEach((fn) => {fn()});
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

  function snapSelect({ axis = "x" }: AxisOption): number {
    const restingX = project({ axis });
    const points = virtualSnapPoints.length ? virtualSnapPoints : snapPoints;
    return points.reduce((prev, curr) =>
			Math.abs(curr - restingX) < Math.abs(prev - restingX) ? curr : prev
		)
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

	/******************************
	 ********* REPEAT UTILS *********
	 ******************************/

	function getLoopWidth(): number {
		return scrollerScrollWidth - scrollerWidth + gap;
	}

	function normalizeToCycle(point: number, reference: number): number {
		const w = getLoopWidth();
		if (w <= 0) return point;
		const k = Math.round((reference - point) / w);
		return point + k * w;
	}

	function animateToSlideX(slideX: number, enforceDir?: 1 | -1): void {
		if (slideX === undefined || Number.isNaN(slideX)) return;
		setIsTicking(true);
		target.x = virtualScroll.x;
		let distance = slideX - virtualScroll.x;
		if (options?.repeat) {
			const w = getLoopWidth();
			if (w > 0) {
				// shortest path wrapping
				distance = distance - Math.round(distance / w) * w;
				// optionally enforce intended direction (for prev/next)
				if (enforceDir === 1 && (distance * dir) <= 0) distance += w * dir;
				if (enforceDir === -1 && (distance * dir) >= 0) distance -= w * dir;
			}
		}
		const force = distance * (1 - FRICTION) * (1 / FRICTION);
		velocity.x = force;
	}

	function computeRepeatSlideX(targetIndex: number, directionSign: 1 | -1): number {
		const base = snapPoints[targetIndex] ?? 0;
		const candidate = normalizeToCycle(base, virtualScroll.x);
		const w = getLoopWidth();
		if (w <= 0) return candidate;
		const delta = candidate - virtualScroll.x;
		if (directionSign === 1 && (delta * dir) <= 0) return candidate + w * dir;
		if (directionSign === -1 && (delta * dir) >= 0) return candidate - w * dir;
		return candidate;
	}

  /******************************
   ********* NAVIGATION *********
   ******************************/

  function getCurrentSnapIndex(): number {
    const points = options?.repeat && virtualSnapPoints.length ? virtualSnapPoints : snapPoints;
    if (!points.length) return 0;

    const currentScroll = scroller.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Math.abs(points[0] - currentScroll);

    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(points[i] - currentScroll);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

	function updateCurrentIndex(): void {
    const newIndex = getCurrentSnapIndex();
    if (currentIndex.value !== newIndex) {
      currentIndex.value = newIndex;
    }
  }

  function onIndexChange(callback: (index: number) => void): () => void {
		currentIndex.onChange = callback;
    callback(currentIndex.value);

		return () => {
      currentIndex.onChange = null;
    };
  }

  function next(): void {
    if (snapElements.length <= 1) return;

    const points = snapPoints;
    const nextIndex = options?.repeat
      ? (currentIndex.value + 1) % points.length
      : Math.min(currentIndex.value + 1, points.length - 1);

    let slideX: number | undefined;
    if (options?.repeat && points.length >= 2) {
      const loopWidth = scrollerScrollWidth - scrollerWidth + gap;
      const base = points[nextIndex];
      const k = loopWidth > 0 ? Math.round((virtualScroll.x - base) / loopWidth) : 0;
      let candidate = base + k * loopWidth;
      const delta = candidate - virtualScroll.x;
      if ((delta * dir) <= 0) candidate += loopWidth * dir;
      slideX = candidate;
    } else {
      const min = Math.min((scrollerScrollWidth - scrollerWidth) * dir, 0);
      const max = Math.max((scrollerScrollWidth - scrollerWidth) * dir, 0);
      slideX = clamp(points[nextIndex], min, max);
    }

    animateToSlideX(slideX, 1);
  }

  function prev(): void {
    if (snapElements.length <= 1) return;

    const points = snapPoints;
    const prevIndex = options?.repeat
      ? (currentIndex.value - 1 + points.length) % points.length
      : Math.max(currentIndex.value - 1, 0);

    let slideX: number | undefined;
    if (options?.repeat && points.length >= 2) {
      const loopWidth = scrollerScrollWidth - scrollerWidth + gap;
      const base = points[prevIndex];
      const k = loopWidth > 0 ? Math.round((virtualScroll.x - base) / loopWidth) : 0;
      let candidate = base + k * loopWidth;
      const delta = candidate - virtualScroll.x;
      if ((delta * dir) >= 0) candidate -= loopWidth * dir;
      slideX = candidate;
    } else {
      const min = Math.min((scrollerScrollWidth - scrollerWidth) * dir, 0);
      const max = Math.max((scrollerScrollWidth - scrollerWidth) * dir, 0);
      slideX = clamp(points[prevIndex], min, max);
    }

    animateToSlideX(slideX, -1);
  }

  return {
    snap,
    hasOverflow,
    currentIndex: () => currentIndex.value,
    onIndexChange,
    init,
    destroy,
    next,
    prev,
  };
};
