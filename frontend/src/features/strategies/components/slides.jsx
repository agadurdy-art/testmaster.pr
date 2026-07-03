// Core slide renderers for the Strategies Guide feature.
// Extracted verbatim from StrategiesGuide.jsx (lines 365-648 and 805-1045)
// during the monolith split.
import React from 'react';
import {
  BookOpen, Check, X as XIcon, Lightbulb, Target, BarChart,
  ListChecks, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { ACCENTS, ICONS, imgUrl } from '../constants';
import { RichText, Eyebrow, AccentBar, CalloutBox } from './primitives';
import { Block } from './blocks';

// =============================================================================
// SLIDE RENDERERS
// =============================================================================

function SlideHero({ slide, accent }) {
  const a = ACCENTS[accent];
  const layout = slide.image_layout || (slide.images || slide.image ? 'split_left' : 'none');
  const imgs = slide.images || (slide.image ? [slide.image] : []);

  if (layout === 'stacked' && imgs.length > 0) {
    return (
      <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white grid md:grid-cols-2`}>
        <div className="grid grid-rows-2 gap-1 bg-gray-100">
          {imgs.slice(0, 2).map((src, i) => (
            <img key={i} src={imgUrl(src)} alt="" className="w-full h-full object-cover aspect-[3/2]" />
          ))}
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-3">{slide.title}</h1>
          {slide.subtitle && <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed"><RichText text={slide.subtitle} /></p>}
        </div>
      </div>
    );
  }

  // fullbleed_top / split_left / split_right / none
  if (layout === 'fullbleed_top' && imgs[0]) {
    return (
      <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white`}>
        <img src={imgUrl(imgs[0])} alt="" className="w-full h-56 md:h-72 object-cover" />
        <div className="p-8 md:p-12">
          <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mt-3">{slide.title}</h1>
          {slide.subtitle && <p className="mt-4 text-lg text-gray-600"><RichText text={slide.subtitle} /></p>}
        </div>
      </div>
    );
  }

  // text-only fallback
  return (
    <div className={`rounded-3xl ${a.bg} border-2 ${a.border} p-12 md:p-16 text-center`}>
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mt-4">{slide.title}</h1>
      {slide.subtitle && <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"><RichText text={slide.subtitle} /></p>}
    </div>
  );
}

function SlidePhotoHero({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white`}>
      {slide.image ? (
        <img src={imgUrl(slide.image)} alt="" className="w-full h-48 md:h-64 object-cover" />
      ) : (
        <div className={`w-full h-2 ${a.barBg}`} />
      )}
      <div className="p-6 md:p-10 space-y-5">
        <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
        {slide.intro && (
          <AccentBar accent={accent}>
            <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>
          </AccentBar>
        )}
        {(slide.body || []).map((b, i) => <Block key={i} block={b} accent={accent} />)}
        {slide.footer && (
          <p className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100"><RichText text={slide.footer} /></p>
        )}
      </div>
    </div>
  );
}

function SlideSplitVisual({ slide, accent }) {
  const a = ACCENTS[accent];
  const imageRight = slide.image_position === 'right';
  const imgEl = slide.image && (
    <div className="md:w-2/5 lg:w-[42%] flex-shrink-0">
      <img src={imgUrl(slide.image)} alt="" className="w-full h-64 md:h-full object-cover md:min-h-[480px]" />
    </div>
  );
  const contentEl = (
    <div className="flex-1 p-6 md:p-10 space-y-4">
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{slide.title}</h2>}
      {slide.subtitle && <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.subtitle} /></p>}
      {(slide.blocks || []).map((b, i) => <Block key={i} block={b} accent={accent} />)}
    </div>
  );
  return (
    <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white flex flex-col md:flex-row`}>
      {imageRight ? (<>{contentEl}{imgEl}</>) : (<>{imgEl}{contentEl}</>)}
    </div>
  );
}

