import React, { useEffect, useRef } from 'react';
import { useMathJaxInitializer } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMathJaxReady = useMathJaxInitializer(); // 🟢 Get readiness flag

  useEffect(() => {
    if (!containerRef.current || !text || !isMathJaxReady) return;

    try {
      containerRef.current.innerHTML = text;

      if (
        typeof window.MathJax !== 'undefined' &&
        typeof window.MathJax.typesetPromise === 'function'
      ) {
        window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
          console.error('MathJax rendering error:', err);
        });
      } else {
        console.warn('MathJax not ready or typesetPromise not found');
      }
    } catch (error) {
      console.error('Error rendering math:', error);
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    }
  }, [text, isMathJaxReady]); // 🔁 Watch for readiness

  return (
    <div ref={containerRef} className={className}>
      {!text && ''}
    </div>
  );
};


export default MathRenderer;
