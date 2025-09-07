import React, { useEffect, useRef } from 'react';
import { kaTeXManager } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    try {
      containerRef.current.innerHTML = text;
      // Use KaTeX manager to render math
      kaTeXManager.renderMath(containerRef.current);
    } catch (error) {
      console.error('Error rendering math:', error);
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    }
  }, [text]);

  return (
    <div ref={containerRef} className={className} data-message="math-content">
      {!text && ''}
    </div>
  );
};


export default MathRenderer;
