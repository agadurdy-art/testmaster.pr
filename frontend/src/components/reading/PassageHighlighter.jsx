import React, { useCallback, useRef, useState, useEffect } from 'react';

/**
 * Reading-passage highlighter — mirrors the IELTS computer-delivered test, where
 * candidates can highlight text in the passage while they work.
 *
 * Usage:
 *   const hl = usePassageHighlighter();
 *   <button onClick={hl.clearAll}>Clear highlights</button>
 *   <div ref={hl.ref} onMouseUp={hl.onMouseUp}> …passage paragraphs… </div>
 *   <HighlightMenu hl={hl} />
 *
 * Select text inside the ref'd container → a small "Highlight" chip appears at
 * the selection → click to wrap it in <mark class="rp-hl">. "Clear highlights"
 * unwraps them. Selections that span multiple paragraphs are handled by wrapping
 * each intersected text node.
 */
export function usePassageHighlighter() {
  const ref = useRef(null);
  const [menu, setMenu] = useState(null); // { x, y } viewport coords, or null

  const onMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setMenu(null); return; }
    const range = sel.getRangeAt(0);
    if (!ref.current || !ref.current.contains(range.commonAncestorContainer)) { setMenu(null); return; }
    const rect = range.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) { setMenu(null); return; }
    setMenu({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const highlight = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!ref.current || !ref.current.contains(range.commonAncestorContainer)) return;
    try { wrapRange(range); } catch (_) { /* best-effort */ }
    try { sel.removeAllRanges(); } catch (_) { /* ignore */ }
    setMenu(null);
  }, []);

  const clearAll = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll('mark.rp-hl').forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
    setMenu(null);
  }, []);

  const dismiss = useCallback(() => setMenu(null), []);

  // Hide the chip when the user clicks elsewhere / scrolls.
  useEffect(() => {
    if (!menu) return undefined;
    const onScroll = () => setMenu(null);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [menu]);

  return { ref, menu, onMouseUp, highlight, clearAll, dismiss };
}

export function HighlightMenu({ hl }) {
  if (!hl.menu) return null;
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); hl.highlight(); }}
      style={{
        position: 'fixed',
        left: hl.menu.x,
        top: hl.menu.y - 46,
        transform: 'translateX(-50%)',
        zIndex: 70,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 999,
        background: '#1e293b',
        color: '#fff',
        fontSize: 13,
        fontWeight: 600,
        border: 0,
        cursor: 'pointer',
        boxShadow: '0 8px 24px -6px rgba(15,23,42,.45)',
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 3, background: '#fde047', display: 'inline-block' }} />
      Highlight
    </button>
  );
}

function wrapRange(range) {
  // Single text-node selection — the common case (within one paragraph).
  if (range.startContainer === range.endContainer && range.startContainer.nodeType === 3) {
    wrapTextPortion(range.startContainer, range.startOffset, range.endOffset);
    return;
  }
  // Multi-node selection — wrap every intersected text node's selected portion.
  const rootEl = range.commonAncestorContainer.nodeType === 3
    ? range.commonAncestorContainer.parentNode
    : range.commonAncestorContainer;
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (range.intersectsNode(n) && n.textContent.trim().length
      ? NodeFilter.FILTER_ACCEPT
      : NodeFilter.FILTER_REJECT),
  });
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  // Wrap back-to-front so earlier offsets stay valid as the DOM changes.
  nodes.reverse().forEach((node) => {
    const start = node === range.startContainer ? range.startOffset : 0;
    const end = node === range.endContainer ? range.endOffset : node.textContent.length;
    if (end > start) wrapTextPortion(node, start, end);
  });
}

function wrapTextPortion(textNode, start, end) {
  // Skip if already inside a highlight.
  if (textNode.parentNode && textNode.parentNode.classList && textNode.parentNode.classList.contains('rp-hl')) return;
  const r = document.createRange();
  r.setStart(textNode, start);
  r.setEnd(textNode, end);
  const mark = document.createElement('mark');
  mark.className = 'rp-hl';
  try { r.surroundContents(mark); } catch (_) { /* boundary issue — skip this node */ }
}
