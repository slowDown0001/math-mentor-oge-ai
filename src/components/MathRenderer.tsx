import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMathJaxInitializer } from '../hooks/useMathJaxInitializer';

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer = ({ text, className = '' }: MathRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useMathJaxInitializer();

  // Function to parse markdown-style links and convert them to JSX
  const parseTextWithLinks = (inputText: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(inputText)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(inputText.slice(lastIndex, match.index));
      }
      
      // Add the link as a placeholder that we'll replace later
      parts.push(`__LINK_${parts.length}_${match[1]}_${match[2]}__`);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < inputText.length) {
      parts.push(inputText.slice(lastIndex));
    }
    
    return parts.join('');
  };

  // Function to render content with clickable links
  const renderContentWithLinks = (inputText: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = linkRegex.exec(inputText)) !== null) {
      // Add text before the link
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {inputText.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add the link
      parts.push(
        <Link 
          key={`link-${keyCounter++}`}
          to={match[2]} 
          className="text-primary hover:text-primary/80 underline font-medium"
        >
          {match[1]}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < inputText.length) {
      parts.push(
        <span key={`text-${keyCounter++}`}>
          {inputText.slice(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };

  useEffect(() => {
    if (!containerRef.current || !text) return;
    
    try {
      // Check if text contains markdown links
      const hasLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(text);
      
      if (!hasLinks) {
        // No links, use original MathJax rendering
        containerRef.current.innerHTML = text;
        
        if (window.MathJax) {
          window.MathJax.typesetPromise([containerRef.current]).catch((err) => {
            console.error('MathJax error:', err);
          });
        }
      }
    } catch (error) {
      console.error('Error rendering math:', error);
      if (containerRef.current) {
        containerRef.current.textContent = text;
      }
    }
  }, [text]);

  // Check if text contains markdown links
  const hasLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(text);
  
  if (hasLinks) {
    // Render with React components for clickable links
    return (
      <div className={className}>
        {renderContentWithLinks(text)}
      </div>
    );
  }

  // Render with MathJax for math content
  return (
    <div ref={containerRef} className={className}>
      {!text && ''}
    </div>
  );
};

export default MathRenderer;
