
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface LatexRendererProps {
  content: string;
}

// Function to process LaTeX expressions in Markdown content
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
    
    // Check if MathJax is loaded globally and process LaTeX
    if (window.MathJax) {
      try {
        // Process and typeset the container with LaTeX content
        window.MathJax.typesetPromise([containerRef.current])
          .catch((err) => console.error('MathJax typesetting error:', err));
      } catch (error) {
        console.error('MathJax error:', error);
      }
    }
  }, [content]);
  
  // Process content to ensure LaTeX expressions are properly formatted
  const processedContent = processLatex(content);
  
  return (
    <div ref={containerRef} className="whitespace-pre-wrap">
      <ReactMarkdown
        components={{
          img: ({ node, ...props }) => (
            <img 
              {...props} 
              style={{ maxWidth: '100%', height: 'auto' }} 
              alt={props.alt || 'Изображение'}
              className="rounded-lg border border-gray-200 my-2"
            />
          ),
          p: ({ children }) => <p className="mb-2">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2">
              {children}
            </pre>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default LatexRenderer;
