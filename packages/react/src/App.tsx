import { useLayoutEffect, useRef } from "react";
import BlossomCarousel, { type BlossomCarouselHandle } from "./BlossomCarousel";
import BlossomPrev from "./BlossomPrev";
import BlossomNext from "./BlossomNext";
import BlossomDots from "./BlossomDots";
import BlossomDot from "./BlossomDot";

const START_INDEX = 4;

export default function App() {
  const carousel = useRef<BlossomCarouselHandle>(null);

  // Runs after the carousel's own layout effect (children first), so the
  // command listener is registered and the carousel is positioned before the
  // browser paints. No flash of the first slide.
  useLayoutEffect(() => {
    carousel.current?.goTo(START_INDEX, { behavior: "instant" });
  }, []);

  return (
    <div className="page">
      <h1>Blossom in React</h1>
      <BlossomCarousel
        ref={carousel}
        id="my-carousel"
        as="ul"
        className="carousel"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <li key={`slide${i + 1}`} className="slide" data-blossom-slide>
            {i + 1}
          </li>
        ))}
      </BlossomCarousel>
      <div className="controls">
        <BlossomPrev for="my-carousel" />
        <BlossomDots for="my-carousel">
          {({ index, active }) => (
            <BlossomDot className="dot" data-active={active}>
              <img src="https://placehold.co/40x40" />
            </BlossomDot>
          )}
        </BlossomDots>
        <BlossomNext for="my-carousel" />
      </div>
    </div>
  );
}
