import React, { useEffect, useRef } from 'react';
import { kaTeXManager } from '../hooks/useMathJaxInitializer';
import { mathJaxManager } from '../hooks/useMathJaxManager';

interface MathRendererProps {
  text: string;
  className?: string;
  compiler?: 'katex' | 'mathjax';
}

const MathRenderer = ({ text, className = '', compiler = 'katex' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !text) return;

    try {
      // Fix escaped symbols like &amp; -> &
      const decoded = text.replaceAll('&amp;', '&');
      containerRef.current.innerHTML = decoded;

      
      if (compiler === 'katex') {
        // Use KaTeX manager to render math
        kaTeXManager.renderMath(containerRef.current);
      } else if (compiler === 'mathjax') {
        // Use MathJax manager to render math
        mathJaxManager.renderMath(containerRef.current);
      }
    } catch (error) {
      console.error(`Error rendering math with ${compiler}:`, error);
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    }
  }, [text, compiler]);

  return (
    <div ref={containerRef} className={className} data-message="math-content">
      {!text && ''}
    </div>
  );
};


export default MathRenderer;
