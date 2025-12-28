/**
 * EvaluationResult Component
 * ==========================
 * Displays track-specific AI evaluation results for IELTS Writing and Reading.
 * 
 * Design Principles:
 * - Examiner report style (no gamification, no emojis)
 * - Track integrity (Academic vs General strictly separated)
 * - Deterministic rendering (only show what backend sends)
 */

import React from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { 
  FileText, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';

// Track badge colors
const TRACK_STYLES = {
  academic: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    label: 'Academic IELTS'
  },
  general: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    label: 'General Training'
  }
};

// Band score color coding
const getBandColor = (band) => {
  if (band >= 7.5) return 'text-green-700';
  if (band >= 6.5) return 'text-blue-700';
  if (band >= 5.5) return 'text-amber-700';
  return 'text-red-700';
};

// Skill score to percentage (0-5 scale to 0-100)
const skillToPercent = (score, max = 5) => (score / max) * 100;

/**
 * Main Evaluation Header
 */
const EvaluationHeader = ({ skill, track, overallBand }) => {
  const trackStyle = TRACK_STYLES[track] || TRACK_STYLES.academic;
  
  return (
    <div className="border-b border-gray-200 pb-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {skill === 'writing' ? (
            <FileText className="w-6 h-6 text-gray-600" />
          ) : (
            <BookOpen className="w-6 h-6 text-gray-600" />
          )}
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {skill} Evaluation
          </h2>
        </div>
        <Badge className={`${trackStyle.bg} ${trackStyle.text} ${trackStyle.border} border px-3 py-1`}>
          {trackStyle.label}
        </Badge>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-gray-500 uppercase tracking-wide">Overall Band</span>
        <span className={`text-4xl font-bold ${getBandColor(overallBand)}`}>
          {overallBand.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

/**
 * Criteria Breakdown for Writing
 */
const CriteriaBreakdown = ({ criteria }) => {
  if (!criteria || Object.keys(criteria).length === 0) return null;
  
  const criteriaLabels = {
    task_response: { label: 'Task Response', desc: 'Addresses all parts of the task with relevant ideas' },
    task_achievement: { label: 'Task Achievement', desc: 'Covers requirements with appropriate selection of information' },
    coherence: { label: 'Coherence & Cohesion', desc: 'Logical organization with appropriate linking' },
    coherence_cohesion: { label: 'Coherence & Cohesion', desc: 'Logical organization with appropriate linking' },
    lexical_resource: { label: 'Lexical Resource', desc: 'Range and accuracy of vocabulary' },
    grammar: { label: 'Grammatical Range', desc: 'Variety and accuracy of sentence structures' },
    grammatical_range: { label: 'Grammatical Range', desc: 'Variety and accuracy of sentence structures' }
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Criteria Breakdown
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(criteria).map(([key, score]) => {
          const info = criteriaLabels[key] || { label: key, desc: '' };
          return (
            <div 
              key={key} 
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
              title={info.desc}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">{info.label}</span>
                <span className={`text-lg font-semibold ${getBandColor(score)}`}>
                  {typeof score === 'number' ? score.toFixed(1) : score}
                </span>
              </div>
              <Progress 
                value={skillToPercent(score, 9)} 
                className="h-1.5 bg-gray-200"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Strengths Section
 */
const StrengthsSection = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Strengths
      </h3>
      <ul className="space-y-2">
        {strengths.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Weaknesses Section
 */
const WeaknessesSection = ({ weaknesses }) => {
  if (!weaknesses || weaknesses.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Areas for Improvement
      </h3>
      <ul className="space-y-2">
        {weaknesses.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
            <Target className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Mistakes & Corrections Section
 */
const MistakesCorrections = ({ mistakes, corrections }) => {
  if ((!mistakes || mistakes.length === 0) && (!corrections || corrections.length === 0)) {
    return null;
  }
  
  // Pair mistakes with corrections if possible
  const pairs = [];
  const maxLen = Math.max(mistakes?.length || 0, corrections?.length || 0);
  
  for (let i = 0; i < maxLen; i++) {
    pairs.push({
      mistake: mistakes?.[i] || null,
      correction: corrections?.[i] || null
    });
  }
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Mistakes & Corrections
      </h3>
      <div className="space-y-3">
        {pairs.map((pair, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-3 text-sm">
            {pair.mistake && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex items-center gap-1 text-red-700 font-medium mb-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mistake</span>
                </div>
                <p className="text-gray-700">{pair.mistake}</p>
              </div>
            )}
            {pair.correction && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-center gap-1 text-green-700 font-medium mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Correction</span>
                </div>
                <p className="text-gray-700">{pair.correction}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Reading Skills Breakdown
 */
const ReadingSkillsBreakdown = ({ skills }) => {
  if (!skills || skills.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Reading Skills Analysis
      </h3>
      <div className="space-y-3">
        {skills.map((skill, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-800">{skill.name}</span>
              <span className={`text-sm font-semibold ${
                skill.score >= 4 ? 'text-green-700' : 
                skill.score >= 3 ? 'text-blue-700' : 
                skill.score >= 2 ? 'text-amber-700' : 'text-red-700'
              }`}>
                {skill.score}/5
              </span>
            </div>
            <Progress 
              value={skillToPercent(skill.score, 5)} 
              className="h-2 bg-gray-200 mb-2"
            />
            {skill.evidence && (
              <p className="text-xs text-gray-500 italic">
                Evidence: {skill.evidence}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Document Type Display (for General Training Reading)
 */
const DocumentTypeDisplay = ({ documentType }) => {
  if (!documentType) return null;
  
  const typeLabels = {
    policy: 'Policy Document',
    policy_document: 'Policy Document',
    contract: 'Contract / Agreement',
    contract_agreement: 'Contract / Agreement',
    notice: 'Official Notice',
    official_notice: 'Official Notice',
    manual: 'Instruction Manual',
    instruction_manual: 'Instruction Manual',
    leaflet: 'Information Leaflet',
    information_leaflet: 'Information Leaflet'
  };
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
        Document Type
      </h3>
      <Badge variant="outline" className="text-sm px-3 py-1">
        {typeLabels[documentType] || documentType}
      </Badge>
    </div>
  );
};

/**
 * Recommended Lessons Section
 */
const RecommendedLessons = ({ lessons, onLessonClick }) => {
  if (!lessons || lessons.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
        Recommended Lessons
      </h3>
      <div className="space-y-2">
        {lessons.map((lesson, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div>
              {lesson.stage && (
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {lesson.stage}
                </span>
              )}
              <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onLessonClick?.(lesson)}
              className="text-blue-600 hover:text-blue-700"
            >
              Go to lesson
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Error State Component
 */
const EvaluationError = ({ type }) => {
  const messages = {
    mismatch: 'Evaluation track mismatch detected. Please retry.',
    failed: 'Evaluation could not be completed. Try again.',
    default: 'An error occurred during evaluation.'
  };
  
  return (
    <Card className="p-6 bg-red-50 border-red-200">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600" />
        <p className="text-red-800">{messages[type] || messages.default}</p>
      </div>
    </Card>
  );
};

/**
 * Writing Evaluation Result Component
 */
export const WritingEvaluationResult = ({ 
  evaluation, 
  onLessonClick,
  expectedTrack = null
}) => {
  // Track integrity check
  if (expectedTrack && evaluation?.track && evaluation.track !== expectedTrack) {
    return <EvaluationError type="mismatch" />;
  }
  
  if (!evaluation || !evaluation.track) {
    return <EvaluationError type="failed" />;
  }
  
  const {
    skill = 'writing',
    track,
    overall_band,
    overallBand,
    criteria,
    criteria_scores,
    strengths,
    weaknesses,
    mistakes,
    corrections,
    recommended_lessons,
    recommendedLessons
  } = evaluation;
  
  const finalBand = overall_band || overallBand || 0;
  const finalCriteria = criteria || criteria_scores || {};
  const finalLessons = recommended_lessons || recommendedLessons || [];
  
  return (
    <Card className="p-6 bg-white border border-gray-200">
      <EvaluationHeader 
        skill={skill} 
        track={track} 
        overallBand={finalBand} 
      />
      
      <CriteriaBreakdown criteria={finalCriteria} />
      
      <StrengthsSection strengths={strengths} />
      
      <WeaknessesSection weaknesses={weaknesses} />
      
      <MistakesCorrections mistakes={mistakes} corrections={corrections} />
      
      <RecommendedLessons lessons={finalLessons} onLessonClick={onLessonClick} />
    </Card>
  );
};

/**
 * Reading Evaluation Result Component
 */
export const ReadingEvaluationResult = ({ 
  evaluation, 
  onLessonClick,
  expectedTrack = null
}) => {
  // Track integrity check
  if (expectedTrack && evaluation?.track && evaluation.track !== expectedTrack) {
    return <EvaluationError type="mismatch" />;
  }
  
  if (!evaluation || !evaluation.track) {
    return <EvaluationError type="failed" />;
  }
  
  const {
    skill = 'reading',
    track,
    overall_band,
    overallBand,
    estimated_band,
    skills,
    skill_analysis,
    document_type,
    documentType,
    recommended_lessons,
    recommendedLessons
  } = evaluation;
  
  const finalBand = overall_band || overallBand || estimated_band || 0;
  const finalSkills = skills || skill_analysis || [];
  const finalDocType = document_type || documentType;
  const finalLessons = recommended_lessons || recommendedLessons || [];
  
  return (
    <Card className="p-6 bg-white border border-gray-200">
      <EvaluationHeader 
        skill={skill} 
        track={track} 
        overallBand={finalBand} 
      />
      
      {track === 'general' && <DocumentTypeDisplay documentType={finalDocType} />}
      
      <ReadingSkillsBreakdown skills={finalSkills} />
      
      <RecommendedLessons lessons={finalLessons} onLessonClick={onLessonClick} />
    </Card>
  );
};

/**
 * Main Evaluation Result Component (auto-detects skill type)
 */
const EvaluationResult = ({ 
  evaluation, 
  onLessonClick,
  expectedTrack = null
}) => {
  if (!evaluation) {
    return <EvaluationError type="failed" />;
  }
  
  const skill = evaluation.skill || 'writing';
  
  if (skill === 'reading') {
    return (
      <ReadingEvaluationResult 
        evaluation={evaluation} 
        onLessonClick={onLessonClick}
        expectedTrack={expectedTrack}
      />
    );
  }
  
  return (
    <WritingEvaluationResult 
      evaluation={evaluation} 
      onLessonClick={onLessonClick}
      expectedTrack={expectedTrack}
    />
  );
};

export default EvaluationResult;
