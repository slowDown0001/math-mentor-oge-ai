import { useEffect, useRef } from "react";
import p5 from "p5";

export default function useFlyingMathBackground(parentRef: React.RefObject<HTMLDivElement>) {
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (!parentRef.current || p5Ref.current) return;

    const sketch = (p: p5) => {
      const syms = ["∑", "∫", "π", "∞", "√", "Δ", "θ", "α", "β"];
      type Part = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; sym: string };
      const parts: Part[] = [];

      p.setup = () => {
        const c = p.createCanvas(p.windowWidth, p.windowHeight);
        c.parent(parentRef.current!);
        p.pixelDensity(p.displayDensity());
        p.clear();

        for (let i = 0; i < 80; i++) {
          parts.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-0.5, 0.5),
            vy: p.random(-0.5, 0.5),
            size: p.random(2, 4),
            opacity: p.random(0.4, 0.7),
            sym: syms[Math.floor(p.random(syms.length))],
          });
        }
      };

      p.draw = () => {
        p.clear();

        parts.forEach((pt) => {
          pt.x += pt.vx; pt.y += pt.vy;
          if (pt.x < 0) pt.x = p.width;
          if (pt.x > p.width) pt.x = 0;
          if (pt.y < 0) pt.y = p.height;
          if (pt.y > p.height) pt.y = 0;

          p.fill(245, 158, 11, pt.opacity * 255);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(pt.size * 8);
          p.text(pt.sym, pt.x, pt.y);
        });

        p.stroke(245, 158, 11, 100);
        p.strokeWeight(1);
        for (let i = 0; i < parts.length; i++) {
          for (let j = i + 1; j < parts.length; j++) {
            const d = p.dist(parts[i].x, parts[i].y, parts[j].x, parts[j].y);
            if (d < 100) p.line(parts[i].x, parts[i].y, parts[j].x, parts[j].y);
          }
        }
      };

      p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p5Ref.current = new p5(sketch);
    return () => {
      p5Ref.current?.remove();
      p5Ref.current = null;
    };
  }, [parentRef]);
}
