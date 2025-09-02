import { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

class KaTeXManager {
  renderMath(element: HTMLElement): void {
    try {
      // Process math expressions without modifying innerHTML directly
      this.processTextNodes(element);
    } catch (error) {
      console.error('KaTeX rendering error:', error);
    }
  }

  private processTextNodes(element: HTMLElement): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(textNode => {
      const content = textNode.textContent || '';
      if (this.hasMathExpressions(content)) {
        this.replaceMathInTextNode(textNode);
      }
    });
  }

  private hasMathExpressions(text: string): boolean {
    return /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$[^$]+\$|\\\([^)]+\\\)/.test(text);
  }

  private replaceMathInTextNode(textNode: Text): void {
    const content = textNode.textContent || '';
    const parent = textNode.parentNode;
    
    if (!parent) return;

    // Create a temporary container to process the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.processMathContent(content);
    
    // Replace the text node with processed content
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    
    parent.replaceChild(fragment, textNode);
  }

  private processMathContent(content: string): string {
    // Process block math first ($$...$$ and \[...\])
    content = content.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
      try {
        return `<span class="katex-display" style="display: block; text-align: center; margin: 12px 0;">${katex.renderToString(math.trim(), { throwOnError: false, displayMode: true })}</span>`;
      } catch {
        return match;
      }
    });

    content = content.replace(/\\\[([^\]]+)\\\]/g, (match, math) => {
      try {
        return `<span class="katex-display" style="display: block; text-align: center; margin: 12px 0;">${katex.renderToString(math.trim(), { throwOnError: false, displayMode: true })}</span>`;
      } catch {
        return match;
      }
    });

    // Process inline math ($...$ and \(...\))
    content = content.replace(/\$([^$]+)\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return match;
      }
    });

    content = content.replace(/\\\(([^)]+)\\\)/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return match;
      }
    });

    return content;
  }

  renderAll(): void {
    const messageElements = document.querySelectorAll('[data-message]');
    messageElements.forEach((element) => {
      this.renderMath(element as HTMLElement);
    });
  }

  processVisibleMessages(): void {
    const messageElements = document.querySelectorAll('[data-message]');
    messageElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible) {
        this.renderMath(element as HTMLElement);
      }
    });
  }

  setupScrollObserver(): void {
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.processVisibleMessages();
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const chatContainers = document.querySelectorAll('[data-radix-scroll-area-viewport]');
    chatContainers.forEach(container => {
      container.addEventListener('scroll', handleScroll, { passive: true });
    });
  }
}

export const kaTeXManager = new KaTeXManager();

export const useKaTeXInitializer = (): boolean => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // KaTeX is ready immediately since it's imported
    setIsReady(true);
    kaTeXManager.setupScrollObserver();
  }, []);

  return isReady;
};

// Legacy exports for backward compatibility
export const mathJaxManager = kaTeXManager;
export const useMathJaxInitializer = useKaTeXInitializer;