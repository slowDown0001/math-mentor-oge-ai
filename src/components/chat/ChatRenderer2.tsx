import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useMathJaxInitializer, mathJaxManager } from '@/hooks/useMathJaxInitializer';
import { useProfile } from '@/hooks/useProfile';

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



interface ChatRenderer2Props {
  text: string;
  isUserMessage?: boolean;
  className?: string;
}

const ChatRenderer2 = ({ text, isUserMessage = false, className = '' }: ChatRenderer2Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMathJaxReady = useMathJaxInitializer();
  const { getDisplayName } = useProfile();

  // Replace placeholder {{userName}} with actual user name
  const personalizedText = text.replace(/\{\{userName\}\}/g, getDisplayName());
  const normalizedText = normalizeMathDelimiters(personalizedText);

  useEffect(() => {
    if (!containerRef.current || !isMathJaxReady) return;

    requestAnimationFrame(() => {
      mathJaxManager.renderMath(containerRef.current!);
    });
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
        {normalizedText}
      </ReactMarkdown>
    </div>
  );
};

export default ChatRenderer2;
