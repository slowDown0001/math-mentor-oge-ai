import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import { useMathJaxInitializer, mathJaxManager } from '@/hooks/useMathJaxInitializer';

function normalizeMathDelimiters(input: string): string {
  // Replace only exact math delimiters like: [ \log_{x} 2 = 3 ]
  return input.replace(/\[\s*((?:\\[^\]]|[^\]\\])*)\s*\]/gs, (_, content) => {
    return `\n\n$$${content.trim()}$$\n\n`;
  });
}


interface ChatRenderer2Props {
  text: string;
  isUserMessage?: boolean;
  className?: string;
}

const ChatRenderer2 = ({ text, isUserMessage = false, className = '' }: ChatRenderer2Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMathJaxReady = useMathJaxInitializer();
  
  const normalizedText = normalizeMathDelimiters(text);

  useEffect(() => {
    if (!containerRef.current || !isMathJaxReady) return;
    mathJaxManager.renderMath(containerRef.current);
  }, [text, isMathJaxReady]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && containerRef.current && isMathJaxReady) {
        mathJaxManager.renderMath(containerRef.current);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isMathJaxReady]);

  const linkColor = isUserMessage 
    ? 'text-blue-200 hover:text-blue-100' 
    : 'text-emerald-600 hover:text-emerald-700';

  return (
    <div ref={containerRef} className={`prose prose-sm max-w-none tex2jax_process ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              className={`${linkColor} underline underline-offset-2`}
              target={href?.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="text-foreground/80 italic">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          )
        }}
      >
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
};

export default ChatRenderer2;
