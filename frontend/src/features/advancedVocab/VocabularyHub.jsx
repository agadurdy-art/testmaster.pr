import React, { useEffect, useMemo, useState } from 'react';
import { Target, CheckCircle, Sparkles, GraduationCap, Layers, Brain } from 'lucide-react';
import VocabCard from './VocabCard';
import VocabFlashcards from './VocabFlashcards';
import { CLUSTERS, ACCENT_STYLES, buildClusterSections, countClusterItems } from './clusters';
import { loadMastery, masterySummary, setMasteryLevel } from './mastery';

/**
 * VocabularyHub — replacement for the old "Advanced Vocabulary" body.
 *
 * Visual punch-up (post-2026-05-09): the first pass leaned too pastel and the
 * page felt empty. This revision:
 *   - Cluster tabs paint the full accent colour when active (was a thin ring)
 *   - Learning goals use a deeper amber strip with stronger contrast
 *   - Active cluster body uses a saturated header band + clearer section
 *     separators with coloured dots
 *   - Section title gets an accent dot and a count chip pinned to the right
 *
 * Behaviour is unchanged: progressive-reveal cards, localStorage mastery,
 * flashcard study mode. Pure client-side, no LLM calls.
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
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </span>
            Advanced Vocabulary
          </h3>
          <p className="text-xs text-gray-600 mt-1 max-w-md">
            Four clusters, one focus at a time. Tap a card to reveal the meaning, the dot to mark
            your progress.
          </p>
        </div>
        <MasteryPill summary={summary} />
      </div>

      {/* Learning goals — deeper amber strip */}
      {module?.learning_goals?.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-amber-100 to-orange-50 border border-amber-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-700" />
            <span className="text-[11px] uppercase tracking-wide font-bold text-amber-900">
              Learning goals
            </span>
          </div>
          <ul className="space-y-1.5">
            {module.learning_goals.map((goal, i) => (
              <li key={i} className="text-[13px] text-gray-900 flex items-start gap-2 leading-relaxed font-medium">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cluster tabs — saturated active state */}
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
              className={`text-left rounded-xl px-3 py-3 transition border ${
                isActive
                  ? `${styles.tabActiveBg} ${styles.tabActiveText} border-transparent shadow-md`
                  : `bg-white ${styles.text} border-gray-200 hover:border-gray-400 hover:shadow-sm`
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold leading-tight ${isActive ? '' : 'text-gray-900'}`}>
                  {cluster.label}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/25 text-white' : styles.chipSoft
                  }`}
                >
                  {count}
                </span>
              </div>
              <p
                className={`text-[10px] mt-1 leading-snug line-clamp-2 ${
                  isActive ? 'text-white/90' : 'text-gray-500'
                }`}
              >
                {cluster.blurb}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active cluster body */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className={`bg-gradient-to-b ${activeStyles.headerTint}`}>
          <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-2 border-b border-gray-200/60">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${activeStyles.sectionDot}`} />
              <div>
                <div className={`text-[11px] uppercase tracking-wide font-bold ${activeStyles.textStrong}`}>
                  {activeCluster.label}
                </div>
                <div className="text-xs text-gray-700 mt-0.5">
                  {totalInCluster} item{totalInCluster === 1 ? '' : 's'} across {sections.length} group
                  {sections.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
            {totalInCluster > 0 && (
              <button
                type="button"
                onClick={() => setStudyOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold ${activeStyles.pill} shadow-sm hover:opacity-95 hover:shadow`}
              >
                <Brain className="w-3.5 h-3.5" />
                Study with flashcards
              </button>
            )}
          </div>

          <div className="px-4 py-4">
            {totalInCluster === 0 ? (
              <div className="rounded-lg bg-white border border-dashed border-gray-200 p-6 text-center">
                <Layers className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500">
                  No content in this cluster for the current module.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
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
              <div className={`mt-4 rounded-lg ${activeStyles.bodyTint} border ${activeStyles.divider} px-3.5 py-3 flex items-start gap-2`}>
                <Sparkles className={`w-4 h-4 flex-shrink-0 mt-0.5 ${activeStyles.text}`} />
                <p className="text-[12px] text-gray-800 leading-relaxed">
                  <span className={`font-bold ${activeStyles.textStrong}`}>Quick self-check:</span>{' '}
                  cover the meanings and try to recall three of these from memory before moving on.
                  Recall beats re-reading every time.
                </p>
              </div>
            )}
          </div>
        </div>
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
  const styles = ACCENT_STYLES[accent];
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${styles.sectionDot}`} />
          <span className="mr-0.5" aria-hidden>{section.icon}</span>
          {section.title}
        </h4>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.chipSoft}`}>
          {section.items.length}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2.5">
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
    <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 flex items-center gap-3 text-[11px] shadow-sm">
      <span className="font-bold text-gray-900">Progress</span>
      <span className="flex items-center gap-1 font-bold text-emerald-600">
        <span className="w-2 h-2 rounded-full bg-emerald-500" /> {summary.known}
      </span>
      <span className="flex items-center gap-1 font-bold text-amber-600">
        <span className="w-2 h-2 rounded-full bg-amber-500" /> {summary.learning}
      </span>
      <span className="text-gray-500">· {total} tracked</span>
    </div>
  );
}
