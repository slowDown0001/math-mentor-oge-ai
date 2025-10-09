import React, { useRef } from "react";
import useFlyingMathBackground from "@/hooks/useFlyingMathBackground";

const FlyingMathBackground: React.FC = () => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  useFlyingMathBackground(parentRef);

  return (
    <div
      ref={parentRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default FlyingMathBackground;
