
import { useEffect, useRef } from 'react';

interface LatexRendererProps {
  content: string;
}

const LatexRenderer = ({ content }: LatexRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const tryRender = async () => {
      if (!window.MathJax || !containerRef.current) return;

      try {
        await window.MathJax.typesetPromise([containerRef.current]);
      } catch (error) {
        console.error("MathJax typesetting error:", error);
      }
    };

    // Wait briefly to ensure the content is in the DOM
    const timeout = setTimeout(tryRender, 100);

    return () => clearTimeout(timeout);
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default LatexRenderer;
