import React, { useRef } from "react";
import useFlyingMathBackground from "@/hooks/useFlyingMathBackground";

const FlyingMathBackground: React.FC = () => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  useFlyingMathBackground(parentRef);

  return (
    <div
      ref={parentRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default FlyingMathBackground;
