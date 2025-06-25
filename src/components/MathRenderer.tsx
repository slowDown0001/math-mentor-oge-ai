
import React, { useEffect, useRef } from 'react';
import { useMathJaxInitializer } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useMathJaxInitializer();

  useEffect(() => {
    if (!containerRef.current || !text) return;
    try {
      containerRef.current.innerHTML = text;
      if (window.MathJax) {
        window.MathJax.typesetPromise([containerRef.current]).catch(console.error);
      }
    } catch (error) {
      console.error('Error rendering math:', error);
      containerRef.current.textContent = text;
    }
  }, [text]);

  return (
    <div ref={containerRef} className={className}>
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
