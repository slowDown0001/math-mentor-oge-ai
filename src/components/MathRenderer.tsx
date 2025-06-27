import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  // Detect LaTeX formats
  const hasDisplayMathBrackets = text.includes('\\[') && text.includes('\\]');
  const hasDisplayMathDollar = text.includes('$$');
  const hasInlineMathParens = text.includes('\\(') && text.includes('\\)');
  const hasInlineMathDollar = text.match(/(?<!\$)\$(?!\$)[^$]+\$(?!\$)/);

  const hasDisplayMath = hasDisplayMathBrackets || hasDisplayMathDollar;
  const hasInlineMath = hasInlineMathParens || hasInlineMathDollar;

  const isInlineOnly = hasInlineMath && !hasDisplayMath;

  // Determine if it's a pure display math block (nothing but $$...$$ or \[...\])
  const isPureDisplayBlock = text.trim().match(/^(\$\$[\s\S]*\$\$|\\\[.*\\\])$/);

  useEffect(() => {
    const containerRef = isInlineOnly ? spanRef.current : divRef.current;
    if (!containerRef || !text) return;

    try {
      containerRef.innerHTML = text;
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

  const mathTypeClass = isInlineOnly ? 'math-inline' : 'math-display';
  const finalClassName = `${mathTypeClass} math-renderer ${className}`.trim();

  const Tag = isInlineOnly ? 'span' : 'div';
  const ref = isInlineOnly ? spanRef : divRef;

  return (
    <Tag
      ref={ref as any}
      className={isPureDisplayBlock ? `${finalClassName} text-center` : finalClassName}
    >
      {!text && ''}
    </Tag>
  );
};

export default MathRenderer;
