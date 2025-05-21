
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
    
    // Import MathJax dynamically
    import('mathjax/es5/tex-svg.js').then((MathJax) => {
      const mathJax = MathJax.default;
      
      // Configure MathJax
      mathJax.startup.promise = mathJax.startup.promise
        .then(() => {
          try {
            // Process and typeset the container with LaTeX content
            mathJax.typesetPromise([containerRef.current])
              .catch((err) => console.error('MathJax typesetting error:', err));
          } catch (error) {
            console.error('MathJax error:', error);
          }
        })
        .catch((err) => console.error('MathJax initialization error:', err));
    });
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
