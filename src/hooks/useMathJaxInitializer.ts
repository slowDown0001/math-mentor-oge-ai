import { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

class KaTeXManager {
  renderMath(element: HTMLElement): void {
    try {
      // Find all inline math patterns
      this.processInlineMath(element);
      
      // Find all block math patterns
      this.processBlockMath(element);
    } catch (error) {
      console.error('KaTeX rendering error:', error);
    }
  }

  private processInlineMath(element: HTMLElement): void {
    // Process $...$ patterns
    element.innerHTML = element.innerHTML.replace(/\$([^$]+)\$/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return match;
      }
    });

    // Process \(...\) patterns
    element.innerHTML = element.innerHTML.replace(/\\\(([^)]+)\\\)/g, (match, math) => {
      try {
        return katex.renderToString(math.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return match;
      }
    });
  }

  private processBlockMath(element: HTMLElement): void {
    // Process $$...$$ patterns
    element.innerHTML = element.innerHTML.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
      try {
        return `<div class="katex-display">${katex.renderToString(math.trim(), { throwOnError: false, displayMode: true })}</div>`;
      } catch {
        return match;
      }
    });

    // Process \[...\] patterns
    element.innerHTML = element.innerHTML.replace(/\\\[([^\]]+)\\\]/g, (match, math) => {
      try {
        return `<div class="katex-display">${katex.renderToString(math.trim(), { throwOnError: false, displayMode: true })}</div>`;
      } catch {
        return match;
      }
    });
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