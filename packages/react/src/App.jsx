import React from "react";
import BlossomCarousel from "./components/BlossomCarousel.jsx";

export default function App() {
  return (
    <div className="page">
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