function SlideAnalogy3up({ slide, accent }) {
  const a = ACCENTS[accent];
  // CSS-based decorative circle when no image — gradient + initial letter
  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-indigo-500',
    'from-rose-400 to-orange-500',
    'from-violet-400 to-fuchsia-500',
    'from-amber-400 to-yellow-500',
  ];
  return (
    <div className={`rounded-3xl border-2 ${a.border} bg-white p-6 md:p-10`}>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{slide.title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {(slide.items || []).map((it, i) => (
          <div key={i} className="text-center">
            {it.image ? (
              <div className={`w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-4 ${a.border} mb-4`}>
                <img src={imgUrl(it.image)} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center mb-4 shadow-lg`}>
                <span className="text-5xl md:text-6xl font-bold text-white drop-shadow-sm">
                  {(it.title || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-lg font-semibold text-gray-900"><RichText text={it.title} /></div>
            {it.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed"><RichText text={it.body} /></div>}
          </div>
        ))}
      </div>
      {slide.footer && (
        <AccentBar accent={accent}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line"><RichText text={slide.footer} /></p>
        </AccentBar>
      )}
    </div>
  );
}

function SlideBigTypography({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className="rounded-3xl bg-white border-2 border-gray-100 p-8 md:p-14">
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      <h2 className="mt-6 text-4xl md:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight">
        {slide.title}
      </h2>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {(slide.items || []).map((it, i) => (
          <div key={i} className={`pt-3 border-t-2 ${a.borderStrong}`}>
            <div className="text-sm font-mono text-gray-500 mb-2">{it.number}</div>
            <div className="text-lg md:text-xl font-semibold text-gray-900 leading-snug"><RichText text={it.title} /></div>
            {it.body && <div className="text-sm text-gray-600 mt-2 leading-relaxed"><RichText text={it.body} /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideTimelineZigzag({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-3xl border-2 ${a.border} bg-white p-6 md:p-10`}>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{slide.title}</h2>}
      {slide.intro && (
        <AccentBar accent={accent} className="mb-8">
          <p className="text-base text-gray-700"><RichText text={slide.intro} /></p>
        </AccentBar>
      )}
      <div className="relative max-w-3xl mx-auto py-4">
        <div className={`absolute left-1/2 top-0 bottom-0 w-px ${a.borderStrong} border-l-2 -translate-x-1/2`} />
        <ol className="space-y-8">
          {(slide.nodes || []).map((n, i) => {
            const left = n.side === 'left';
            return (
              <li key={i} className="relative grid grid-cols-2 gap-8 items-center">
                <div className={`${left ? 'text-right' : 'invisible'}`}>
                  {left && (
                    <>
                      <div className="text-base font-semibold text-gray-900">{n.title}</div>
                      {n.body && <div className="text-sm text-gray-600 mt-0.5">{n.body}</div>}
                    </>
                  )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-10 h-10 rounded-md bg-white border-2 ${a.borderStrong} flex items-center justify-center font-bold ${a.text}`}>
                    {n.number}
                  </div>
                </div>
                <div className={`${left ? 'invisible' : ''}`}>
                  {!left && (
                    <>
                      <div className="text-base font-semibold text-gray-900">{n.title}</div>
                      {n.body && <div className="text-sm text-gray-600 mt-0.5">{n.body}</div>}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      {slide.footer && (
        <p className="text-sm text-gray-600 leading-relaxed mt-6 pt-6 border-t border-gray-100"><RichText text={slide.footer} /></p>
      )}
    </div>
  );
}

function SlideNarrative({ slide, accent }) {
  const a = ACCENTS[accent] || ACCENTS.sky;
  return (
    <div className={`relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden`}>
      {/* subtle accent glow at top edge */}
      <div className={`absolute inset-x-0 top-0 h-px ${a.solidBg} opacity-30`} />
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${a.bg} opacity-50 blur-2xl pointer-events-none`} />
      <div className="relative p-6 md:p-8">
        {slide.title && (
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-2xl ${a.bg} ring-1 ring-inset ${a.border} flex items-center justify-center flex-shrink-0`}>
              <BookOpen className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
          </div>
        )}
        {slide.subtitle && <p className="text-lg text-gray-700 mb-4 font-medium"><RichText text={slide.subtitle} /></p>}
        <div className="space-y-4">
          {(slide.paragraphs || []).map((p, i) => (
            <p key={i} className="text-base text-gray-700 leading-relaxed"><RichText text={p} /></p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideChecklist({ slide, accent }) {
  const a = ACCENTS[accent];
  const variant = slide.variant || 'simple';
  return (
    <div className={`bg-white rounded-2xl border-2 ${a.border} p-6 md:p-10`}>
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-6">{slide.title}</h2>}
      <ul className="space-y-4">
        {(slide.items || []).map((item, i) => {
          const isObj = typeof item === 'object';
          const title = isObj ? item.title : item;
          const body = isObj ? item.body : null;
          if (variant === 'outline_box') {
            return (
              <li key={i} className="flex items-start gap-4">
                <div className={`mt-0.5 w-7 h-7 rounded-md border-2 ${a.borderStrong} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-900"><RichText text={title} /></div>
                  {body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={body} /></div>}
                </div>
              </li>
            );
          }
          return (
            <li key={i} className="flex items-start gap-3">
              <div className={`mt-1 w-6 h-6 rounded-lg ${a.soft} flex items-center justify-center flex-shrink-0`}>
                <Check className={`w-3.5 h-3.5 ${a.text}`} />
              </div>
              <div className="flex-1">
                <div className="text-base text-gray-900 font-medium"><RichText text={title} /></div>
                {body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={body} /></div>}
              </div>
            </li>
          );
        })}
      </ul>
      {slide.footer && (
        <div className="mt-6">
          <AccentBar accent={accent}>
            <p className={`text-base font-semibold ${a.text}`}><RichText text={slide.footer} /></p>
          </AccentBar>
        </div>
      )}
    </div>
  );
}

function SlideStrategySteps({ slide, accent }) {
  const a = ACCENTS[accent];
  const variant = slide.variant || 'chevron';

  const renderStep = (s, i) => {
    const num = s.number ?? i + 1;
    const Icon = s.icon ? (ICONS[s.icon] || Lightbulb) : null;

    if (variant === 'icon_circle') {
      return (
        <li key={i} className="flex items-start gap-4">
          <div className="relative flex-shrink-0 w-14 h-14">
            <div className={`absolute inset-0 rounded-full ${a.solidBg} flex items-center justify-center`}>
              {Icon ? <Icon className="w-6 h-6 text-white" strokeWidth={1.75} /> : <span className="text-white font-bold">{num}</span>}
            </div>
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${a.solidBg} text-white text-xs font-bold flex items-center justify-center border-2 border-white`}>
              {num}
            </div>
          </div>
          <div className="flex-1 pt-1.5">
            <div className="font-semibold text-gray-900 text-base"><RichText text={s.title} /></div>
            {s.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed"><RichText text={s.body} /></div>}
          </div>
        </li>
      );
    }

    if (variant === 'numbered_card') {
      return (
        <li key={i} className={`rounded-xl border-2 ${a.border} bg-white px-4 py-3 flex items-start gap-4`}>
          <div className={`text-2xl font-bold ${a.text} flex-shrink-0 w-6 text-center`}>{num}</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-base"><RichText text={s.title} /></div>
            {s.body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={s.body} /></div>}
          </div>
        </li>
      );
    }

    // chevron (default)
    return (
      <li key={i} className="flex items-center gap-4">
        <div className="relative w-12 h-14 flex items-center justify-center flex-shrink-0">
          <div className={`absolute inset-0 border-2 ${a.borderStrong} rounded-t-lg [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)] bg-white`} />
          <span className={`relative z-10 font-bold ${a.text}`}>{num}</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-base"><RichText text={s.title} /></div>
          {s.body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={s.body} /></div>}
        </div>
      </li>
    );
  };

  // Glass + connected timeline default (when variant is chevron or unspecified)
  const useTimeline = variant === 'chevron' || !variant;
  const steps = slide.steps || [];

  const renderTimelineStep = (s, i) => {
    const num = s.number ?? i + 1;
    const Icon = s.icon ? (ICONS[s.icon] || Lightbulb) : null;
    const isLast = i === steps.length - 1;
    return (
      <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
        {!isLast && (
          <span className={`absolute left-5 top-12 bottom-0 w-px ${a.borderStrong} opacity-40`} aria-hidden="true" />
        )}
        <div className="relative flex-shrink-0 w-10 h-10">
          <div className={`absolute inset-0 rounded-2xl ${a.bg} ring-1 ring-inset ${a.borderStrong} backdrop-blur-md flex items-center justify-center`}>
            {Icon ? <Icon className={`w-5 h-5 ${a.text}`} strokeWidth={2} /> : <span className={`text-base font-bold ${a.textDeep}`}>{num}</span>}
          </div>
          {Icon && (
            <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full ${a.solidBg} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white`}>
              {num}
            </div>
          )}
        </div>
        <div className={`flex-1 rounded-2xl ${a.bgLight} border ${a.border} ring-1 ring-white/70 p-4 backdrop-blur-md`}>
          <div className={`font-semibold text-gray-900 text-base`}><RichText text={s.title} /></div>
          {s.body && <div className="text-sm text-gray-700 mt-1 leading-relaxed"><RichText text={s.body} /></div>}
        </div>
      </li>
    );
  };

  return (
    <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px ${a.solidBg} opacity-30`} />
      <div className={`absolute -top-24 -right-24 w-52 h-52 rounded-full ${a.bg} opacity-50 blur-2xl pointer-events-none`} />
      <div className="relative p-6 md:p-10">
        {slide.title && (
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl ${a.bg} ring-1 ring-inset ${a.border} flex items-center justify-center flex-shrink-0`}>
              <Target className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
          </div>
        )}
        {slide.intro && (
          <AccentBar accent={accent} className="mb-6">
            <p className="text-base text-gray-700"><RichText text={slide.intro} /></p>
          </AccentBar>
        )}
        <ol className={useTimeline ? '' : 'space-y-4'}>
          {steps.map(useTimeline ? renderTimelineStep : renderStep)}
        </ol>
      </div>
    </div>
  );
}

