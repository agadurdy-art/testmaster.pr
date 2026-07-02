import React from 'react';

const PART_LABEL = { '1': 'Part 1', '2': 'Part 2', '3': 'Part 3' };

function buildContextLine(data, fluency) {
  const part = data?.part ? PART_LABEL[String(data.part)] || `Part ${data.part}` : null;
  const cardId = data?.question_id || data?.card_id;
  const head = [part, cardId ? null : data?.cue_card_prompt].filter(Boolean).join(' · ');
  const tail = [fluency.duration, fluency.words ? `${fluency.words} words` : null]
    .filter(Boolean)
    .join(' · ');
  return { head: head || (cardId ? part : 'Speaking attempt'), cardId, tail };
}

/* Meta strip: "Scored" badge + attempt context on the left, View in
   Progress / Share actions on the right. */
export default function MetaStrip({ data, fluency, scores }) {
  const SCORES = scores;
  const meta = buildContextLine(data, fluency);
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: 13 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 9999,
            background: 'var(--sp-primary-50)',
            color: 'var(--sp-primary-700)',
            fontWeight: 500,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Scored
        </span>
        <span style={{ color: 'var(--sp-muted-fg)' }}>
          {meta.head}
          {meta.cardId && (
            <>
              {' · '}
              <span className="sp-font-mono">{meta.cardId}</span>
            </>
          )}
        </span>
        {meta.tail && (
          <>
            <span style={{ color: 'var(--sp-muted-fg)' }}>·</span>
            <span style={{ color: 'var(--sp-muted-fg)' }}>{meta.tail}</span>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          className="sp-btn-secondary"
          style={{ height: 36, fontSize: 13 }}
          title="Your attempts are saved automatically — view your speaking history in Progress"
          onClick={() => { window.location.href = '/progress'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          View in Progress
        </button>
        <button
          type="button"
          className="sp-btn-secondary"
          style={{ height: 36, fontSize: 13 }}
          onClick={(e) => {
            const s = `My IELTS Speaking ${(data?.part || '').replace('part', 'Part ')} result on testmaster.pro — Band ${SCORES?.overall ?? '-'} (Fluency ${SCORES?.fc ?? '-'}, Lexical ${SCORES?.lr ?? '-'}, Grammar ${SCORES?.gra ?? '-'}, Pronunciation ${SCORES?.pr ?? '-'}).`;
            const btn = e.currentTarget;
            const restore = btn.lastChild?.textContent;
            try {
              navigator.clipboard?.writeText(s);
              if (btn.lastChild) {
                btn.lastChild.textContent = ' Copied!';
                setTimeout(() => { if (btn.lastChild) btn.lastChild.textContent = restore; }, 1500);
              }
            } catch (_e) { /* clipboard unavailable */ }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 6l-4-4-4 4M12 2v14M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
          </svg>
          Share
        </button>
      </div>
    </div>
  );
}
