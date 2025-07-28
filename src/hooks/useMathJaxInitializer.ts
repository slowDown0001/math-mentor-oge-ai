
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MathJax: any;
    mathJaxQueue: Promise<any>;
  }
}

// Global MathJax manager to prevent conflicts
class MathJaxManager {
  private static instance: MathJaxManager;
  private queue: Promise<any> = Promise.resolve();

  static getInstance(): MathJaxManager {
    if (!MathJaxManager.instance) {
      MathJaxManager.instance = new MathJaxManager();
    }
    return MathJaxManager.instance;
  }

  async renderMath(element: HTMLElement): Promise<void> {
    this.queue = this.queue.then(async () => {
      try {
        if (
          typeof window.MathJax !== 'undefined' &&
          typeof window.MathJax.typesetPromise === 'function'
        ) {
          await window.MathJax.typesetPromise([element]);
        }
      } catch (error) {
        console.error('MathJax rendering error:', error);
      }
    });
    return this.queue;
  }

  async renderAll(): Promise<void> {
    this.queue = this.queue.then(async () => {
      try {
        if (
          typeof window.MathJax !== 'undefined' &&
          typeof window.MathJax.typesetPromise === 'function'
        ) {
          await window.MathJax.typesetPromise();
        }
      } catch (error) {
        console.error('MathJax rendering error:', error);
      }
    });
    return this.queue;
  }
}

export const mathJaxManager = MathJaxManager.getInstance();

export const useMathJaxInitializer = () => {
  const [isMathJaxReady, setIsMathJaxReady] = useState(false);

  useEffect(() => {
    if (window.MathJax) {
      setIsMathJaxReady(true);
      return;
    }

    // Configure MathJax
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      },
      startup: {
        ready: () => {
          window.MathJax.startup.defaultReady();
          setIsMathJaxReady(true);
        }
      }
    };

    // Load MathJax script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector('script[src*="mathjax"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return isMathJaxReady;
};
