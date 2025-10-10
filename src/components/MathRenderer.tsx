import React, { useEffect, useRef } from 'react';
import { kaTeXManager } from '../hooks/useMathJaxInitializer';
import { mathJaxManager } from '../hooks/useMathJaxManager';

interface MathRendererProps {
  text: string;
  className?: string;
  compiler?: 'katex' | 'mathjax';
}

// Default to MathJax
const MathRenderer = ({ text, className = '', compiler = 'mathjax' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !text) return;

    try {
      // Decode common HTML entities that often slip into LaTeX
      const decoded = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        // optional helpful remaps:
        .replace(/&le;/g, '\\le ')
        .replace(/&ge;/g, '\\ge ')
        .replace(/&ne;/g, '\\ne ')
        .replace(/&times;/g, '\\times ')
        .replace(/&middot;/g, '\\cdot ');

      el.innerHTML = decoded;

      if (compiler === 'katex') {
        kaTeXManager.renderMath(el);
      } else {
        mathJaxManager.renderMath(el);
      }
    } catch (error) {
      console.error(`Error rendering math with ${compiler}:`, error);
      el.textContent = text; // fallback to plain text
    }
  }, [text, compiler]);

  return (
    <div ref={containerRef} className={className} data-message="math-content">
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
