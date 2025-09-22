// src/utils/getSelectedTextWithMath.ts
export function getSelectedTextWithMath(): string {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return '';

  const range = sel.getRangeAt(0);
  const plain = sel.toString().trim(); // fallback

  const root: Node =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : (range.commonAncestorContainer.parentNode as Node);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node) {
        if (!range.intersectsNode(node)) return NodeFilter.FILTER_SKIP;
        if (node.nodeType === Node.TEXT_NODE) {
          // Skip text nodes that are inside MathJax containers to avoid duplication
          let parent = node.parentNode;
          while (parent) {
            if (parent.nodeType === Node.ELEMENT_NODE) {
              const el = parent as HTMLElement;
              if (el.tagName?.toLowerCase() === 'mjx-container' || 
                  el.tagName?.toLowerCase() === 'math' ||
                  el.classList?.contains('MathJax')) {
                return NodeFilter.FILTER_SKIP;
              }
            }
            parent = parent.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName?.toLowerCase() === 'mjx-container') {
            return NodeFilter.FILTER_ACCEPT;
          }
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  let out = '';
  let n: Node | null;
  const processedMathNodes = new Set<Node>();

  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      const textNode = n as Text;
      const full = textNode.data ?? '';
      const start = textNode === range.startContainer ? range.startOffset : 0;
      const end = textNode === range.endContainer ? range.endOffset : full.length;
      if (end > start) {
        const text = full.slice(start, end);
        // Clean up text by removing MathML artifacts
        const cleanText = text
          .replace(/<math[^>]*>.*?<\/math>/g, '') // Remove MathML tags
          .replace(/xmlns="[^"]*"/g, '') // Remove xmlns attributes
          .replace(/data-mjx-[^=]*="[^"]*"/g, '') // Remove MathJax data attributes
          .replace(/mathvariant="[^"]*"/g, '') // Remove mathvariant attributes
          .replace(/display="[^"]*"/g, '') // Remove display attributes
          .trim();
        
        if (cleanText) out += cleanText;
      }
    } else {
      const el = n as HTMLElement;
      if (el.tagName?.toLowerCase() === 'mjx-container' && !processedMathNodes.has(el)) {
        processedMathNodes.add(el);
        const tex = el.getAttribute('data-tex') || '';
        if (tex.trim()) {
          // Clean the LaTeX to remove any embedded MathML or duplicates
          const cleanTex = tex.replace(/<[^>]*>/g, '').trim();
          out += ` $${cleanTex}$ `;
        }
      }
    }
  }

  const normalized = out
    .replace(/\s+\n/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\$\s*\$\s*\$/g, '') // Remove empty math blocks
    .trim();

  return normalized || plain;
}