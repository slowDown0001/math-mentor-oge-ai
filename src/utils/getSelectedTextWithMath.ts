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
        if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;
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

  while ((n = walker.nextNode())) {
    if (n.nodeType === Node.TEXT_NODE) {
      const textNode = n as Text;
      const full = textNode.data ?? '';
      const start = textNode === range.startContainer ? range.startOffset : 0;
      const end = textNode === range.endContainer ? range.endOffset : full.length;
      if (end > start) out += full.slice(start, end);
    } else {
      const el = n as HTMLElement;
      if (el.tagName?.toLowerCase() === 'mjx-container') {
        const tex = el.getAttribute('data-tex') || '';
        if (tex.trim()) out += ` $${tex}$ `;
      }
    }
  }

  const normalized = out
    .replace(/\s+\n/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return normalized || plain;
}