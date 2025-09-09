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
      // Configure MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
          packages: {'[+]': ['ams', 'newcommand', 'configmacros']}
        },
        options: {
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

      // Load MathJax script
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        const mathJaxScript = document.createElement('script');
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        mathJaxScript.async = true;
        document.head.appendChild(mathJaxScript);
      };

    } catch (error) {
      console.error('Failed to load MathJax:', error);
      this.isLoading = false;
    }
  }

  async renderMath(element: HTMLElement): Promise<void> {
    if (!this.isLoaded) {
      await this.loadMathJax();
    }

    if (window.MathJax && window.MathJax.typesetPromise) {
      try {
        await window.MathJax.typesetPromise([element]);
      } catch (error) {
        console.error('MathJax render error:', error);
      }
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