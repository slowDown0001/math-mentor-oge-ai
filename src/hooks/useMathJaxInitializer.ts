import { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Declare renderMathInElement function for auto-render
declare global {
  interface Window {
    katex: any;
  }
}

class KaTeXManager {
  private autoRenderLoaded = false;

  constructor() {
    this.loadAutoRender();
  }

  private loadAutoRender(): void {
    if (this.autoRenderLoaded || window.renderMathInElement) {
      this.autoRenderLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js';
    script.onload = () => {
      this.autoRenderLoaded = true;
      // Ensure global katex is available for auto-render
      if (typeof window !== 'undefined' && !window.katex) {
        (window as any).katex = katex;
      }
    };
    document.head.appendChild(script);
  }

  get isAutoRenderLoaded(): boolean {
    return this.autoRenderLoaded;
  }

  renderMath(element: HTMLElement): void {
    if (!window.renderMathInElement || !this.autoRenderLoaded) {
      // If auto-render not loaded yet, wait and retry
      setTimeout(() => this.renderMath(element), 100);
      return;
    }

    // Safety check: ensure element is still in the DOM
    if (!element.isConnected || !element.parentNode) {
      return;
    }

    // Ensure katex is available globally before rendering
    if (!window.katex) {
      (window as any).katex = katex;
    }

    try {
      // Double-check element is still connected right before rendering
      if (!element.isConnected || !element.parentNode) {
        return;
      }
      
      window.renderMathInElement(element, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
      
      // Final check after rendering completes
      if (!element.isConnected) {
        return;
      }
    } catch (error) {
      // Silently ignore errors if element was removed during rendering
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return;
      }
      console.error('KaTeX auto-render error:', error);
      // Fallback: try manual rendering for simple cases
      if (element.isConnected && element.parentNode) {
        this.fallbackManualRender(element);
      }
    }
  }

  private fallbackManualRender(element: HTMLElement): void {
    // Check if element is still safe to manipulate
    if (!element.isConnected || !element.parentNode) {
      return;
    }
    
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

    if (hasMatches && element.isConnected && element.parentNode) {
      try {
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
        
        // Final check before modifying DOM
        if (element.isConnected && element.parentNode) {
          element.innerHTML = html;
        }
      } catch (error) {
        // Silently ignore DOM manipulation errors
        if (error instanceof DOMException && error.name === 'NotFoundError') {
          return;
        }
        console.error('Fallback render error:', error);
      }
    }
  }

  renderAll(): void {
    // Use requestAnimationFrame to defer rendering until after React's DOM updates
    requestAnimationFrame(() => {
      const messageElements = document.querySelectorAll('[data-message]');
      messageElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (htmlElement.isConnected && htmlElement.parentNode) {
          this.renderMath(htmlElement);
        }
      });
    });
  }

  processVisibleMessages(): void {
    requestAnimationFrame(() => {
      const messageElements = document.querySelectorAll('[data-message]');
      messageElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        if (!htmlElement.isConnected || !htmlElement.parentNode) return;
        
        const rect = htmlElement.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible && htmlElement.isConnected && htmlElement.parentNode) {
          this.renderMath(htmlElement);
        }
      });
    });
  }

  initializeChatWindow(): void {
    // Wait for auto-render to load, then initialize the chat window
    const initializeWhenReady = () => {
      if (!window.renderMathInElement || !this.autoRenderLoaded) {
        setTimeout(initializeWhenReady, 100);
        return;
      }

      // Ensure katex is available globally
      if (!window.katex) {
        (window as any).katex = katex;
      }

      // Find chat container and initialize auto-render
      const chatContainer = document.querySelector('[data-radix-scroll-area-viewport]');
      if (chatContainer) {
        try {
          window.renderMathInElement(chatContainer as HTMLElement, {
            delimiters: [
              { left: "$$", right: "$$", display: true },    // block
              { left: "$", right: "$", display: false },     // inline
              { left: "\\(", right: "\\)", display: false }, // inline
              { left: "\\[", right: "\\]", display: true }   // block
            ],
            throwOnError: false
          });
        } catch (error) {
          console.error('KaTeX chat window initialization error:', error);
        }
      }
    };

    initializeWhenReady();
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
    // Wait for auto-render to load
    const checkReady = () => {
      if (window.renderMathInElement || kaTeXManager.isAutoRenderLoaded) {
        setIsReady(true);
        kaTeXManager.setupScrollObserver();
        kaTeXManager.initializeChatWindow();
        
        // Initialize auto-render on chat containers for exam pages
        const initializeChatContainers = () => {
          const chatWindow = document.getElementById("chat-window");
          if (chatWindow && window.renderMathInElement) {
            try {
              window.renderMathInElement(chatWindow, {
                delimiters: [
                  { left: "$$", right: "$$", display: true },    // block
                  { left: "$", right: "$", display: false },     // inline
                  { left: "\\(", right: "\\)", display: false }, // inline
                  { left: "\\[", right: "\\]", display: true }   // block
                ],
                throwOnError: false
              });
            } catch (error) {
              console.error('KaTeX auto-render initialization error:', error);
            }
          }
        };
        
        // Initialize immediately
        initializeChatContainers();
        
      } else {
        setTimeout(checkReady, 100);
      }
    };
    
    checkReady();
  }, []);

  return isReady;
};

// Legacy exports for backward compatibility
export const mathJaxManager = kaTeXManager;
export const useMathJaxInitializer = useKaTeXInitializer;