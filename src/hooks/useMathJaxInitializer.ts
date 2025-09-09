import { useState, useEffect } from 'react';
import katex from 'katex';
import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css';

// Declare renderMathInElement function for auto-render
declare global {
  interface Window {
    katex: any;
    renderMathInElement?: (element: HTMLElement, options?: any) => void;
  }
}

class KaTeXManager {
  private autoRenderLoaded = false;

  constructor() {
    this.loadAutoRender();
  }

  private loadAutoRender(): void {
    if (this.autoRenderLoaded) {
      return;
    }

    // Use the imported renderMathInElement directly
    if (typeof window !== 'undefined' && !window.renderMathInElement) {
      window.renderMathInElement = renderMathInElement;
      window.katex = katex;
    }
    
    this.autoRenderLoaded = true;
  }

  get isAutoRenderLoaded(): boolean {
    return this.autoRenderLoaded;
  }

  renderMath(element: HTMLElement): void {
    if (!this.autoRenderLoaded) {
      this.loadAutoRender();
    }

    try {
      renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\[", right: "\\]", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false }
        ],
        throwOnError: false
      });
    } catch (error) {
      console.error('KaTeX auto-render error:', error);
      // Fallback: try manual rendering for simple cases
      this.fallbackManualRender(element);
    }
  }

  private fallbackManualRender(element: HTMLElement): void {
    const textContent = element.textContent || '';
    
    // Simple regex-based fallback for basic math delimiters
    const mathPatterns = [
      { regex: /\$\$([^$]+)\$\$/g, display: true },
      { regex: /\$([^$]+)\$/g, display: false },
      { regex: /\\\[([^\]]+)\\\]/g, display: true },
      { regex: /\\\(([^\)]+)\\\)/g, display: false }
    ];

    let hasMatches = false;
    mathPatterns.forEach(pattern => {
      if (pattern.regex.test(textContent)) {
        hasMatches = true;
      }
    });

    if (hasMatches) {
      let html = element.innerHTML;
      mathPatterns.forEach(pattern => {
        html = html.replace(pattern.regex, (match, latex) => {
          try {
            return katex.renderToString(latex, { 
              displayMode: pattern.display,
              throwOnError: false 
            });
          } catch {
            return match; // Return original if rendering fails
          }
        });
      });
      element.innerHTML = html;
    }
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

  initializeChatWindow(): void {
    if (!this.autoRenderLoaded) {
      this.loadAutoRender();
    }

    // Find chat container and initialize auto-render
    const chatContainer = document.querySelector('[data-radix-scroll-area-viewport]');
    if (chatContainer) {
      try {
        renderMathInElement(chatContainer as HTMLElement, {
          delimiters: [
            { left: "$$", right: "$$", display: true },    // block
            { left: "\\[", right: "\\]", display: true },   // block
            { left: "$", right: "$", display: false },     // inline
            { left: "\\(", right: "\\)", display: false }, // inline
          ],
          throwOnError: false
        });
      } catch (error) {
        console.error('KaTeX chat window initialization error:', error);
      }
    }
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
    setIsReady(true);
    kaTeXManager.setupScrollObserver();
    kaTeXManager.initializeChatWindow();
    
    // Initialize auto-render on chat containers for exam pages
    const initializeChatContainers = () => {
      const chatWindow = document.getElementById("chat-window");
      if (chatWindow) {
        try {
          renderMathInElement(chatWindow, {
            delimiters: [
              { left: "$$", right: "$$", display: true },    // block
              { left: "\\[", right: "\\]", display: true },   // block
              { left: "$", right: "$", display: false },     // inline
              { left: "\\(", right: "\\)", display: false }, // inline
            ],
            throwOnError: false
          });
        } catch (error) {
          console.error('KaTeX auto-render initialization error:', error);
        }
      }
    };
    
    // Initialize immediately and set up observer for dynamic initialization
    initializeChatContainers();
    
    // Set up mutation observer to handle dynamically added chat windows
    const observer = new MutationObserver(() => {
      initializeChatContainers();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }, []);

  return isReady;
};

// Legacy exports for backward compatibility
export const mathJaxManager = kaTeXManager;
export const useMathJaxInitializer = useKaTeXInitializer;