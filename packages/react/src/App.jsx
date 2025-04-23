import React from "react";
import BlossomCarousel from "./BlossomCarousel.jsx";

export default function App() {
  return (
    <div className="page">
      <h1>Blossom in React</h1>
      <BlossomCarousel as="ul" className="carousel">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={`slide${i + 1}`} className="slide">
            {i + 1}
          </li>
        ))}
      </BlossomCarousel>
    </div>
  );
}
