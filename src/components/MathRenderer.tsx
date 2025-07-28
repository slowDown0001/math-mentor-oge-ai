import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import { useMathJaxInitializer, mathJaxManager } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
  isUserMessage?: boolean;
}

const MathRenderer = ({ text, className = '', isUserMessage = false }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMathJaxReady = useMathJaxInitializer();

  useEffect(() => {
    if (!containerRef.current || !text || !isMathJaxReady) return;

    // Use requestAnimationFrame to ensure DOM is fully rendered before MathJax
    const timeoutId = setTimeout(() => {
      mathJaxManager.renderMath(containerRef.current!);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [text, isMathJaxReady]);

  const linkColor = isUserMessage 
    ? 'text-blue-200 hover:text-blue-100' 
    : 'text-emerald-600 hover:text-emerald-700';

  return (
    <div ref={containerRef} className={`prose prose-sm max-w-none math-content tex2jax_process ${className}`}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                
          a: ({ href, children, ...props }) => (
                  
                  
            <a 
              href={href}
              className={`${linkColor} underline decoration-2 underline-offset-2 font-medium transition-colors cursor-pointer`}
              onClick={(e) => {
                if (href?.startsWith('/')) {
                  e.preventDefault();
                  window.location.href = href;
                }
              }}
              target={href?.startsWith('http') ? '_blank' : '_self'}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={isUserMessage ? 'text-foreground font-semibold' : 'text-foreground font-semibold'}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={isUserMessage ? 'text-foreground/90 italic' : 'text-foreground/80 italic'}>
              {children}
            </em>
          ),
          br: () => <br className="leading-relaxed" />,
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          // Ensure math blocks are rendered properly
          div: ({ children, ...props }) => <div {...props}>{children}</div>,
          span: ({ children, ...props }) => <span {...props}>{children}</span>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};


export default MathRenderer;
