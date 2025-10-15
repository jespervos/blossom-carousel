import { useRef } from "react";
import BlossomCarousel from "./BlossomCarousel";
import "@blossom-carousel/core/style.css";

export default function App() {
  const carouselRef = useRef<HTMLUListElement>(null);

  const handleClick = (next: boolean) => () => {
    if (!carouselRef.current) return;
    const slideWidth =
      carouselRef.current?.children?.[0]?.getBoundingClientRect?.()?.width;
    if (isNaN(slideWidth)) return;
    carouselRef.current.scrollBy({ left: slideWidth * (next ? 1 : -1) });
  };

  return (
    <div className="page">
      <h1>Blossom in React</h1>
      <BlossomCarousel ref={carouselRef} as="ul" className="carousel">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={`slide${i + 1}`} className="slide">
            {i + 1}
          </li>
        ))}
      </BlossomCarousel>
      <div>
        <button onClick={handleClick(false)}>Previous</button>
        <button onClick={handleClick(true)}>Next</button>
      </div>
    </div>
  );
}
