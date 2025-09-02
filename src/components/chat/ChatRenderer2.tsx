import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useMathJaxInitializer, mathJaxManager } from '@/hooks/useMathJaxInitializer';

// 🧠 Converts [math] → $$math$$ and (math) → $math$
function normalizeMathDelimiters(input: string): string {
  // Replace \[ ... \] with $$ ... $$ (block math)
  let result = input.replace(/\\\[\s*(.*?)\s*\\\]/gs, (_, content) => `\n\n$$${content.trim()}$$\n\n`);
  
  // Replace [ ... ] with $$ ... $$ (block math) - but be more careful
  result = result.replace(/\[\s*([^[\]]*(?:\\.[^[\]]*)*)\s*\]/gs, (match, content) => {
    // Skip if it looks like a markdown link
    if (match.includes('](') || match.includes('http')) {
      return match;
    }
    return `\n\n$$${content.trim()}$$\n\n`;
  });

  // Replace \( ... \) with $ ... $ (inline math)
  result = result.replace(/\\\(\s*(.*?)\s*\\\)/gs, (_, content) => `$${content.trim()}$`);
  
  // Replace ( ... ) with $ ... $ (inline math) - but be more careful
  result = result.replace(/\(\s*([^()]*(?:\\.[^()]*)*)\s*\)/gs, (match, content) => {
    // Skip if it looks like regular parentheses in text
    if (content.length < 3 || /^[a-zA-Z\s]+$/.test(content) || content.includes(' ')) {
      return match;
    }
    return `$${content.trim()}$`;
  });

  return result;
}

function sanitizeLatex(input: string): string {
  return input
    .replace(/\{\{+/g, '{')                            // remove extra open braces
    .replace(/\}\}+/g, '}')                            // remove extra close braces
    .replace(/([^\\])%/g, '$1\\%');                    // escape % for MathJax
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

    // Process MathJax immediately when component mounts or text changes
    mathJaxManager.renderMath(containerRef.current).then(() => {
      // Apply styling after MathJax rendering is complete
      const mathElements = containerRef.current?.querySelectorAll('.MathJax');
      mathElements?.forEach(element => {
        const mathJaxElement = element as HTMLElement;
        mathJaxElement.classList.add('animate-math-fade-in');
        
        if (mathJaxElement.classList.contains('MathJax_Display')) {
          mathJaxElement.style.textAlign = 'center';
          mathJaxElement.style.margin = '12px 0';
        }
        
        // Apply color based on message type
        mathJaxElement.style.color = isUserMessage ? 'white' : '#333';
      });
    }).catch((error) => {
      console.error('MathJax rendering failed:', error);
    });
  }, [text, isMathJaxReady, isUserMessage]);

  const linkColor = isUserMessage
    ? 'text-blue-200 hover:text-blue-100'
    : 'text-emerald-600 hover:text-emerald-700';

  const textColor = isUserMessage ? 'text-white' : 'text-gray-800';

  return (
    <div 
      ref={containerRef} 
      className={`prose prose-sm max-w-none ${className} ${textColor}`}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),
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
            <strong className={`${isUserMessage ? 'text-white' : 'text-gray-800'} font-semibold`}>{children}</strong>
          ),
          em: ({ children }) => (
            <em className={`${isUserMessage ? 'text-white/90' : 'text-gray-700'} italic`}>{children}</em>
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
