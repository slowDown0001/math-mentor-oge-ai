import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useMathJaxInitializer } from '@/hooks/useMathJaxInitializer';

interface ChatRendererProps {
  text: string;
  isUserMessage?: boolean;
  className?: string;
}

const ChatRenderer = ({ text, isUserMessage = false, className = '' }: ChatRendererProps) => {
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

  const linkColor = isUserMessage 
    ? 'text-blue-200 hover:text-blue-100' 
    : 'text-emerald-600 hover:text-emerald-700';

  return (
    <div ref={containerRef} className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
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
            <strong className={isUserMessage ? 'text-white font-semibold' : 'text-gray-900 font-semibold'}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={isUserMessage ? 'text-white/90 italic' : 'text-gray-700 italic'}>
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
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default ChatRenderer;