function SlideExample({ slide, accent }) {
  const a = ACCENTS[accent];
  // Support both legacy (single question/options) and new (questions[]) shapes
  const questions = slide.questions || (slide.question ? [{ prompt: slide.question, options: slide.options }] : []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 space-y-5">
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>}
      {slide.intro && <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}
      {slide.passage && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 whitespace-pre-line text-base text-gray-800 font-mono">
          {slide.passage}
        </div>
      )}
      {questions.length > 0 && (
        <div className={`grid grid-cols-1 ${questions.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
          {questions.map((q, i) => (
            <div key={i} className={`rounded-xl border-2 ${a.border} bg-white p-5`}>
              <div className="font-semibold text-gray-900 mb-3">{q.prompt}</div>
              {q.options && (
                <ul className="space-y-1.5">
                  {q.options.map((o, j) => <li key={j} className="text-sm text-gray-700">{o}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {slide.answer && <div className="text-sm font-semibold text-gray-900">Answer: {slide.answer}</div>}
      {slide.explanation && <p className="text-sm text-gray-700 leading-relaxed"><RichText text={slide.explanation} /></p>}
      {slide.callout && <CalloutBox tone={slide.callout.tone} title={slide.callout.title} body={slide.callout.body} accent={accent} />}
    </div>
  );
}

function SlideComparison({ slide, accent }) {
  const a = ACCENTS[accent];
  const hasImages = (slide.columns || []).some((c) => c.image);

  // Column styling per tone — glassy, tinted
  const columnStyle = (tone) => {
    if (tone === 'positive') return {
      cardBg: 'bg-emerald-50/70', cardBorder: 'border-emerald-200/70', ringColor: 'ring-emerald-100',
      iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', dotColor: 'bg-emerald-500',
      labelColor: 'text-emerald-900', Icon: CheckCircle2,
    };
    if (tone === 'negative' || tone === 'warning') return {
      cardBg: 'bg-rose-50/70', cardBorder: 'border-rose-200/70', ringColor: 'ring-rose-100',
      iconBg: 'bg-rose-100', iconColor: 'text-rose-700', dotColor: 'bg-rose-500',
      labelColor: 'text-rose-900', Icon: AlertTriangle,
    };
    // info / default
    return {
      cardBg: a.bgLight, cardBorder: a.border, ringColor: a.bg,
      iconBg: a.soft, iconColor: a.text, dotColor: a.solidBg,
      labelColor: a.textDeep, Icon: ListChecks,
    };
  };

  return (
    <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px ${a.solidBg} opacity-30`} />
      <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full ${a.bg} opacity-50 blur-2xl pointer-events-none`} />
      <div className="relative p-6 md:p-10 space-y-5">
        <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
        {slide.title && (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${a.bg} ring-1 ring-inset ${a.border} flex items-center justify-center flex-shrink-0`}>
              <BarChart className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
          </div>
        )}
        {slide.intro && <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(slide.columns || []).map((col, i) => {
            const s = columnStyle(col.tone);
            const Marker = col.marker === 'check' ? Check : col.marker === 'x' ? XIcon : null;
            return (
              <div
                key={i}
                className={`relative rounded-2xl ${s.cardBg} backdrop-blur-md border ${s.cardBorder} ring-1 ${s.ringColor} p-5 space-y-4`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <s.Icon className={`w-5 h-5 ${s.iconColor}`} strokeWidth={2} />
                  </div>
                  <div className={`text-lg font-bold ${s.labelColor}`}>{col.label}</div>
                  {Marker && <Marker className={`w-5 h-5 ${s.iconColor} ml-auto`} strokeWidth={3} />}
                </div>
                {(col.items || []).length > 0 && (
                  <ul className="space-y-2.5">
                    {col.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <span className={`mt-2 w-1.5 h-1.5 rounded-full ${s.dotColor} flex-shrink-0`} />
                        <span className="text-sm text-gray-800 leading-relaxed flex-1">
                          <RichText text={typeof it === 'string' ? it : it.title} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {col.image && (
                  <div className={`rounded-xl overflow-hidden border ${s.cardBorder}`}>
                    <img src={imgUrl(col.image)} alt="" className={`w-full ${hasImages ? 'aspect-square' : ''} object-cover`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {slide.callout && <CalloutBox tone={slide.callout.tone} title={slide.callout.title} body={slide.callout.body} accent={accent} />}
      </div>
    </div>
  );
}

function SlideCallout({ slide, accent }) {
  return <CalloutBox tone={slide.tone} title={slide.title} body={slide.body} accent={accent} />;
}

function SlideQuoteBlock({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <blockquote className={`bg-white rounded-2xl border-l-4 ${a.borderStrong} border-y border-r border-gray-200 p-6 md:p-8`}>
      <p className="text-lg italic text-gray-800 leading-relaxed">&ldquo;{slide.quote}&rdquo;</p>
      {slide.attribution && <footer className="mt-3 text-sm text-gray-500">— {slide.attribution}</footer>}
    </blockquote>
  );
}

export {
  SlideHero, SlidePhotoHero, SlideSplitVisual, SlideAnalogy3up,
  SlideBigTypography, SlideTimelineZigzag, SlideNarrative, SlideChecklist,
  SlideStrategySteps, SlideExample, SlideComparison, SlideCallout, SlideQuoteBlock,
};
