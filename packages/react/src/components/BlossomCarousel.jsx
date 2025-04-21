import React, { useEffect, useRef } from "react";
import { Blossom } from "@blossom-carousel/core";

const BlossomCarousel = ({
  as: Component = "div",
  repeat = false,
  children,
  ...rest
}) => {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const blossom = Blossom(scrollerRef.current, { repeat });
    blossom.init();
    return () => {
      blossom.destroy();
    };
  }, [repeat]);

  return (
    <Component ref={scrollerRef} blossom-carousel="true" {...rest}>
      {children}
    </Component>
  );
};

export default BlossomCarousel;
