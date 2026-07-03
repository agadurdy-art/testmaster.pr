// Markdown/text rendering helpers for the Liz D8 tutor UI.
// Extracted verbatim from LizD8.jsx (lines 37-182) during the monolith split.
import React from 'react';
import { LIZ_AVATAR_URL } from '../../../../lib/brand';

function LizAvatarImg({ size = 'cover', alt = 'Liz' }) {
  // Renders as <img> filling the parent .liz-avatar / .mini-avatar / .voice-orb
  // — relies on CSS rules in liz.css that pin width/height/border-radius.
  return <img src={LIZ_AVATAR_URL} alt={alt} className="liz-avatar-img" loading="lazy" draggable={false} />;
}

function formatRelativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

/**
 * Tiny markdown renderer for Liz chat output.
 * Handles: paragraphs, **bold**, *italic*, `code`, ATX headings,
 * lists, `---` HR, `> blockquote`, and **Word:** callouts.
 */
function inlineMd(text) {
  let s = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // [label](url) — internal /paths or http(s) only, escape quotes
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    if (!/^(\/[^\s]*|https?:\/\/[^\s]+)$/.test(url)) return `${label}`;
    const safeUrl = url.replace(/"/g, '&quot;');
    return `<a href="${safeUrl}" class="md-link">${label}</a>`;
  });
  return s;
}

const CALLOUT_KINDS = {
  tip: 'tip',
  why: 'why',
  difficulty: 'difficulty',
  note: 'note',
  example: 'example',
  important: 'important',
  warning: 'important',
  remember: 'note',
  hint: 'tip',
};

function detectCallout(rawPara) {
  const m = rawPara.match(/^\*\*([A-Za-z]+):\*\*\s*([\s\S]*)$/);
  if (!m) return null;
  const key = m[1].toLowerCase();
  const variant = CALLOUT_KINDS[key];
  if (!variant) return null;
  return { variant, label: m[1], body: m[2] };
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  const lines = String(text).split('\n');
  const blocks = [];
  let para = [];
  let list = null;
  let quote = null;
  const flushPara = () => {
    if (!para.length) return;
    const joined = para.join(' ');
    const cal = detectCallout(joined);
    if (cal) {
      blocks.push({ kind: 'callout', variant: cal.variant, label: cal.label, html: inlineMd(cal.body) });
    } else {
      blocks.push({ kind: 'p', html: inlineMd(joined) });
    }
    para = [];
  };
  const flushList = () => {
    if (list) { blocks.push({ kind: list.type, items: list.items.map(inlineMd) }); list = null; }
  };
  const flushQuote = () => {
    if (quote && quote.length) { blocks.push({ kind: 'quote', html: inlineMd(quote.join(' ')) }); quote = null; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); flushQuote(); continue; }
    if (/^---+$/.test(line)) { flushPara(); flushList(); flushQuote(); blocks.push({ kind: 'hr' }); continue; }
    const bq = line.match(/^>\s?(.*)$/);
    if (bq) { flushPara(); flushList(); if (!quote) quote = []; quote.push(bq[1]); continue; }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) { flushPara(); flushList(); flushQuote(); blocks.push({ kind: 'h', level: h[1].length, html: inlineMd(h[2]) }); continue; }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) { flushPara(); flushQuote(); if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; } list.items.push(ul[1]); continue; }
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) { flushPara(); flushQuote(); if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; } list.items.push(ol[1]); continue; }
    flushList(); flushQuote();
    para.push(line);
  }
  flushPara(); flushList(); flushQuote();
  return (
    <div className="md-block">
      {blocks.map((b, i) => {
        if (b.kind === 'p')  return <p key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        if (b.kind === 'hr') return <hr key={i} />;
        if (b.kind === 'h')  {
          const Tag = `h${Math.min(4, b.level + 2)}`;
          return <Tag key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        }
        if (b.kind === 'ul') return <ul key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}</ul>;
        if (b.kind === 'ol') return <ol key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}</ol>;
        if (b.kind === 'quote') return <blockquote key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        if (b.kind === 'callout') {
          return (
            <div key={i} className={`callout callout-${b.variant}`} data-variant={b.variant}>
              <span className="callout-label">{b.label}</span>
              <span className="callout-body" dangerouslySetInnerHTML={{ __html: b.html }} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function PronWordsLine({ words }) {
  if (!Array.isArray(words) || !words.length) return null;
  return (
    <p className="turn-pron">
      {words.map((w, i) => {
        const cls = w.score == null
          ? ''
          : w.score < 70 ? 'pron pron-bad'
          : w.score < 85 ? 'pron pron-ok'
          : 'pron pron-good';
        return (
          <React.Fragment key={i}>
            <span className={cls} title={w.tip || (w.score != null ? `Score ${w.score}/100` : '')}>{w.word}</span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </p>
  );
}

export {
  LizAvatarImg, formatRelativeTime, inlineMd, CALLOUT_KINDS, detectCallout,
  MarkdownBlock, PronWordsLine,
};
