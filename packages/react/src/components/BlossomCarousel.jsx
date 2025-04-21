import React, { useEffect, useRef } from "react";
import { Blossom } from "@blossom-carousel/core";

const BlossomCarousel = ({
  as: Component = "div",
  repeat = false,
  children,
  ...rest
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const blossom = Blossom(rootRef.current, { repeat });
    blossom.init();
    return () => {
      blossom.destroy();
    };
  }, [repeat]);

  return (
    <Component ref={rootRef} blossom-carousel="true" {...rest}>
      {children}
    </Component>
  );
};

export default BlossomCarousel;
