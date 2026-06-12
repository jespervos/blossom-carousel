import BlossomCarousel from "./BlossomCarousel";
import BlossomPrev from "./BlossomPrev";
import BlossomNext from "./BlossomNext";
import BlossomDots from "./BlossomDots";
import "@blossom-carousel/core/style.css";

export default function App() {
  return (
    <div className="page">
      <h1>Blossom in React</h1>
      <BlossomCarousel id="my-carousel" as="ul" className="carousel">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={`slide${i + 1}`} className="slide" data-blossom-slide>
            {i + 1}
          </li>
        ))}
      </BlossomCarousel>
      <div className="controls">
        <BlossomPrev for="my-carousel" />
        <BlossomDots for="my-carousel" />
        <BlossomNext for="my-carousel" />
      </div>
    </div>
  );
}
