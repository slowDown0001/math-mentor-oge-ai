
import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  // Detect different LaTeX formats
  const hasDisplayMathBrackets = text.includes('\\[') && text.includes('\\]');
  const hasDisplayMathDollar = text.includes('$$');
  const hasInlineMathParens = text.includes('\\(') && text.includes('\\)');
  const hasInlineMathDollar = text.match(/(?<!\$)\$(?!\$)[^$]+\$(?!\$)/);
  
  // Determine if we have display math
  const hasDisplayMath = hasDisplayMathBrackets || hasDisplayMathDollar;
  const hasInlineMath = hasInlineMathParens || hasInlineMathDollar;
  
  // Use span for inline-only math, div for display math or mixed content
  const isInlineOnly = hasInlineMath && !hasDisplayMath;
  const Tag = isInlineOnly ? 'span' : 'div';

  useEffect(() => {
    const containerRef = isInlineOnly ? spanRef.current : divRef.current;
    if (!containerRef || !text) return;
    
    try {
      // Set the text content first
      containerRef.innerHTML = text;
      
      // Then let MathJax process it
      if (window.MathJax) {
        window.MathJax.typesetPromise([containerRef]).catch((err) => {
          console.error('MathJax error:', err);
        });
      }
    } catch (error) {
      console.error('Error rendering math:', error);
      if (containerRef) {
        containerRef.textContent = text;
      }
    }
  }, [text, isInlineOnly]);

  // Determine styling class based on math type
  const mathTypeClass = isInlineOnly ? 'math-inline' : 'math-display';
  const combinedClassName = `math-renderer ${mathTypeClass} ${className}`.trim();

  // Check if content is all display math for centering
  const isAllDisplayMath = hasDisplayMath && !hasInlineMath && 
    (text.trim().startsWith('\\[') || text.trim().startsWith('$$'));

  const finalClassName = isAllDisplayMath 
    ? `${combinedClassName} text-center`
    : combinedClassName;

  if (isInlineOnly) {
    return (
      <span 
        ref={spanRef} 
        className={finalClassName}
      >
        {!text && ''}
      </span>
    );
  }

  return (
    <div 
      ref={divRef} 
      className={finalClassName}
    >
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
