
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
          // Check if there's any math to process
          const hasRawMath = element.textContent?.includes('\\(') || 
                            element.textContent?.includes('\\[') ||
                            element.textContent?.includes('$');
          
          const existingMjElements = element.querySelectorAll('.MathJax');
          const shouldProcess = hasRawMath || existingMjElements.length === 0;
          
          if (shouldProcess) {
            // Clear existing MathJax elements to prevent duplicates
            existingMjElements.forEach(el => el.remove());
            
            // Process the element
            await window.MathJax.typesetPromise([element]);
            
            // Apply custom styling after rendering
            const newMjElements = element.querySelectorAll('.MathJax');
            newMjElements.forEach(mjEl => {
              const mathElement = mjEl as HTMLElement;
              mathElement.style.transition = 'opacity 0.2s ease-in-out';
              mathElement.style.opacity = '1';
              
              // Ensure proper visibility
              mathElement.style.visibility = 'visible';
              mathElement.style.display = mathElement.classList.contains('MathJax_Display') ? 'block' : 'inline';
            });
          }
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

    // Configure MathJax with correct options
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: {'[+]': ['base', 'ams', 'newcommand']}
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      startup: {
        ready: () => {
          console.log('MathJax is ready');
          window.MathJax.startup.defaultReady();
          setIsMathJaxReady(true);
        }
      },
      loader: {
        load: ['[tex]/base', '[tex]/ams', '[tex]/newcommand']
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
