import { useRef, useState } from 'react'
import BlossomCarousel, { type BlossomCarouselRef } from './BlossomCarousel'
import '@blossom-carousel/core/style.css'

export default function App() {
	const carouselRef = useRef<BlossomCarouselRef>(null)
	const [currentIndex, setCurrentIndex] = useState(0)

	const handlePrev = () => {
		carouselRef.current?.prev()
	}

	const handleNext = () => {
		carouselRef.current?.next()
	}

	const handleChange = (e: CustomEvent<{ index: number }>) => {
		setCurrentIndex(e.detail.index)
	}

	return (
		<div className='page'>
			<h1>Blossom in React</h1>
			<p>Current slide: {currentIndex + 1}</p>
			<BlossomCarousel ref={carouselRef} as='ul' className='carousel' onChange={handleChange}>
				{Array.from({ length: 12 }, (_, i) => (
					<li key={`slide${i + 1}`} className='slide'>
						{i + 1}
					</li>
				))}
			</BlossomCarousel>
			<div>
				<button onClick={handlePrev}>Previous</button>
				<button onClick={handleNext}>Next</button>
			</div>
		</div>
	)
}
