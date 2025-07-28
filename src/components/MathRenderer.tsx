import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMathJaxInitializer } from '../hooks/useMathJaxInitializer';

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

    try {
      if (
        typeof window.MathJax !== 'undefined' &&
        typeof window.MathJax.typesetPromise === 'function'
      ) {
        window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
          console.error('MathJax rendering error:', err);
        });
      }
    } catch (error) {
      console.error('Error rendering math:', error);
    }
  }, [text, isMathJaxReady]);

  const linkColor = isUserMessage ? 'text-blue-200 hover:text-blue-100' : 'text-emerald-600 hover:text-emerald-700';

  return (
    <div ref={containerRef} className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              className={`${linkColor} underline decoration-2 underline-offset-2 font-medium transition-colors`}
              target={href?.startsWith('http') ? '_blank' : '_self'}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={isUserMessage ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={isUserMessage ? 'text-white/90' : 'text-gray-700'}>
              {children}
            </em>
          ),
          br: () => <br className="leading-relaxed" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};


export default MathRenderer;
