import React, { useState } from 'react';
import { useI18n } from '../../../lib/i18n';

// Cell helpers for compact row authoring
const N = (text, dim) => ({ type: 'num', text, dim });
const C = (gold) => ({ type: 'check', gold });
const X = () => ({ type: 'x' });

function renderCell(c) {
  if (c.type === 'num') {
    return <span className={`cmp-num${c.dim ? ' cmp-num-dim' : ''}`}>{c.text}</span>;
  }
  if (c.type === 'check') {
    return <span className={`cmp-check${c.gold ? ' gold' : ''}`}>✓</span>;
  }
  return <span className="cmp-x">—</span>;
}

/**
 * Order: [Free, Weekly, Monthly (pop), Exam Pack]
 * Labels are resolved at render time so i18n can swap them.
 */
export default function CompareTable() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const GROUPS = [
    {
      name: t('pricingV2CompareGroupEvaluation'),
      rows: [
        { label: t('pricingV2CompareRowWritingEvals'), cells: [N('1', true), N('∞'), N('∞'), N('∞')] },
        { label: t('pricingV2CompareRowSpeakingEvals'), cells: [N('1', true), N('∞'), N('∞'), N('∞')] },
        { label: t('pricingV2CompareRowTask12'), cells: [C(), C(), C(), C()] },
        { label: t('pricingV2CompareRowGT'), cells: [X(), C(), C(), C()] },
        { label: t('pricingV2CompareRowInlineCorrect'), cells: [X(), C(), C(), C()] },
        {
          label: (
            <>
              {t('pricingV2CompareRowTranslations')}{' '}
              <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>
                · {t('pricingV2CompareRowTranslationsNote')}
              </span>
            </>
          ),
          cells: [C(), C(), C(), C()],
        },
      ],
    },
    {
      name: t('pricingV2CompareGroupMocks'),
      rows: [
        { label: t('pricingV2CompareRowFullMocks'), cells: [X(), N(t('pricingV2CompareCellWritingOnly'), true), N(t('pricingV2CompareCellAll4')), N(t('pricingV2CompareCellAll4'))] },
        { label: t('pricingV2CompareRowTimed'), cells: [X(), C(), C(), C(true)] },
        { label: t('pricingV2CompareRowPastPapers'), cells: [X(), N(t('pricingV2CompareCellLimited'), true), C(), C()] },
      ],
    },
    {
      name: t('pricingV2CompareGroupSpeaking'),
      rows: [
        { label: t('pricingV2CompareRowAISpeaking'), cells: [X(), C(), C(), C()] },
        { label: t('pricingV2CompareRowExaminerFollowup'), cells: [X(), X(), C(), C()] },
      ],
    },
    {
      name: t('pricingV2CompareGroupLiz'),
      rows: [
        { label: t('pricingV2CompareRowAITutor'), cells: [X(), X(), C(), C()] },
        { label: t('pricingV2CompareRowWeeklyFocus'), cells: [X(), X(), C(), C()] },
        { label: t('pricingV2CompareRowRewrites'), cells: [X(), N(t('pricingV2CompareCell5Month'), true), N(t('pricingV2CompareCellUnlimited')), N(t('pricingV2CompareCellUnlimited'))] },
        { label: t('pricingV2CompareRowCharts'), cells: [X(), C(), C(), C()] },
      ],
    },
    {
      name: t('pricingV2CompareGroupSupport'),
      rows: [
        { label: t('pricingV2CompareRowEmailSupport'), cells: [C(), C(), C(), C()] },
        { label: t('pricingV2CompareRowPriority'), cells: [X(), X(), C(), C()] },
        { label: t('pricingV2CompareRowPdfReport'), cells: [X(), X(), C(), C()] },
      ],
    },
  ];

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
              {t('pricingV2CompareToggle')}
              <span className="tag">
                {t('pricingV2CompareRowsTag', { groups: GROUPS.length, rows: totalRows })}
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
                  <th>{t('pricingV2CompareColFree')}</th>
                  <th>{t('pricingV2CompareColWeekly')}</th>
                  <th className="pop">{t('pricingV2CompareColMonthly')}</th>
                  <th>{t('pricingV2CompareColExam')}</th>
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
