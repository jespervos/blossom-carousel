import { useRef } from "react";
import BlossomCarousel from "./BlossomCarousel";
import "@blossom-carousel/core/style.css";

export default function App() {
  const carouselRef = useRef<HTMLUListElement>(null);

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
        <button onClick={() => carouselRef.current?.prev({ align: "center" })}>
          Previous
        </button>
        <button onClick={() => carouselRef.current?.next({ align: "center" })}>
          Next
        </button>
      </div>
    </div>
  );
}
