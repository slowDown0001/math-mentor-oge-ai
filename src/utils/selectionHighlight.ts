// src/utils/selectionHighlight.ts
export type HighlightHandle = { clear: () => void };

export function applyPinkHighlightToCurrentSelection(): HighlightHandle | null {
  const sel = window.getSelection?.();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (range.collapsed) return null;

  const createdWrappers: HTMLElement[] = [];

  // Helper: wrap a subrange of a Text node with a span.hl-selected
  const wrapTextSubrange = (textNode: Text, start: number, end: number) => {
    const r = document.createRange();
    r.setStart(textNode, start);
    r.setEnd(textNode, end);
    const span = document.createElement("span");
    span.className = "hl-selected";
    r.surroundContents(span);
    createdWrappers.push(span);
  };

  // Helper: wrap an element (e.g., mjx-container) with a span.hl-selected
  const wrapElement = (el: Element, block = false) => {
    const span = document.createElement("span");
    span.className = "hl-selected" + (block ? " hl-selected-block" : "");
    el.parentNode?.insertBefore(span, el);
    span.appendChild(el);
    createdWrappers.push(span);
  };

  // Walk nodes intersecting the range
  const root: Node =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer
      : (range.commonAncestorContainer.parentNode as Node);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        if (!range.intersectsNode(node)) return NodeFilter.FILTER_SKIP;

        if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT;

        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName?.toLowerCase() === "mjx-container") {
            return NodeFilter.FILTER_ACCEPT;
          }
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  const touched = new Set<Node>();
  let n: Node | null;

  while ((n = walker.nextNode())) {
    if (touched.has(n)) continue;
    touched.add(n);

    if (n.nodeType === Node.TEXT_NODE) {
      const tn = n as Text;
      const full = tn.data ?? "";

      const start = tn === range.startContainer ? range.startOffset : 0;
      const end = tn === range.endContainer ? range.endOffset : full.length;

      if (end > start) wrapTextSubrange(tn, start, end);
    } else {
      const el = n as HTMLElement;
      if (el.tagName?.toLowerCase() === "mjx-container") {
        const isBlock = el.getAttribute("display") === "true";
        wrapElement(el, !!isBlock);
      }
    }
  }

  // Clear native selection so only our pink highlight is visible
  try {
    sel.removeAllRanges();
  } catch {}

  // Return a handle to remove wrappers later
  const clear = () => {
    for (const span of createdWrappers) {
      // unwrap: replace span with its children
      while (span.firstChild) {
        span.parentNode?.insertBefore(span.firstChild, span);
      }
      span.parentNode?.removeChild(span);
    }
  };

  return { clear };
}