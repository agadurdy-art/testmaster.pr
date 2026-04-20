import React, { useState } from 'react';

// Cell helpers for compact row authoring
const chk = (gold) => (gold ? 'chk-gold' : 'chk');
const N = (text, dim) => ({ type: 'num', text, dim });
const C = (gold) => ({ type: 'check', gold });
const X = () => ({ type: 'x' });

/**
 * Order: [Free, Weekly, Monthly (pop), Exam Pack]
 */
const GROUPS = [
  {
    name: 'Evaluation',
    rows: [
      { label: 'Writing evaluations / day', cells: [N('1', true), N('∞'), N('∞'), N('∞')] },
      { label: 'Speaking evaluations / day', cells: [N('1', true), N('∞'), N('∞'), N('∞')] },
      { label: 'Task 1 & Task 2 (Academic)', cells: [C(), C(), C(), C()] },
      { label: 'General Training writing', cells: [X(), C(), C(), C()] },
      { label: 'Inline corrections & band-level rewrite', cells: [X(), C(), C(), C()] },
      {
        label: (
          <>
            Translations{' '}
            <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>
              · VI, TR, ZH, +8
            </span>
          </>
        ),
        cells: [C(), C(), C(), C()],
      },
    ],
  },
  {
    name: 'Mock tests',
    rows: [
      { label: 'Full mock tests', cells: [X(), N('Writing only', true), N('All 4 sections'), N('All 4 sections')] },
      { label: 'Timed exam conditions', cells: [X(), C(), C(), C(true)] },
      { label: 'Past-paper library', cells: [X(), N('Limited', true), C(), C()] },
    ],
  },
  {
    name: 'Speaking',
    rows: [
      { label: 'AI speaking practice', cells: [X(), C(), C(), C()] },
      { label: 'Examiner-style follow-up questions', cells: [X(), X(), C(), C()] },
    ],
  },
  {
    name: 'Liz coaching',
    rows: [
      { label: 'AI Tutor (Liz) unlimited', cells: [X(), X(), C(), C()] },
      { label: 'Weekly focus plan', cells: [X(), X(), C(), C()] },
      { label: 'Rewrites on demand', cells: [X(), N('5 / month', true), N('Unlimited'), N('Unlimited')] },
      { label: 'Progress charts & history', cells: [X(), C(), C(), C()] },
    ],
  },
  {
    name: 'Support',
    rows: [
      { label: 'Email support', cells: [C(), C(), C(), C()] },
      { label: 'Priority AI queue', cells: [X(), X(), C(), C()] },
      { label: 'PDF progress report (share with a teacher)', cells: [X(), X(), C(), C()] },
    ],
  },
];

function renderCell(c) {
  if (c.type === 'num') {
    return <span className={`cmp-num${c.dim ? ' cmp-num-dim' : ''}`}>{c.text}</span>;
  }
  if (c.type === 'check') {
    return <span className={`cmp-check${c.gold ? ' gold' : ''}`}>✓</span>;
  }
  return <span className="cmp-x">—</span>;
}

export default function CompareTable() {
  const [open, setOpen] = useState(false);

  const totalRows = GROUPS.reduce((sum, g) => sum + g.rows.length, 0);

  return (
    <section style={{ paddingTop: 16 }}>
      <div className="container">
        <div className={`compare-wrap${open ? ' open' : ''}`}>
          <button
            type="button"
            className="compare-toggle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="lbl">
              Compare every feature
              <span className="tag">
                {GROUPS.length} groups · {totalRows} rows
              </span>
            </span>
            <svg
              className="chev"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="compare-body">
            <table className="cmp">
              <thead>
                <tr>
                  <th></th>
                  <th>Free</th>
                  <th>Weekly</th>
                  <th className="pop">Monthly</th>
                  <th>Exam Pack</th>
                </tr>
              </thead>
              <tbody>
                {GROUPS.map((g) => (
                  <React.Fragment key={g.name}>
                    <tr className="group-head">
                      <td colSpan={5}>{g.name}</td>
                    </tr>
                    {g.rows.map((row, idx) => (
                      <tr key={`${g.name}-${idx}`}>
                        <td>{row.label}</td>
                        <td>{renderCell(row.cells[0])}</td>
                        <td>{renderCell(row.cells[1])}</td>
                        <td className="pop">{renderCell(row.cells[2])}</td>
                        <td>{renderCell(row.cells[3])}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
