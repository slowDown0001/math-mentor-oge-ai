
import { useEffect, useRef } from 'react';

interface LatexRendererProps {
  content: string;
  inline?: boolean;
}

const LatexRenderer = ({ content, inline }: LatexRendererProps) => {
  const containerRef = useRef<HTMLSpanElement | HTMLDivElement>(null);
  
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

  // Auto-detect if content should be inline or block
  const shouldBeInline = inline !== undefined 
    ? inline 
    : content.includes('\\(') && content.includes('\\)') && !content.includes('\\[') && !content.includes('\\]');

  const Container = shouldBeInline ? 'span' : 'div';

  return (
    <Container 
      ref={containerRef as any}
      className={shouldBeInline ? 'inline' : ''}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default LatexRenderer;
