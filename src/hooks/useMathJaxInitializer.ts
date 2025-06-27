
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    MathJax: any;
  }
}

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
