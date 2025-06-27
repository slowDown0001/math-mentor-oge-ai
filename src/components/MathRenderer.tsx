
import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLElement>(null);

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

  // Determine styling class based on math type
  const mathTypeClass = isInlineOnly ? 'math-inline' : 'math-display';
  const combinedClassName = `math-renderer ${mathTypeClass} ${className}`.trim();

  // Check if content is all display math for centering
  const isAllDisplayMath = hasDisplayMath && !hasInlineMath && 
    (text.trim().startsWith('\\[') || text.trim().startsWith('$$'));

  const finalClassName = isAllDisplayMath 
    ? `${combinedClassName} text-center`
    : combinedClassName;

  return (
    <Tag 
      ref={containerRef as React.RefObject<HTMLElement>} 
      className={finalClassName}
    >
      {!text && ''}
    </Tag>
  );
};

export default MathRenderer;
