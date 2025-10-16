interface Point {
	x: number
	y: number
}

interface HasOverflow {
	x: boolean
	y: boolean
}

interface CarouselOptions {
	repeat?: boolean
}

interface CurrentIndex {
	value: number
	onChange: ((index: number) => void) | null
}

export const Blossom = (scroller: HTMLElement, options: CarouselOptions) => {
	let snap = <boolean>true
	const pointerStart: Point = { x: 0, y: 0 }
	const target: Point = { x: 0, y: 0 }
	const velocity: Point = { x: 0, y: 0 }
	const distanceMovedSincePointerDown: Point = new Proxy(
		{ x: 0, y: 0 },
		{
			set(target, prop: keyof Point, value) {
				if (!nativeScroll) {
					const old = target[prop]
					if (old === value) return true

					target[prop] = value

					if (target.x >= 10 || target.y >= 10) {
						setIsTicking(true)
					}
				}

				return true
			},
		},
	)

	const hasOverflow: HasOverflow = new Proxy(
		{ x: false, y: false },
		{
			set(target, prop: keyof HasOverflow, value) {
				const old = target[prop]
				if (old === value) return true

				target[prop] = value

				if (target.x || target.y) {
					scroller.setAttribute('has-overflow', 'true')
					scroller.addEventListener('touchstart', onPointerDown, { passive: false })
					scroller.addEventListener('pointerdown', onPointerDown, { passive: false })
					scroller.addEventListener('wheel', onWheel, { passive: false })
				} else {
					scroller.removeAttribute('has-overflow')
					scroller.removeEventListener('touchstart', onPointerDown)
					scroller.removeEventListener('pointerdown', onPointerDown)
					scroller.removeEventListener('wheel', onWheel)
				}

				return true
			},
		},
	)

	const currentIndex: CurrentIndex = new Proxy(
		{ value: 0, onChange: null },
		{
			set(target, prop: keyof CurrentIndex, value: any) {
				const old = target[prop]
				if (old === value) return true

				;(target as any)[prop] = value

				// Dispatch custom event when value changes
				if (prop === 'value') {
					const event = new CustomEvent('change', {
						bubbles: true,
						detail: { index: value },
					})
					scroller?.dispatchEvent(event)
				}

				return true
			},
		},
	)

	let end = 300
	let raf: number | null = null
	let isDragging = false
	let scrollerScrollWidth = 300
	let scrollerWidth = 300
	let scrollerScrollHeight = 300
	let scrollerHeight = 300
	const securityMargin = 0
	const padding = { start: 0, end: 0 }
	const scrollPadding = { start: 0, end: 0 }
	let gap = 0
	let snapPoints: number[] = []
	let snapElements: HTMLElement[] = []
	let snapAlignments: ScrollLogicalPosition[] = []
	const virtualSnapPoints: number[] = []
	let slides: HTMLElement[] = []
	let resizeObserver: ResizeObserver | null = null
	let mutationObserver: MutationObserver | null = null
	let hasSnap = false
	let hasMouse = false
	let nativeScroll = true
	let restoreScrollMethods: () => void
	let dir = 1

	function init() {
		scroller?.setAttribute('blossom-carousel', 'true')
		slides = Array.from(scroller.children) as HTMLElement[]

		window.addEventListener('keydown', onKeydown)
		scroller.addEventListener('scroll', onScroll)

		dir = scroller.closest('[dir="rtl"]') ? -1 : 1

		const { scrollSnapType } = window.getComputedStyle(scroller)
		hasSnap = scrollSnapType !== 'none'
		scroller.style.setProperty('--snap-type', scrollSnapType)
		scroller.setAttribute('has-repeat', options?.repeat ? 'true' : 'false')

		hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches

		nativeScroll = !hasMouse && !options?.repeat
		if (!nativeScroll) {
			scroller.style['scroll-snap-type'] = 'none'
		}

		restoreScrollMethods = interceptScrollIntoViewCalls((target) => {
			if (target === scroller || scroller.contains(target)) setIsTicking(false)
		})

		resizeObserver = new ResizeObserver(onResize)
		// If scroller width matches parent width, observe parent for resize events
		// (ResizeObserver may not fire on elements sized by their containers)
		const parent = scroller.parentElement
		if (parent && scroller.clientWidth === parent.clientWidth) {
			resizeObserver.observe(parent)
		} else {
			resizeObserver.observe(scroller)
		}

		mutationObserver = new MutationObserver(onMutation)
		mutationObserver.observe(scroller, {
			attributes: false,
			childList: true,
			subtree: false,
		})
	}

	function destroy() {
		scroller.removeAttribute('blossom-carousel')
		resizeObserver?.disconnect()
		mutationObserver?.disconnect()
		if (raf) cancelAnimationFrame(raf)

		window.removeEventListener('keydown', onKeydown)
		scroller.removeEventListener('scroll', onScroll)

		restoreScrollMethods?.()
	}

	function onResize(): void {
		if (!scroller) return

		setIsTicking(false)

		// reset translates
		for (let i = 0; i < snapElements.length; i++) {
			const el = snapElements[i]
			el.style.translate = ''
		}

		scrollerScrollWidth = scroller.scrollWidth
		scrollerWidth = scroller.clientWidth
		scrollerScrollHeight = scroller.scrollHeight
		scrollerHeight = scroller.clientHeight

		const styles = window.getComputedStyle(scroller)
		hasOverflow.x =
			// !hasTouch &&
			scrollerScrollWidth > scrollerWidth && ['auto', 'scroll'].includes(styles.getPropertyValue('overflow-x'))
		hasOverflow.y =
			// !hasTouch &&
			scrollerScrollHeight > scrollerHeight && ['auto', 'scroll'].includes(styles.getPropertyValue('overflow-y'))
		padding.start = Number.parseInt(styles.paddingInlineStart, 10) || 0
		padding.end = Number.parseInt(styles.paddingInlineEnd, 10) || 0
		scrollPadding.start = Number.parseInt(styles.scrollPaddingInlineStart, 10) || 0
		scrollPadding.end = Number.parseInt(styles.scrollPaddingInlineEnd, 10) || 0
		dir = scroller.closest('[dir="rtl"]') ? -1 : 1
		gap = Number.parseInt(styles.gap, 10) || Number.parseInt(styles.columnGap, 10) || 0
		end = (scrollerScrollWidth - scrollerWidth - securityMargin + gap) * dir

		const result = !hasSnap ? { points: [], elements: [], alignments: [], sizes: [] } : findSnapPoints(scroller)
		snapPoints = result.points
		snapElements = result.elements
		snapAlignments = result.alignments

		target.x = virtualScroll.x = snapPoints[currentIndex.value]
		scroller.scrollTo({ left: virtualScroll.x, behavior: 'instant' })
		if (options?.repeat) {
			onRepeat()
		}
	}

	function onMutation(): void {
		onResize()
	}

	function findSnapPoints(scroller: HTMLElement): {
		points: number[]
		elements: HTMLElement[]
		alignments: ScrollLogicalPosition[]
	} {
		const points: { align: string; el: HTMLElement | Element }[] = []

		let cycles = 0
		const traverseDOM = (node: HTMLElement | Element) => {
			cycles++
			// break if the max depth is reached
			if (cycles > 100) return

			const styles = window.getComputedStyle(node)
			const scrollSnapAlign = styles.scrollSnapAlign

			// break if a snap-type value  is found
			if (scrollSnapAlign !== 'none') {
				points.push({
					align: scrollSnapAlign,
					el: node,
				})
				return
			}

			// traverse all children
			const children = node.children
			if (children.length === 0) return
			for (const child of children) {
				traverseDOM(child)
			}
		}
		traverseDOM(scroller)

		// precompute snap point for all slides
		const scrollerRect = scroller.getBoundingClientRect()
		const snapData = points.map(({ el, align }) => {
			const elementRect = (el as HTMLElement).getBoundingClientRect()
			const clientWidth = (el as HTMLElement).clientWidth
			const left = elementRect.left - scrollerRect.left + scroller.scrollLeft

			let position: number | null = null
			switch (align) {
				case 'start':
					position = left - scrollPadding.start
					break
				case 'end':
					position = left + clientWidth - scrollerWidth + scrollPadding.end
					break
				case 'center':
					position = left + clientWidth * 0.5 - scrollerWidth / 2
					break
			}

			return { position, element: el as HTMLElement, align }
		})

		// Filter out duplicates (i.e. in case of multiple rows)
		const filteredData: { position: number; element: HTMLElement; align: ScrollLogicalPosition }[] = []
		const seenPositions = new Set<number>()

		for (const item of snapData) {
			if (item.position !== null && !seenPositions.has(item.position)) {
				seenPositions.add(item.position)
				filteredData.push({ position: item.position, element: item.element, align: item.align as ScrollLogicalPosition })
			}
		}

		return {
			points: filteredData.map((d) => d.position),
			elements: filteredData.map((d) => d.element),
			alignments: filteredData.map((d) => d.align),
		}
	}

	function onScroll() {
		if (isDragging || !scroller) return

		if (!isTicking) {
			virtualScroll.x = target.x = scroller.scrollLeft
		}

		if (options?.repeat) {
			onRepeat()
			updateCurrentIndex()
			return
		}

		const scrollStart = scroller.scrollLeft
		const maxScroll = getMaxScrollPosition()

		if (scrollStart < 0) {
			const left = scrollStart * -1
			dispatchOverscrollEvent(left)
		} else if (scrollStart > maxScroll) {
			const left = scrollStart * -1 + maxScroll
			dispatchOverscrollEvent(left)
		}

		updateCurrentIndex()
	}

	/*********************
	 **** Drag events ****
	 *********************/

	const virtualScroll: Point = {
		x: 0,
		y: 0,
	}

	function addPointerListeners(): void {
		window.addEventListener('pointermove', onPointerMove, { passive: true })
		window.addEventListener('touchmove', onPointerMove, { passive: true })
		window.addEventListener('pointerup', onPointerUp, { passive: true })
		window.addEventListener('touchend', onPointerUp, { passive: true })
	}

	function removePointerListeners(): void {
		window.removeEventListener('pointermove', onPointerMove)
		window.removeEventListener('touchmove', onPointerMove)
		window.removeEventListener('pointerup', onPointerUp)
		window.removeEventListener('touchend', onPointerUp)
	}

	function onPointerDown(e: PointerEvent | TouchEvent): void {
		if (!scroller) return

		const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
		const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY

		if (hasOverflow.x) handleAxisPointerDown('x', clientX)
		if (hasOverflow.y) handleAxisPointerDown('y', clientY)

		distanceMovedSincePointerDown.x = 0
		isDragging = true

		addPointerListeners()
	}

	function onPointerMove(e: PointerEvent | TouchEvent): void {
		const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
		const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY

		if (hasOverflow.x) handleAxisPointerMove('x', clientX)
		if (hasOverflow.y) handleAxisPointerMove('y', clientY)

		if (distanceMovedSincePointerDown.x > 2 || distanceMovedSincePointerDown.y > 2) scroller.classList.add('blossom-dragging')
	}

	function onPointerUp(): void {
		removePointerListeners()

		isDragging = false
		scroller.classList.remove('blossom-dragging')

		if (distanceMovedSincePointerDown.x <= 10) return
		if (hasOverflow.x) velocity.x *= 2
		if (hasOverflow.y) velocity.y *= 2

		dragSnap()
	}

	function onWheel(e: WheelEvent): void {
		if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
			setIsTicking(false)
			if (isDragging || !scroller) return
			if (hasOverflow.x) virtualScroll.x = scroller.scrollLeft
			if (hasOverflow.y) virtualScroll.y = scroller.scrollTop
		}
	}

	function onKeydown(e: KeyboardEvent): void {
		if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) setIsTicking(false)
	}

	function dragSnap(): void {
		//TODO: add support for vertical snapping
		let slideX: number | undefined

		if (options?.repeat && snapElements.length > 0) {
			// Strict single-step using helpers
			const n = snapPoints.length
			if (n >= 2) {
				const ci = ((currentIndex.value % n) + n) % n
				const step: 1 | -1 = velocity.x * dir >= 0 ? 1 : -1
				const targetIdx = (ci + step + n) % n
				slideX = computeRepeatSlideX(targetIdx, step)
			} else {
				slideX = snapSelect({ axis: 'x' })
			}
		} else if (!options?.repeat && snapElements.length) {
			const bounds = getScrollBounds()
			slideX = clamp(snapSelect({ axis: 'x' }), bounds.min, bounds.max)
		}

		if (slideX === undefined) return

		animateToSlideX(slideX)
	}

	/*********************
	 ***** WRAP *****
	 *********************/

	// Reuse these allocations to avoid GC pressure in repeat mode
	const repeatVirtualCache: number[] = []
	const repeatElementOffsetCache = new Map<HTMLElement, number>()

	function onRepeat(): void {
		if (!scroller) return

		const loopWidth = getLoopWidth()
		if (loopWidth === 0) return

		if (virtualScroll.x >= end) {
			virtualScroll.x -= loopWidth
			target.x -= loopWidth
			if (!isTicking) {
				scroller.scrollTo({ left: virtualScroll.x, behavior: 'instant' })
			}
		} else if (virtualScroll.x <= securityMargin) {
			virtualScroll.x += loopWidth
			target.x += loopWidth
			if (!isTicking) {
				scroller.scrollTo({ left: virtualScroll.x, behavior: 'instant' })
			}
		}

		const scrollLeft = virtualScroll.x

		// Clear and reuse cached arrays/maps
		repeatElementOffsetCache.clear()
		repeatVirtualCache.length = snapPoints.length

		// Compute offsets for snapped elements first to produce a dense virtualSnapPoints
		for (let i = 0; i < snapElements.length; i++) {
			const el = snapElements[i]
			const basePoint = snapPoints[i] ?? 0
			const alignement = snapAlignments[i] ?? 'start'
			const dx = alignement === 'start' ? 0 : alignement === 'end' ? (scrollerWidth - el.clientWidth) / 2 : (-scrollerWidth + el.clientWidth) / 2
			const raw = (scrollLeft - basePoint + dx) / loopWidth
			const k = Math.round(raw + (velocity.x >= 0 ? 0.001 : -0.001))
			const offsetX = k * loopWidth
			el.style.translate = `${offsetX}px 0`
			repeatElementOffsetCache.set(el, offsetX)
			repeatVirtualCache[i] = basePoint + offsetX
		}

		// Translate non-snap slides to the nearest previous snapped slide's cycle
		for (let i = 0; i < slides.length; i++) {
			const el = slides[i]
			if (repeatElementOffsetCache.has(el)) continue
			let prevTranslate = 0
			for (let j = i - 1; j >= 0; j--) {
				const prevEl = slides[j]
				const val = repeatElementOffsetCache.get(prevEl)
				if (val !== undefined) {
					prevTranslate = val
					break
				}
			}
			el.style.translate = `${prevTranslate}px 0`
		}

		// Replace contents of virtualSnapPoints with the dense array
		virtualSnapPoints.length = 0
		for (let i = 0; i < repeatVirtualCache.length; i++) virtualSnapPoints.push(repeatVirtualCache[i])
	}

	/******************
	 ***** Ticker *****
	 ******************/

	const FRICTION = 0.72
	const DAMPING = 0.12
	let isTicking = false

	function setIsTicking(bool: boolean): void {
		if (!scroller) return

		if (bool && !isTicking) {
			lastTick = performance.now()
			if (hasOverflow.x) target.x = scroller.scrollLeft
			if (hasOverflow.y) target.y = scroller.scrollTop

			if (!raf) {
				raf = requestAnimationFrame(tick)
			}
		} else if (!bool && raf) {
			cancelAnimationFrame(raf)
			raf = null
		}

		isTicking = bool
		snap = !bool

		scroller.setAttribute('has-snap', snap ? 'true' : 'false')
	}

	let frameDelta = 0
	let lastTick = 0
	function tick(t: number): void {
		raf = requestAnimationFrame(tick)
		frameDelta = t - lastTick

		if (!scroller) return

		if (hasOverflow.x) handleAxisTick('x')
		if (hasOverflow.y) handleAxisTick('y')

		if (options?.repeat) {
			onRepeat()
		} else {
			applyRubberBanding(round(virtualScroll.x, 2))
		}

		__scrollingInternally = true
		scroller.scrollTo({
			left: virtualScroll.x,
			top: virtualScroll.y,
			behavior: 'instant' as ScrollBehavior,
		})

		updateCurrentIndex()

		lastTick = t
	}

	let rubberBandOffset = 0
	function applyRubberBanding(left: number): void {
		if (!scroller) return

		//TODO: add support for vertical rubber banding
		const edge = end

		let targetOffset = 0
		if (left * dir <= 0) {
			targetOffset = isDragging ? left * -0.2 : 0
		} else if (left * dir > edge * dir) {
			targetOffset = isDragging ? (left - edge) * -0.2 : 0
		}
		rubberBandOffset = damp(rubberBandOffset, targetOffset, isDragging ? 0.8 : DAMPING, frameDelta)

		if (Math.abs(rubberBandOffset) > 0.01) {
			const evt = dispatchOverscrollEvent(rubberBandOffset)
			if (evt.defaultPrevented) return
			scroller.style.transform = `translateX(${round(rubberBandOffset, 3)}px)`
			return
		}

		scroller.style.transform = ''
		rubberBandOffset = 0
	}

	function dispatchOverscrollEvent(left: number): CustomEvent<{ left: number }> {
		const overscrollEvent = new CustomEvent('overscroll', {
			bubbles: true,
			cancelable: true,
			detail: { left },
		})
		scroller?.dispatchEvent(overscrollEvent)
		return overscrollEvent
	}

	/******************************
	 ********* METHODS **************
	 ******************************/

	let __scrollingInternally = false

	const scrollTo = scroller.scrollTo.bind(scroller)
	scroller.scrollTo = ((optionsOrX?: ScrollToOptions | number, y?: number) => {
		const internal = __scrollingInternally === true
		if (!internal) setIsTicking(false)
		__scrollingInternally = false
		if (typeof optionsOrX === 'number') {
			scrollTo(optionsOrX, y)
		} else {
			scrollTo(optionsOrX)
		}
	}) as typeof scroller.scrollTo

	const scrollBy = scroller.scrollBy.bind(scroller)
	scroller.scrollBy = ((optionsOrX?: ScrollToOptions | number, y?: number) => {
		const internal = __scrollingInternally === true
		if (!internal) setIsTicking(false)
		__scrollingInternally = false
		if (typeof optionsOrX === 'number') {
			scrollBy(optionsOrX, y)
		} else {
			scrollBy(optionsOrX)
		}
	}) as typeof scroller.scrollBy

	function interceptScrollIntoViewCalls(onExternalScroll: (target: Element, method: string, args: any[]) => void) {
		const stopFns: Array<() => void> = []

		// Patch scrollIntoView for all elements
		const originalScrollIntoView = Element.prototype.scrollIntoView
		if (originalScrollIntoView) {
			Element.prototype.scrollIntoView = function (arg?: boolean | ScrollIntoViewOptions): void {
				onExternalScroll(this, 'scrollIntoView', [arg])
				originalScrollIntoView.call(this, arg)
			}
			stopFns.push(() => {
				Element.prototype.scrollIntoView = originalScrollIntoView
			})
		}

		return () =>
			stopFns.forEach((fn) => {
				fn()
			})
	}

	/******************************
	 ********* UTILS **************
	 ******************************/

	interface AxisOption {
		axis: 'x' | 'y'
	}

	function handleAxisPointerDown(axis: 'x' | 'y', clientPos: number): void {
		const scrollProp = axis === 'x' ? 'scrollLeft' : 'scrollTop'
		virtualScroll[axis] = scroller[scrollProp]
		target[axis] = scroller[scrollProp]
		pointerStart[axis] = clientPos
		velocity[axis] = 0
	}

	function handleAxisPointerMove(axis: 'x' | 'y', clientPos: number): void {
		const delta = pointerStart[axis] - clientPos
		target[axis] += delta
		velocity[axis] += delta
		pointerStart[axis] = clientPos
		distanceMovedSincePointerDown[axis] += Math.abs(delta)
	}

	function handleAxisTick(axis: 'x' | 'y'): void {
		velocity[axis] *= FRICTION
		if (!isDragging) {
			target[axis] += velocity[axis]
			virtualScroll[axis] = damp(virtualScroll[axis], target[axis], DAMPING, frameDelta)
		} else {
			virtualScroll[axis] = damp(virtualScroll[axis], target[axis], FRICTION, frameDelta)
		}
	}

	function project({ axis = 'x' }: AxisOption): number {
		return target[axis] + velocity[axis] / (1 - FRICTION)
	}

	function snapSelect({ axis = 'x' }: AxisOption): number {
		const restingX = project({ axis })
		const points = virtualSnapPoints.length ? virtualSnapPoints : snapPoints
		return points.reduce((prev, curr) => (Math.abs(curr - restingX) < Math.abs(prev - restingX) ? curr : prev))
	}

	function lerp(x: number, y: number, t: number): number {
		return (1 - t) * x + t * y
	}

	function damp(x: number, y: number, t: number, delta: number): number {
		return lerp(x, y, 1 - Math.exp(Math.log(1 - t) * (delta / (1000 / 60))))
	}

	function clamp(value: number, min: number, max: number): number {
		if (value < min) return min
		if (value > max) return max
		return value
	}

	function round(value: number, precision = 0): number {
		const multiplier = 10 ** precision
		return Math.round(value * multiplier) / multiplier
	}

	/******************************
	 ********* REPEAT UTILS *********
	 ******************************/

	function getLoopWidth(): number {
		return scrollerScrollWidth - scrollerWidth + gap
	}

	function getMaxScrollPosition(): number {
		return scrollerScrollWidth - scrollerWidth
	}

	function getScrollBounds(): { min: number; max: number } {
		const maxScroll = getMaxScrollPosition()
		return {
			min: Math.min(maxScroll * dir, 0),
			max: Math.max(maxScroll * dir, 0),
		}
	}

	function normalizeToCycle(point: number, reference: number): number {
		const w = getLoopWidth()
		if (w <= 0) return point
		const k = Math.round((reference - point) / w)
		return point + k * w
	}

	function animateToSlideX(slideX: number, enforceDir?: 1 | -1): void {
		if (slideX === undefined || Number.isNaN(slideX)) return

		setIsTicking(true)
		target.x = virtualScroll.x
		let distance = slideX - virtualScroll.x
		if (options?.repeat) {
			const w = getLoopWidth()
			if (w > 0) {
				// shortest path wrapping
				distance = distance - Math.round(distance / w) * w
				// optionally enforce intended direction (for prev/next)
				if (enforceDir === 1 && distance * dir <= 0) distance += w * dir
				if (enforceDir === -1 && distance * dir >= 0) distance -= w * dir
			}
		}
		const force = distance * (1 - FRICTION) * (1 / FRICTION)
		velocity.x = force
	}

	function computeRepeatSlideX(targetIndex: number, directionSign: 1 | -1): number {
		const base = snapPoints[targetIndex] ?? 0
		const candidate = normalizeToCycle(base, virtualScroll.x)
		const w = getLoopWidth()
		if (w <= 0) return candidate
		const delta = candidate - virtualScroll.x
		if (directionSign === 1 && delta * dir <= 0) return candidate + w * dir
		if (directionSign === -1 && delta * dir >= 0) return candidate - w * dir
		return candidate
	}

	/******************************
	 ********* NAVIGATION *********
	 ******************************/

	function getCurrentSnapIndex(): number {
		const points = options?.repeat && virtualSnapPoints.length ? virtualSnapPoints : snapPoints
		if (!points.length) return 0

		const currentScroll = scroller.scrollLeft
		let closestIndex = 0
		let closestDistance = Math.abs(points[0] - currentScroll)

		for (let i = 1; i < points.length; i++) {
			const distance = Math.abs(points[i] - currentScroll)
			if (distance < closestDistance) {
				closestDistance = distance
				closestIndex = i
			}
		}

		return closestIndex
	}

	function updateCurrentIndex(): void {
		const newIndex = getCurrentSnapIndex()
		if (currentIndex.value !== newIndex) {
			currentIndex.value = newIndex
		}
	}

	function navigate(direction: 1 | -1): void {
		if (snapElements.length <= 1) return

		const points = snapPoints
		const targetIndex = options?.repeat
			? (currentIndex.value + direction + points.length) % points.length
			: direction === 1
				? Math.min(currentIndex.value + 1, points.length - 1)
				: Math.max(currentIndex.value - 1, 0)

		if (nativeScroll) {
			const align = snapAlignments[targetIndex] ?? 'start'
			;(snapElements[targetIndex] as HTMLElement).scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: align,
			})
			return
		}

		let slideX: number | undefined
		if (options?.repeat && points.length >= 2) {
			const loopWidth = getLoopWidth()
			const base = points[targetIndex]
			const k = loopWidth > 0 ? Math.round((virtualScroll.x - base) / loopWidth) : 0
			let candidate = base + k * loopWidth
			const delta = candidate - virtualScroll.x
			if (direction === 1 && delta * dir <= 0) candidate += loopWidth * dir
			if (direction === -1 && delta * dir >= 0) candidate -= loopWidth * dir
			slideX = candidate
		} else {
			const bounds = getScrollBounds()
			slideX = clamp(points[targetIndex], bounds.min, bounds.max)
		}

		animateToSlideX(slideX, direction)
	}

	function next(): void {
		navigate(1)
	}

	function prev(): void {
		navigate(-1)
	}

	return {
		init,
		snap,
		hasOverflow,
		currentIndex: () => currentIndex.value,
		next,
		prev,
		destroy,
	}
}
