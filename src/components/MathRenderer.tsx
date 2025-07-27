import React, { useEffect, useRef } from 'react';
import { useMathJaxInitializer } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Initialize MathJax - this is redundant since we already initialize it in Index.tsx,
  // but keeping it here for component isolation
  useMathJaxInitializer();

  useEffect(() => {
    if (!containerRef.current || !text) return;
    
    try {
      // Set the text content first
      containerRef.current.innerHTML = text;
      
      // Then let MathJax process it
      if (window.MathJax) {
        window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    } catch (error) {
      console.error('Error rendering math:', error);
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    }
  }, [text]);

  return (
    <div ref={containerRef} className={className}>
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
