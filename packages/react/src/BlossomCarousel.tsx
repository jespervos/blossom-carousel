import { Blossom } from '@blossom-carousel/core'
import { type ElementType, type ReactNode, type Ref, useEffect, useImperativeHandle, useRef } from 'react'

export interface BlossomCarouselRef {
	next: () => void
	prev: () => void
	currentIndex: () => number
}

export default function BlossomCarousel({
	children,
	as: Component = 'div',
	repeat,
	onChange,
	ref,
	...props
}: {
	children?: ReactNode | Array<ReactNode>
	as?: ElementType
	repeat?: boolean
	onChange?: (event: CustomEvent<{ index: number }>) => void
	ref?: Ref<BlossomCarouselRef | null>
	[key: string]: unknown
}) {
	const localRef = useRef<HTMLElement>(null)
	const blossomRef = useRef<ReturnType<typeof Blossom> | null>(null)

	useEffect(() => {
		if (!localRef.current) return

		const blossom = Blossom(localRef.current, { repeat })
		blossomRef.current = blossom
		blossom.init()

		return () => {
			blossom.destroy()
			blossomRef.current = null
		}
	}, [repeat])

	useEffect(() => {
		if (!localRef.current || !onChange) return

		const handleChange = (e: Event) => {
			onChange(e as CustomEvent<{ index: number }>)
		}

		localRef.current.addEventListener('change', handleChange)

		return () => {
			localRef.current?.removeEventListener('change', handleChange)
		}
	}, [onChange])

	useImperativeHandle(ref, () => ({
		next: () => blossomRef.current?.next(),
		prev: () => blossomRef.current?.prev(),
		currentIndex: () => blossomRef.current?.currentIndex() ?? 0,
	}), [])

	return (
		<Component ref={localRef} blossom-carousel='true' {...props}>
			{children}
		</Component>
	)
}
