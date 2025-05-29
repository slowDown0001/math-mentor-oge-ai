

import { useEffect, useRef } from 'react';

interface LatexRendererProps {
  content: string;
}

// Function to process LaTeX expressions
const processLatex = (content: string): string => {
  // Replace $...$ with \(...\) for inline math
  let processedContent = content.replace(/\$([^\$]+)\$/g, '\\($1\\)');
  
  // Replace $$...$$ with \[...\] for block math
  processedContent = processedContent.replace(/\$\$([^\$]+)\$\$/g, '\\[$1\\]');
  
  return processedContent;
};

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
  const timeout = setTimeout(tryRender, 100); // delay slightly to ensure DOM is ready

  return () => clearTimeout(timeout);
}, [content]);

  
  
  
  

  
  // Process content to ensure LaTeX expressions are properly formatted
  const processedContent = processLatex(content);
  
  return (
    <div 
      ref={containerRef} 
      dangerouslySetInnerHTML={{ __html: processedContent }}
      className="whitespace-pre-wrap"
    />
  );
};

export default LatexRenderer;

