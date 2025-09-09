import { useEffect, useState } from 'react';

// MathJax types
declare global {
  interface Window {
    MathJax?: any;
  }
}

class MathJaxManager {
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private callbacks: Array<() => void> = [];

  async loadMathJax(): Promise<void> {
    if (this.isLoaded) return;
    if (this.isLoading) {
      return new Promise(resolve => {
        this.callbacks.push(resolve);
      });
    }

    this.isLoading = true;

    try {
      // Check if MathJax script is already loaded to avoid double loading
      if (document.querySelector('script[src*="mathjax"]')) {
        this.isLoaded = true;
        this.isLoading = false;
        this.callbacks.forEach(callback => callback());
        this.callbacks = [];
        return;
      }

      // Configure MathJax before loading the script
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
          packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process'
        },
        startup: {
          ready: () => {
            console.log('MathJax is loaded and ready');
            this.isLoaded = true;
            this.isLoading = false;
            this.callbacks.forEach(callback => callback());
            this.callbacks = [];
            window.MathJax.startup.defaultReady();
          }
        }
      };

      // Load MathJax script directly (no need for polyfill in modern browsers)
      const mathJaxScript = document.createElement('script');
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      mathJaxScript.async = true;
      mathJaxScript.onerror = () => {
        console.error('Failed to load MathJax script');
        this.isLoading = false;
      };
      document.head.appendChild(mathJaxScript);

    } catch (error) {
      console.error('Failed to load MathJax:', error);
      this.isLoading = false;
    }
  }

  async renderMath(element: HTMLElement): Promise<void> {
    if (!this.isLoaded) {
      await this.loadMathJax();
      // Wait a bit more for MathJax to be fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
      try {
        // Clear any existing MathJax processing first
        if (window.MathJax.startup && window.MathJax.startup.document) {
          window.MathJax.startup.document.clear();
          window.MathJax.startup.document.updateDocument();
        }
        await window.MathJax.typesetPromise([element]);
      } catch (error) {
        console.error('MathJax render error:', error);
        // Fallback: try simple typeset
        try {
          window.MathJax.typeset([element]);
        } catch (fallbackError) {
          console.error('MathJax fallback render error:', fallbackError);
        }
      }
    } else {
      console.warn('MathJax not ready for rendering');
    }
  }

  isReady(): boolean {
    return this.isLoaded;
  }
}

// Export singleton instance
export const mathJaxManager = new MathJaxManager();

export const useMathJaxInitializer = (): boolean => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeMathJax = async () => {
      await mathJaxManager.loadMathJax();
      setIsReady(mathJaxManager.isReady());
    };

    initializeMathJax();
  }, []);

  return isReady;
};