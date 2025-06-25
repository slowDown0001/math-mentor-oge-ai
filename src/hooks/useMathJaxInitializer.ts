
import { useEffect } from 'react';

export const useMathJaxInitializer = () => {
  useEffect(() => {
    if (window.MathJax) {
      return;
    }

    // Initialize MathJax if not already loaded
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']],
        displayMath: [['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      },
      options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process'
      },
      startup: {
        typeset: false
      }
    };

    // Load MathJax script if not already present
    if (!document.querySelector('script[src*="mathjax"]')) {
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.async = true;
      document.head.appendChild(script);

      const mathJaxScript = document.createElement('script');
      mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      mathJaxScript.async = true;
      document.head.appendChild(mathJaxScript);
    }
  }, []);
};
