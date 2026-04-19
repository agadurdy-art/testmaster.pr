// Parse Liz's [NAVIGATE: /route | Label] directives out of her text.
//
// Backend prompt teaches Liz to emit these instead of "click the menu". We
// turn them into actual clickable buttons so users don't have to hunt through
// the app. Format:
//
//   Hop over to [NAVIGATE: /speaking-practice | Speaking practice] when ready.
//
// → split into: text → "Hop over to ", nav → {path: "/speaking-practice",
//   label: "Speaking practice"}, text → " when ready."

const NAV_RE = /\[NAVIGATE:\s*([^|\]]+?)\s*\|\s*([^\]]+?)\]/g;

export function parseLizSegments(text) {
  if (!text || typeof text !== 'string') return [{ type: 'text', value: text || '' }];
  const out = [];
  let lastIndex = 0;
  let m;
  // Reset regex state (global flag carries state between calls).
  NAV_RE.lastIndex = 0;
  while ((m = NAV_RE.exec(text)) !== null) {
    if (m.index > lastIndex) {
      out.push({ type: 'text', value: text.slice(lastIndex, m.index) });
    }
    const path = (m[1] || '').trim();
    const label = (m[2] || '').trim();
    if (path.startsWith('/') && label) {
      out.push({ type: 'nav', path, label });
    } else {
      // Malformed directive — surface the raw text so it's visible + fixable.
      out.push({ type: 'text', value: m[0] });
    }
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) {
    out.push({ type: 'text', value: text.slice(lastIndex) });
  }
  if (out.length === 0) out.push({ type: 'text', value: text });
  return out;
}
