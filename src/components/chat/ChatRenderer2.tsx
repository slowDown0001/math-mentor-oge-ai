import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useMathJaxInitializer, mathJaxManager } from '@/hooks/useMathJaxInitializer';

// 🧠 Converts [(math)] → $$math$$ and ((inline math)) → $math$
function normalizeMathDelimiters(input: string): string {
  // Fix log_2x → \log_{2} x
  const fixedLogs = input.replace(/\blog_(\d+)([a-zA-Z])/g, (_, base, arg) => `\\log_{${base}} ${arg}`);

  // Replace [ ... ] with $$ ... $$ (block math)
  const withBlockMath = fixedLogs.replace(
    /\[\s*((?:\\[^\]]|[^\]\\])*)\s*\]/gs,
    (_, content) => `\n\n$$${sanitizeLatex(content.trim())}$$\n\n`
  );

  // Replace ( ... ) with $ ... $ (inline math)
  const withInlineMath = withBlockMath.replace(
    /\(\s*((?:\\[^\)]|[^\)\\])*)\s*\)/gs,
    (_, content) => `$${sanitizeLatex(content.trim())}$`
  );

  return withInlineMath;
}

function sanitizeLatex(input: string): string {
  return input
    .replace(/\^{2}/g, '^2')                          // unnecessary braces in ^2
    .replace(/([a-z])\^(\d)/g, '$1^{$2}')              // ensure x^2 → x^{2}
    .replace(/cdot([^a-zA-Z])/g, '\\cdot$1')           // fix unescaped cdot
    .replace(/\{\{+/g, '{')                            // remove extra open braces
    .replace(/\}\}+/g, '}')                            // remove extra close braces
    .replace(/([^\\])%/g, '$1\\%')                     // escape % for MathJax
    .replace(/([0-9])([a-zA-Z])/g, '$1 $2')            // add spacing after numbers
    .replace(/([a-zA-Z])([0-9])/g, '$1 $2');           // add spacing after letters
}

// 🎯 Safely split text without breaking LaTeX expressions
function createTypewriterChunks(text: string): string[] {
  const chunks: string[] = [];
  let currentChunk = '';
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    
    // Check for start of LaTeX expressions
    if (char === '$') {
      // Check if it's block math ($$)
      if (text[i + 1] === '$') {
        // Find the end of block math
        const endIndex = text.indexOf('$$', i + 2);
        if (endIndex !== -1) {
          // Add the complete LaTeX expression as one chunk
          currentChunk += text.slice(i, endIndex + 2);
          chunks.push(currentChunk);
          currentChunk = '';
          i = endIndex + 2;
          continue;
        }
      } else {
        // Find the end of inline math
        const endIndex = text.indexOf('$', i + 1);
        if (endIndex !== -1) {
          // Add the complete LaTeX expression as one chunk
          currentChunk += text.slice(i, endIndex + 1);
          chunks.push(currentChunk);
          currentChunk = '';
          i = endIndex + 1;
          continue;
        }
      }
    }
    
    // Regular character - add it and create a chunk
    currentChunk += char;
    chunks.push(currentChunk);
    i++;
  }
  
  return chunks;
}



interface ChatRenderer2Props {
  text: string;
  isUserMessage?: boolean;
  className?: string;
  disableTyping?: boolean;
}

const ChatRenderer2 = ({ text, isUserMessage = false, className = '', disableTyping = false }: ChatRenderer2Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMathJaxReady = useMathJaxInitializer();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasCompletedTyping, setHasCompletedTyping] = useState(false);

  const normalizedText = normalizeMathDelimiters(text);

  // 🎯 Typewriter effect
  useEffect(() => {
    if (disableTyping || isUserMessage) {
      setDisplayedText(normalizedText);
      setHasCompletedTyping(true);
      return;
    }

    // Reset state when text changes
    setDisplayedText('');
    setIsTyping(true);
    setHasCompletedTyping(false);

    const chunks = createTypewriterChunks(normalizedText);
    let currentIndex = 0;

    const typeNextChunk = () => {
      if (currentIndex < chunks.length) {
        setDisplayedText(chunks[currentIndex]);
        currentIndex++;
        
        // Typing speed: 25ms per chunk (feels natural)
        setTimeout(typeNextChunk, 25);
      } else {
        setIsTyping(false);
        setHasCompletedTyping(true);
      }
    };

    // Start typing animation
    const timeoutId = setTimeout(typeNextChunk, 50);
    
    return () => clearTimeout(timeoutId);
  }, [text, normalizedText, disableTyping, isUserMessage]);

  // 🧮 Render MathJax only after typing completes
  useEffect(() => {
    if (!containerRef.current || !isMathJaxReady || !hasCompletedTyping || isTyping) return;

    requestAnimationFrame(() => {
      mathJaxManager.renderMath(containerRef.current!);
    });
  }, [displayedText, isMathJaxReady, hasCompletedTyping, isTyping]);

  // Handle visibility changes for MathJax re-rendering
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && containerRef.current && isMathJaxReady && hasCompletedTyping) {
        mathJaxManager.renderMath(containerRef.current);
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [isMathJaxReady, hasCompletedTyping]);

  const linkColor = isUserMessage
    ? 'text-blue-200 hover:text-blue-100'
    : 'text-emerald-600 hover:text-emerald-700';

  return (
    <div ref={containerRef} className={`prose prose-sm max-w-none ${className}`}>
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
            <strong className="text-foreground font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-foreground/80 italic">{children}</em>
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
        {displayedText}
      </ReactMarkdown>
      {isTyping && <span className="animate-pulse">▋</span>}
    </div>
  );
};

export default ChatRenderer2;
