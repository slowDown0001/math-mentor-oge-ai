import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const mathSymbols = [
  { symbol: "∑", size: "text-4xl", color: "text-primary/20" },
  { symbol: "∫", size: "text-5xl", color: "text-secondary/25" },
  { symbol: "π", size: "text-3xl", color: "text-accent/30" },
  { symbol: "√", size: "text-4xl", color: "text-primary/15" },
  { symbol: "∞", size: "text-3xl", color: "text-muted-foreground/20" },
  { symbol: "θ", size: "text-4xl", color: "text-secondary/20" },
  { symbol: "α", size: "text-3xl", color: "text-accent/25" },
  { symbol: "β", size: "text-4xl", color: "text-primary/25" }
];

interface FloatingSymbolProps {
  symbol: string;
  size: string;
  color: string;
  index: number;
  mouseX: any;
  mouseY: any;
}

const FloatingSymbol = ({ symbol, size, color, index, mouseX, mouseY }: FloatingSymbolProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Create motion values for the symbol position
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Create springs for smooth movement
  const springConfig = { damping: 20, stiffness: 100 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  
  // Transform mouse position to influence symbol movement
  const xRange = useTransform(mouseX, [0, window.innerWidth], [-20, 20]);
  const yRange = useTransform(mouseY, [0, window.innerHeight], [-20, 20]);
  
  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        const factor = (index + 1) * 0.1; // Different symbols move at different rates
        x.set(xRange.get() * factor);
        y.set(yRange.get() * factor);
      }
    };
    
    const unsubscribeX = xRange.on("change", updatePosition);
    const unsubscribeY = yRange.on("change", updatePosition);
    
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y, xRange, yRange, index]);

  return (
    <motion.div
      ref={ref}
      className={`absolute ${size} ${color} select-none pointer-events-none font-serif`}
      style={{
        x: xSpring,
        y: ySpring,
        left: `${10 + (index * 12)}%`,
        top: `${15 + (index * 8)}%`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: [0, 5, -5, 0],
      }}
      transition={{ 
        duration: 2,
        delay: index * 0.2,
        rotate: {
          duration: 8 + index,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {symbol}
    </motion.div>
  );
};

export default function FloatingElements() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {mathSymbols.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className={`absolute ${item.size} ${item.color} select-none font-serif`}
            style={{
              left: `${20 + (index * 20)}%`,
              top: `${20 + (index * 15)}%`,
            }}
          >
            {item.symbol}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {mathSymbols.map((item, index) => (
        <FloatingSymbol
          key={index}
          symbol={item.symbol}
          size={item.size}
          color={item.color}
          index={index}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}
    </div>
  );
}