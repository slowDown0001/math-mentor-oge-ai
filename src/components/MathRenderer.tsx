
import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLElement>(null);

  // Detect if the text contains display math (\[...\]) or only inline math (\(...\))
  const hasDisplayMath = text.includes('\\[') && text.includes('\\]');
  const hasInlineMath = text.includes('\\(') && text.includes('\\)');
  
  // Use div for display math, span for inline math or mixed content
  const isInlineOnly = hasInlineMath && !hasDisplayMath;

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

  const combinedClassName = `math-renderer ${isInlineOnly ? 'math-inline' : 'math-display'} ${className}`.trim();

  // Use span for inline math, div for display math
  if (isInlineOnly) {
    return (
      <span ref={containerRef as React.RefObject<HTMLSpanElement>} className={combinedClassName}>
        {!text && ''}
      </span>
    );
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} className={combinedClassName}>
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
