
import React, { useEffect, useRef } from 'react';
import { useMathJaxInitializer } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const isMathJaxReady = useMathJaxInitializer();

  // Check if content is standalone display math
  const isStandaloneDisplayMath = text.trim().match(/^(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])$/);

  useEffect(() => {
    if (!divRef.current || !text || !isMathJaxReady) return;

    try {
      divRef.current.innerHTML = text;
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([divRef.current]).catch((err: any) => {
          console.error('MathJax error:', err);
        });
      }
    } catch (error) {
      console.error('Error rendering math:', error);
      if (divRef.current) {
        divRef.current.textContent = text;
      }
    }
  }, [text, isMathJaxReady]);

  const finalClassName = `math-renderer ${className}`.trim();
  const centerClass = isStandaloneDisplayMath ? 'text-center' : '';

  return (
    <div
      ref={divRef}
      className={`${finalClassName} ${centerClass}`.trim()}
    >
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
