// src/utils/getSelectedTextWithMath.ts
export function getSelectedTextWithMath(): string {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return '';

  const range = sel.getRangeAt(0);

  // Find a safe root to walk
  const root: Node = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer
    : (range.commonAncestorContainer.parentNode as Node);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return range.intersectsNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName?.toLowerCase() === 'mjx-container') {
            return range.intersectsNode(el)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          }
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  let out = '';
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      out += (n as Text).nodeValue ?? '';
    } else {
      const el = n as HTMLElement;
      if (el.tagName?.toLowerCase() === 'mjx-container') {
        const tex = el.getAttribute('data-tex') || '';
        if (tex.trim()) out += ` $${tex}$ `;
      }
    }
  }

  // Normalize whitespace
  return out.replace(/\s+\n/g, ' ')
            .replace(/\u00A0/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
}