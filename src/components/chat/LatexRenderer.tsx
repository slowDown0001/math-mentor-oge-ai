

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
    if (!containerRef.current) return;
    
    // Check if MathJax is loaded globally
    if (window.MathJax) {
      try {
        // Process and typeset the container with LaTeX content
        window.MathJax.typesetPromise([containerRef.current])
          .catch((err) => console.error('MathJax typesetting error:', err));
      } catch (error) {
        console.error('MathJax error:', error);
      }
    } else {
      console.error('MathJax is not loaded globally');
    }
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

