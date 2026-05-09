import React, { useEffect, useMemo, useState } from 'react';
import { Target, CheckCircle, Sparkles, GraduationCap, Layers, Brain } from 'lucide-react';
import VocabCard from './VocabCard';
import VocabFlashcards from './VocabFlashcards';
import { CLUSTERS, ACCENT_STYLES, buildClusterSections, countClusterItems } from './clusters';
import { loadMastery, masterySummary, setMasteryLevel } from './mastery';

/**
 * VocabularyHub — replacement for the old "Advanced Vocabulary" body.
 *
 * Why the redesign: the previous implementation rendered 11 sub-sections
 * sequentially with eight different colour gradients, totalling roughly
 * 30–40 cards on a single screen. The student saw everything and remembered
 * very little — recognition without recall, decoration without focus.
 *
 * The hub keeps every sub-section but presents them inside four cognitive
 * clusters, only one of which is open at a time. Each card uses progressive
 * disclosure (headword first, meaning on tap), each item has a tappable
 * mastery dot, and a flashcard study mode forces active recall on the same
 * data set the student was just reading.
 *
 * The component is intentionally pure presentational + localStorage — no
 * new LLM calls, no backend dependencies, no audio. This keeps the cost
 * envelope locked (per the 2026-05-08 margin policy) while giving the
 * existing data a far better learning surface.
 */
export default function VocabularyHub({ module, speakText }) {
  const [activeClusterId, setActiveClusterId] = useState(CLUSTERS[0].id);
  const [studyOpen, setStudyOpen] = useState(false);
  const [masteryMap, setMasteryMap] = useState(() => loadMastery(module?.id));

  // Reload mastery when the module changes (student picks a different module)
  useEffect(() => {
    setMasteryMap(loadMastery(module?.id));
    setActiveClusterId(CLUSTERS[0].id);
  }, [module?.id]);

  const activeCluster = CLUSTERS.find((c) => c.id === activeClusterId) || CLUSTERS[0];
  const activeStyles = ACCENT_STYLES[activeCluster.accent];
  const sections = useMemo(
    () => buildClusterSections(module, activeCluster),
    [module, activeCluster]
  );
  const summary = masterySummary(masteryMap);
  const totalInCluster = sections.reduce((acc, s) => acc + s.items.length, 0);

  const handleMasteryChange = (key, level) => {
    setMasteryLevel(module?.id, key, level);
    setMasteryMap((prev) => {
      const next = { ...prev };
      if (!level || level === 'new') {
        delete next[key];
      } else {
        next[key] = level;
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header: title + global mastery summary */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" /> Advanced Vocabulary
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md">
            Four clusters, one focus at a time. Tap a card to reveal the meaning, the dot to mark
            your progress.
          </p>
        </div>
        <MasteryPill summary={summary} />
      </div>

      {/* Learning goals — anchored above tabs because they apply across clusters */}
      {module?.learning_goals?.length > 0 && (
        <div className="rounded-xl bg-amber-50/60 border border-amber-100 px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Target className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[11px] uppercase tracking-wide font-bold text-amber-800">
              Learning goals
            </span>
          </div>
          <ul className="space-y-1">
            {module.learning_goals.map((goal, i) => (
              <li key={i} className="text-xs text-gray-800 flex items-start gap-2 leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cluster tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {CLUSTERS.map((cluster) => {
          const styles = ACCENT_STYLES[cluster.accent];
          const isActive = cluster.id === activeClusterId;
          const count = countClusterItems(module, cluster);
          return (
            <button
              key={cluster.id}
              type="button"
              onClick={() => setActiveClusterId(cluster.id)}
              className={`text-left rounded-xl border px-3 py-2.5 transition ${
                isActive
                  ? `bg-white border-gray-300 shadow-sm ring-2 ${styles.ring}`
                  : 'bg-white/60 border-gray-200 hover:border-gray-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 leading-tight">
                  {cluster.label}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${styles.chip}`}>
                  {count}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">
                {cluster.blurb}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active cluster body */}
      <div className={`rounded-2xl bg-gradient-to-b ${activeStyles.headerTint} border border-gray-100 p-4`}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <div className={`text-[10px] uppercase tracking-wide font-bold ${activeStyles.text}`}>
              {activeCluster.label}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {totalInCluster} item{totalInCluster === 1 ? '' : 's'} across {sections.length} group
              {sections.length === 1 ? '' : 's'}
            </div>
          </div>
          {totalInCluster > 0 && (
            <button
              type="button"
              onClick={() => setStudyOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${activeStyles.pill} hover:opacity-90`}
            >
              <Brain className="w-3.5 h-3.5" />
              Study with flashcards
            </button>
          )}
        </div>

        {totalInCluster === 0 ? (
          <div className="rounded-lg bg-white/60 border border-dashed border-gray-200 p-6 text-center">
            <Layers className="w-5 h-5 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              No content in this cluster for the current module.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <SectionGroup
                key={section.category}
                section={section}
                accent={activeCluster.accent}
                masteryMap={masteryMap}
                onMasteryChange={handleMasteryChange}
                onSpeak={speakText}
              />
            ))}
          </div>
        )}

        {/* Self-check footer for active recall */}
        {totalInCluster > 0 && (
          <div className="mt-4 rounded-lg bg-white/70 border border-gray-100 px-3 py-2.5 flex items-start gap-2">
            <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${activeStyles.text}`} />
            <p className="text-[11px] text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">Quick self-check:</span> cover the
              meanings and try to recall three of these from memory before moving on. Recall beats
              re-reading every time.
            </p>
          </div>
        )}
      </div>

      {/* Flashcard overlay */}
      {studyOpen && (
        <VocabFlashcards
          cluster={activeCluster}
          sections={sections}
          onMasteryChange={handleMasteryChange}
          onSpeak={speakText}
          onClose={() => setStudyOpen(false)}
        />
      )}
    </div>
  );
}

function SectionGroup({ section, accent, masteryMap, onMasteryChange, onSpeak }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
          <span aria-hidden>{section.icon}</span>
          {section.title}
        </h4>
        <span className="text-[10px] text-gray-400">{section.items.length}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {section.items.map((item) => (
          <VocabCard
            key={item.key}
            item={item}
            accent={accent}
            mastery={masteryMap[item.key]}
            onMasteryChange={onMasteryChange}
            onSpeak={onSpeak}
          />
        ))}
      </div>
    </div>
  );
}

function MasteryPill({ summary }) {
  const total = summary.new + summary.learning + summary.known;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 flex items-center gap-2 text-[11px]">
      <span className="font-semibold text-gray-700">Progress</span>
      <span className="flex items-center gap-1 text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {summary.known}
      </span>
      <span className="flex items-center gap-1 text-amber-600">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {summary.learning}
      </span>
      <span className="text-gray-400">· {total} tracked</span>
    </div>
  );
}
