// V3 enhancement-layer slides (worked example / quiz / mistakes / figure) plus
// the slide type dispatcher and per-slide error boundary.
// Extracted verbatim from StrategiesGuide.jsx (lines 1047-1493) during the
// monolith split.
import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ACCENTS, imgUrl } from '../constants';
import { RichText, Eyebrow } from './primitives';
import { SlideFactBoard, SlideIconGrid } from './blocks';
import {
  SlideHero, SlidePhotoHero, SlideSplitVisual, SlideAnalogy3up,
  SlideBigTypography, SlideTimelineZigzag, SlideNarrative, SlideChecklist,
  SlideStrategySteps, SlideExample, SlideComparison, SlideCallout, SlideQuoteBlock,
} from './slides';

// =============================================================================
// V3 ENHANCEMENT LAYER — student-mode slides
// =============================================================================

function SlideWorkedExample({ slide, accent }) {
  const a = ACCENTS[accent];
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white p-6 md:p-8`}>
      <Eyebrow label={slide.eyebrow || 'WORKED EXAMPLE'} tone="default" accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3"><RichText text={slide.title} /></h2>}
      {slide.intro && <p className="mt-3 text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}

      {slide.stimulus && (
        <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-4">
          {slide.stimulus.label && (
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{slide.stimulus.label}</div>
          )}
          {(slide.stimulus.body || slide.stimulus.text) && (
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              <RichText text={slide.stimulus.body || slide.stimulus.text} />
            </div>
          )}
          {Array.isArray(slide.stimulus.items) && slide.stimulus.items.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-gray-800 leading-relaxed">
              {slide.stimulus.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span><RichText text={typeof it === 'string' ? it : (it.stem || it.text || it.label || '')} /></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {slide.question && (
        <div className={`mt-5 rounded-xl ${a.bg} border ${a.border} p-4`}>
          {slide.question.label && (
            <div className={`text-xs uppercase tracking-wider font-semibold ${a.softText} mb-1`}>{slide.question.label}</div>
          )}
          {slide.question.prompt && (
            <div className={`text-sm font-semibold ${a.softText} mb-1`}>{slide.question.prompt}</div>
          )}
          {slide.question.stem && (
            <div className="text-base text-gray-900 leading-relaxed mt-1"><RichText text={slide.question.stem} /></div>
          )}
          {slide.question.blank_text && (
            <div className="text-base text-gray-900 leading-relaxed">{slide.question.blank_text}</div>
          )}
          {Array.isArray(slide.question.options) && slide.question.options.length > 0 && (
            <ol className="mt-3 space-y-1.5 text-gray-900">
              {slide.question.options.map((o, i) => {
                const letter = String.fromCharCode(65 + i);
                const text = typeof o === 'string' ? o : (o.text || o.label || '');
                return (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="font-semibold text-gray-700">{letter}.</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {Array.isArray(slide.question.items) && slide.question.items.length > 0 && (
            <ol className="mt-3 space-y-1.5 text-gray-900">
              {slide.question.items.map((it, i) => {
                const isStr = typeof it === 'string';
                const num = isStr ? i + 1 : (it.n ?? i + 1);
                const text = isStr ? it : (it.stem || it.text || it.label || '');
                return (
                  <li key={i} className="text-sm leading-relaxed flex gap-2">
                    <span className="font-semibold text-gray-700">{num}.</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {slide.question.table && Array.isArray(slide.question.table.rows) && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm text-left">
                {Array.isArray(slide.question.table.headers) && (
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-gray-500">
                      {slide.question.table.headers.map((h, i) => (
                        <th key={i} className="px-2 py-1 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {slide.question.table.rows.map((row, r) => (
                    <tr key={r} className="border-t border-gray-200">
                      {(Array.isArray(row) ? row : []).map((cell, c) => (
                        <td key={c} className="px-2 py-1 text-gray-800">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {Array.isArray(slide.thinking_steps) && slide.thinking_steps.length > 0 && (
        <ol className="mt-6 space-y-3">
          {slide.thinking_steps.map((s, i) => {
            const isStr = typeof s === 'string';
            const stepNum = isStr ? i + 1 : (s.step ?? i + 1);
            const title = isStr ? null : s.title;
            const body = isStr ? s : s.body;
            return (
              <li key={i} className="flex gap-3">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${a.solidBg} text-white text-sm font-bold flex items-center justify-center`}>
                  {stepNum}
                </div>
                <div className="flex-1">
                  {title && <div className="font-semibold text-gray-900"><RichText text={title} /></div>}
                  {body && <div className="text-sm text-gray-700 leading-relaxed mt-0.5"><RichText text={body} /></div>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {slide.answer && (
        <div className="mt-6">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${a.solid} text-white text-sm font-semibold`}
            >
              Reveal answer
            </button>
          ) : (
            <div className={`rounded-xl border-2 ${a.borderStrong} ${a.bg} p-4`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${a.text}`} />
                <span className={`font-bold ${a.textDeep}`}>Answer: {slide.answer.value}</span>
              </div>
              {(slide.answer.rationale || slide.answer.explanation) && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed"><RichText text={slide.answer.rationale || slide.answer.explanation} /></p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Normalise a quiz item to a single internal shape regardless of which schema
// the content authors used. Supports two flavours:
//   A. choices: [{key,text}], answer_key: "A", accepts: [...]   (legacy)
//   B. options: ["..."],       answer_index: 1,  acceptable_answers/answer  (current)
function normaliseQuizItem(item, idx) {
  const id = item.id || `q${idx}`;
  if (item.kind === 'mcq') {
    if (Array.isArray(item.choices) && item.answer_key) {
      return { ...item, id, choices: item.choices, answer_key: item.answer_key };
    }
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    // options can be ["string", ...] OR [{letter, text}, ...] OR [{key, text}, ...] OR [{label, text}, ...]
    const choices = (item.options || []).map((opt, i) => {
      if (typeof opt === 'string') return { key: letters[i], text: opt };
      const key = opt.letter || opt.key || letters[i];
      const text = opt.text || opt.label || '';
      return { key, text };
    });
    const answerKey = letters[item.answer_index ?? -1] || item.answer_key || '';
    return { ...item, id, choices, answer_key: answerKey };
  }
  // fill_in
  const answerKey = item.answer_key || item.answer || '';
  const accepts = item.accepts || item.acceptable_answers || (answerKey ? [answerKey] : []);
  return { ...item, id, answer_key: answerKey, accepts };
}

function SlideQuiz({ slide, accent }) {
  const a = ACCENTS[accent];
  const [answers, setAnswers] = useState({}); // id → user's choice/text
  const [submitted, setSubmitted] = useState({}); // id → bool

  const items = (slide.items || []).map(normaliseQuizItem);

  const isCorrect = (item) => {
    const given = (answers[item.id] || '').toString().trim().toLowerCase();
    if (item.kind === 'mcq') return given === (item.answer_key || '').toLowerCase();
    const accepts = (item.accepts || []).map((s) => String(s).toLowerCase());
    return accepts.includes(given);
  };

  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white p-6 md:p-8`}>
      <div className="flex items-center gap-2">
        <HelpCircle className={`w-5 h-5 ${a.text}`} />
        <Eyebrow label={slide.eyebrow || 'CHECK YOURSELF'} tone="default" accent={accent} />
      </div>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">{slide.title}</h2>}
      {slide.intro && <p className="mt-3 text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}

      <div className="mt-6 space-y-6">
        {items.map((item, idx) => {
          const wasSubmitted = submitted[item.id];
          const correct = wasSubmitted && isCorrect(item);
          return (
            <div key={item.id} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-500 mb-2">Question {idx + 1}</div>
              <div className="text-gray-900 leading-relaxed font-medium">{item.prompt}</div>

              {item.kind === 'mcq' ? (
                <div className="mt-3 space-y-2">
                  {(item.choices || []).map((c) => {
                    const picked = answers[item.id] === c.key;
                    const showCorrect = wasSubmitted && c.key === item.answer_key;
                    const showWrong = wasSubmitted && picked && c.key !== item.answer_key;
                    return (
                      <label
                        key={c.key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                          ${showCorrect ? 'border-emerald-400 bg-emerald-50' : ''}
                          ${showWrong ? 'border-rose-400 bg-rose-50' : ''}
                          ${!wasSubmitted && picked ? `${a.borderStrong} ${a.bg}` : ''}
                          ${!wasSubmitted && !picked ? 'border-gray-200 hover:bg-gray-100' : ''}
                        `}
                      >
                        <input
                          type="radio"
                          name={item.id}
                          value={c.key}
                          checked={picked}
                          disabled={wasSubmitted}
                          onChange={() => setAnswers((prev) => ({ ...prev, [item.id]: c.key }))}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-gray-800">
                          <span className="font-semibold mr-1">{c.key}.</span>
                          {c.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[item.id] || ''}
                  disabled={wasSubmitted}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Type your answer…"
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 text-sm"
                />
              )}

              {!wasSubmitted ? (
                <button
                  type="button"
                  onClick={() => setSubmitted((p) => ({ ...p, [item.id]: true }))}
                  disabled={answers[item.id] == null || answers[item.id] === ''}
                  className={`mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg ${a.solid} text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Check
                </button>
              ) : (
                <div className={`mt-3 rounded-lg p-3 text-sm flex gap-2
                  ${correct ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'}`}
                >
                  {correct ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold">{correct ? 'Correct.' : `Not quite — answer: ${item.answer_key}`}</div>
                    {item.explanation && <div className="mt-1 leading-relaxed">{item.explanation}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideCommonMistakes({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white p-6 md:p-8`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-rose-500" />
        <Eyebrow label={slide.eyebrow || 'WATCH OUT'} tone="critical" accent={accent} />
      </div>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">{slide.title}</h2>}
      {slide.intro && <p className="mt-3 text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}

      <div className="mt-6 space-y-4">
        {(slide.mistakes || slide.pairs || []).map((m, i) => (
          <div key={i} className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
                <XCircle className="w-4 h-4" />
                What students do wrong
              </div>
              <p className="mt-2 text-sm text-rose-900 leading-relaxed"><RichText text={m.wrong} /></p>
            </div>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                What to do instead
              </div>
              <p className="mt-2 text-sm text-emerald-900 leading-relaxed"><RichText text={m.right} /></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full-bleed PDF-style figure: a single image with stage eyebrow + caption.
// Used for ported visual diagrams (essay-structure pages, etc.) where the diagram
// itself carries the pedagogy and we don't want to redraw it natively.
function SlideFigure({ slide, accent }) {
  const a = ACCENTS[accent];
  const stages = slide.stages || null; // optional ["Blank","Populated","Flowchart","Checklist"]
  const activeIdx = typeof slide.stage_index === 'number' ? slide.stage_index : -1;
  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white overflow-hidden`}>
      {/* Hide chrome when the image already bakes in title + stage pills (e.g., the
          essay-structure diagrams) — avoids duplicate headers above and inside the image. */}
      {!slide.image_has_header && (
        <div className="px-6 md:px-8 pt-6 md:pt-8">
          <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
          {slide.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2"><RichText text={slide.title} /></h2>
          )}
          {stages && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {stages.map((s, i) => (
                <React.Fragment key={i}>
                  <span
                    className={
                      i === activeIdx
                        ? `px-2 py-1 rounded-md ${a.barBg} text-white font-semibold`
                        : 'px-2 py-1 rounded-md bg-gray-100 text-gray-500'
                    }
                  >
                    {s}
                  </span>
                  {i < stages.length - 1 && <span className="text-gray-300">›</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          {slide.intro && (
            <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <RichText text={slide.intro} />
            </p>
          )}
        </div>
      )}
      {slide.image && (
        <div className={`${slide.image_has_header ? '' : 'mt-5 border-t border-gray-100'} bg-gray-50`}>
          <img
            src={imgUrl(slide.image)}
            alt={slide.alt || slide.title || ''}
            className="w-full h-auto object-contain max-h-[1100px] mx-auto"
          />
        </div>
      )}
      {slide.caption && (
        <div className="px-6 md:px-8 py-4 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
          <RichText text={slide.caption} />
        </div>
      )}
    </div>
  );
}

// Per-slide error boundary so a single bad slide doesn't kill the whole chapter view.
class SlideErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[SlideErrorBoundary]', this.props.slideType, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 text-sm text-rose-900">
          <div className="font-bold mb-1">Slide failed to render</div>
          <div className="text-xs mb-2">type: <code>{this.props.slideType}</code></div>
          <pre className="text-xs whitespace-pre-wrap bg-white/60 p-2 rounded border border-rose-200 overflow-auto max-h-40">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function SlideRendererInner({ slide, accent }) {
  switch (slide.type) {
    case 'hero':            return <SlideHero slide={slide} accent={accent} />;
    case 'photo_hero':      return <SlidePhotoHero slide={slide} accent={accent} />;
    case 'split_visual':    return <SlideSplitVisual slide={slide} accent={accent} />;
    case 'analogy_3up':     return <SlideAnalogy3up slide={slide} accent={accent} />;
    case 'big_typography':  return <SlideBigTypography slide={slide} accent={accent} />;
    case 'timeline_zigzag': return <SlideTimelineZigzag slide={slide} accent={accent} />;
    case 'narrative':       return <SlideNarrative slide={slide} accent={accent} />;
    case 'checklist':       return <SlideChecklist slide={slide} accent={accent} />;
    case 'factboard':       return <SlideFactBoard slide={slide} accent={accent} />;
    case 'icon_grid':       return <SlideIconGrid slide={slide} accent={accent} />;
    case 'strategy_steps':  return <SlideStrategySteps slide={slide} accent={accent} />;
    case 'example':         return <SlideExample slide={slide} accent={accent} />;
    case 'comparison':      return <SlideComparison slide={slide} accent={accent} />;
    case 'callout':         return <SlideCallout slide={slide} accent={accent} />;
    case 'quote_block':     return <SlideQuoteBlock slide={slide} accent={accent} />;
    case 'worked_example':  return <SlideWorkedExample slide={slide} accent={accent} />;
    case 'quiz':            return <SlideQuiz slide={slide} accent={accent} />;
    case 'common_mistakes': return <SlideCommonMistakes slide={slide} accent={accent} />;
    case 'figure':          return <SlideFigure slide={slide} accent={accent} />;
    default:
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
          Unknown slide type: <code>{slide.type}</code>
        </div>
      );
  }
}

function SlideRenderer({ slide, accent }) {
  return (
    <SlideErrorBoundary slideType={slide?.type || 'unknown'}>
      <SlideRendererInner slide={slide} accent={accent} />
    </SlideErrorBoundary>
  );
}

export { SlideRenderer };
