import React, { useState } from 'react';
import { Trophy, Star, BookOpen, Edit3, Zap, Play, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { API_URL, ACTIVITY_ICONS } from '../lib/constants';

// ═══════ LESSON SUMMARY ("What did you learn?") ═══════
function LessonSummary({ lesson, activityScores, summaryData, completedActivities, onFinish }) {
  const words = summaryData?.words || [];
  const grammarRules = summaryData?.grammarRules || [];
  const totalActivities = (lesson?.activity_flow || []).filter(a => a.type !== 'auto_review').length;
  const completedCount = completedActivities.filter(a => a !== 'auto_review').length;

  const scores = Object.values(activityScores).filter(s => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const getMotivation = () => {
    if (avgScore >= 90) return { text: 'Amazing work!', emoji: 'trophy', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (avgScore >= 70) return { text: 'Good job!', emoji: 'star', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (avgScore >= 50) return { text: 'Nice effort!', emoji: 'thumbsup', color: 'text-green-600', bg: 'bg-green-50' };
    return { text: 'Keep practicing!', emoji: 'muscle', color: 'text-purple-600', bg: 'bg-purple-50' };
  };
  const motivation = getMotivation();

  const scoreLabels = {
    'retrieval_warmup': 'Warm-up', 'micro_game_vocab': 'Vocab Game', 'micro_reading': 'Reading',
    'micro_game_grammar': 'Grammar Game', 'listening': 'Listening', 'production': 'Speaking', 'exit_ticket': 'Exit Quiz'
  };

  const [pdfLoading, setPdfLoading] = useState(false);

  const buildPDFContent = (doc, worksheetData) => {
    const pw = 210;
    let y = 15;
    const pdfWords = worksheetData.words || [];
    const pdfRules = worksheetData.grammar_rules || [];
    const exercises = worksheetData.exercises || {};
    const title = worksheetData.mode === 'cumulative' ? 'Cumulative Review Worksheet' : 'Lesson Worksheet';
    const subtitle = worksheetData.lesson_title || '';

    // Header
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pw, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pw / 2, 12, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle + (worksheetData.word_count ? ` (${worksheetData.word_count} words)` : ''), pw / 2, 22, { align: 'center' });
    y = 40;
    doc.setTextColor(0, 0, 0);

    const checkPage = (needed) => {
      if (y + needed > 280) { doc.addPage(); y = 20; }
    };

    // === VOCABULARY SECTION ===
    const vocabExercises = exercises.vocabulary_section || {};

    if (pdfWords.length > 0) {
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Part A: Vocabulary', 15, y); y += 8;

      // Word list
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      pdfWords.forEach((w) => {
        checkPage(8);
        doc.setFont('helvetica', 'bold');
        doc.text(w.word || '', 18, y);
        doc.setFont('helvetica', 'normal');
        const def = w.definition || w.meaning || '';
        if (def) doc.text(` - ${def}`, 18 + doc.getTextWidth(w.word || '') + 2, y);
        y += 6;
      });
      y += 6;
    }

    // Activity 1: Matching
    const matching = vocabExercises.matching || [];
    if (matching.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 1: Match the Word to Its Meaning', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      const shuffledDefs = [...matching].sort(() => Math.random() - 0.5);
      matching.forEach((item, i) => {
        checkPage(8);
        doc.text(`${i + 1}. ${item.word}`, 20, y);
        doc.text(`___  ${String.fromCharCode(97 + i)}) ${shuffledDefs[i]?.definition || ''}`, 80, y);
        y += 7;
      });
      y += 6;
    }

    // Activity 2: Fill in the blank
    const fillBlank = vocabExercises.fill_blank || [];
    if (fillBlank.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 2: Fill in the Blank', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      fillBlank.forEach((item, i) => {
        checkPage(8);
        doc.text(`${i + 1}. ${item.sentence}`, 20, y);
        if (item.hint) { doc.setTextColor(150, 150, 150); doc.text(`  (Hint: ${item.hint})`, 20, y + 5); doc.setTextColor(0, 0, 0); y += 5; }
        y += 7;
      });
      y += 6;
    }

    // Activity 3: True/False
    const trueFalse = vocabExercises.true_false || [];
    if (trueFalse.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 3: True or False?', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      trueFalse.forEach((item, i) => {
        checkPage(8);
        doc.text(`${i + 1}. ${item.statement}   T / F`, 20, y);
        y += 7;
      });
      y += 6;
    }

    // === GRAMMAR SECTION ===
    const grammarExercises = exercises.grammar_section || {};

    if (pdfRules.length > 0) {
      checkPage(30);
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Part B: Grammar', 15, y); y += 8;
      doc.setFontSize(10);
      pdfRules.forEach((r) => {
        checkPage(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Pattern: ${r.pattern}`, 18, y); y += 5;
        doc.setFont('helvetica', 'normal');
        if (r.explanation) { doc.text(r.explanation, 22, y, { maxWidth: 165 }); y += 6; }
        y += 3;
      });
      y += 4;
    }

    // Activity 4: Reorder words
    const reorder = grammarExercises.reorder || [];
    if (reorder.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 4: Put the Words in Order', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      reorder.forEach((item, i) => {
        checkPage(10);
        doc.text(`${i + 1}. ${item.scrambled}`, 20, y); y += 5;
        doc.text('   ________________________________________________', 20, y); y += 7;
      });
      y += 4;
    }

    // Activity 5: Correct the mistake
    const correctMistake = grammarExercises.correct_mistake || [];
    if (correctMistake.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 5: Find and Fix the Mistake', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      correctMistake.forEach((item, i) => {
        checkPage(10);
        doc.text(`${i + 1}. ${item.sentence}`, 20, y); y += 5;
        doc.text('   Correct: ________________________________________', 20, y); y += 7;
      });
      y += 4;
    }

    // Activity 6: Complete the pattern
    const completePattern = grammarExercises.complete_pattern || [];
    if (completePattern.length > 0) {
      checkPage(20);
      doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Activity 6: Complete the Sentence', 15, y); y += 7;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      completePattern.forEach((item, i) => {
        checkPage(10);
        const opts = (item.options || []).join('  /  ');
        doc.text(`${i + 1}. ${item.pattern}`, 20, y);
        if (opts) { doc.setTextColor(100, 100, 100); doc.text(`  [ ${opts} ]`, 20, y + 5); doc.setTextColor(0, 0, 0); y += 5; }
        y += 7;
      });
      y += 4;
    }

    // === MIXED REVIEW ===
    const mixedReview = exercises.mixed_review || [];
    if (mixedReview.length > 0) {
      checkPage(20);
      doc.setFontSize(14); doc.setFont('helvetica', 'bold');
      doc.text('Part C: Mixed Review', 15, y); y += 8;
      doc.setFontSize(10); doc.setFont('helvetica', 'normal');
      mixedReview.forEach((item, i) => {
        checkPage(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${i + 1}. ${item.question}`, 20, y); y += 6;
        doc.setFont('helvetica', 'normal');
        (item.options || []).forEach((opt, oi) => {
          doc.text(`   ${String.fromCharCode(65 + oi)}) ${opt}`, 24, y); y += 5;
        });
        y += 3;
      });
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Testmaster - Practice makes perfect!', pw / 2, 290, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString()}  |  Page ${p}/${pages}`, pw / 2, 294, { align: 'center' });
    }
  };

  const generatePDF = async (mode = 'current') => {
    setPdfLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });

      // Fetch GPT-4o generated worksheet from backend (cached after first call)
      const res = await fetch(`${API_URL}/api/worksheet/generate/${lesson?.lesson_id}?mode=${mode}&max_words=20`);
      if (!res.ok) throw new Error('Failed to generate worksheet');
      const worksheetData = await res.json();

      buildPDFContent(doc, worksheetData);
      const filename = mode === 'cumulative'
        ? `Testmaster_Review_${lesson?.title?.replace(/\s+/g, '_') || 'Worksheet'}.pdf`
        : `Testmaster_${lesson?.title?.replace(/\s+/g, '_') || 'Worksheet'}_L${lesson?.number || ''}.pdf`;
      doc.save(filename);
      toast.success(mode === 'cumulative' ? 'Cumulative review worksheet downloaded!' : 'Worksheet downloaded!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    }
    setPdfLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5" data-testid="lesson-summary">
      {/* Header */}
      <Card className={`p-8 text-center ${motivation.bg} border-0`}>
        <div className="lesson-trophy w-20 h-20 bg-white/80 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm">
          <Trophy className={`w-10 h-10 ${motivation.color}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Lesson Complete!</h2>
        <p className={`text-lg font-semibold ${motivation.color} mb-1`}>{motivation.text}</p>
        <p className="text-sm text-gray-500">{completedCount}/{totalActivities} activities completed</p>
        {avgScore > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">Average Score: {avgScore}%</span>
          </div>
        )}
      </Card>

      {/* Words Learned */}
      {words.length > 0 && (
        <Card className="p-5" data-testid="summary-words">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Words You Learned
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {words.map((w, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                <span className="text-lg">{w.image_emoji || w.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{w.word}</p>
                  <p className="text-xs text-gray-400 truncate">{w.ipa}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grammar Learned */}
      {grammarRules.length > 0 && (
        <Card className="p-5" data-testid="summary-grammar">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Edit3 className="w-3.5 h-3.5" /> Grammar Patterns
          </h3>
          <div className="space-y-2">
            {grammarRules.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-violet-50 rounded-lg px-4 py-3">
                <code className="text-sm font-mono font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">{r.pattern}</code>
                <span className="text-sm text-gray-600">{r.title || r.rule_text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Scores */}
      {scores.length > 0 && (
        <Card className="p-5" data-testid="summary-scores">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Your Scores
          </h3>
          <div className="space-y-2">
            {Object.entries(activityScores).map(([type, score]) => {
              const label = scoreLabels[type] || type;
              const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
              const Icon = ACTIVITY_ICONS[type] || Play;
              return (
                <div key={type} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
                  </div>
                  <span className={`text-sm font-bold w-12 text-right ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{score}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Extra Fun Links */}
      {lesson?.extra_links?.length > 0 && (
        <Card className="p-5 border-blue-100 bg-blue-50/30" data-testid="extra-fun-links">
          <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Play className="w-3.5 h-3.5" /> Extra Fun
          </h3>
          <div className="space-y-2">
            {lesson.extra_links.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm transition-all"
                data-testid={`extra-link-${i}`}>
                {link.type === 'youtube' ? <Play className="w-5 h-5 text-red-500 shrink-0" /> : <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />}
                <span className="text-sm font-medium text-gray-700">{link.label}</span>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" aria-label="Opens in a new tab" />
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Finish Button */}
      <div className="text-center pt-2 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" onClick={() => generatePDF('current')} disabled={pdfLoading} className="px-5 text-sm" data-testid="download-worksheet-btn">
            <Download className="w-4 h-4 mr-2" /> {pdfLoading ? 'Generating...' : 'This Lesson'}
          </Button>
          <Button variant="outline" onClick={() => generatePDF('cumulative')} disabled={pdfLoading} className="px-5 text-sm border-amber-300 text-amber-700 hover:bg-amber-50" data-testid="download-cumulative-btn">
            <Download className="w-4 h-4 mr-2" /> {pdfLoading ? 'Generating...' : 'All Lessons (Cumulative)'}
          </Button>
        </div>
        <div>
          {lesson?.title?.toLowerCase().includes('final gate') || lesson?.lesson_id?.includes('unit_12_lesson_04') ? (
            <Button size="lg" onClick={onFinish} className="px-8 bg-amber-500 hover:bg-amber-600 text-white shadow-lg" data-testid="lesson-summary-finish-btn">
              <Trophy className="w-5 h-5 mr-2" /> Claim Your Certificate
            </Button>
          ) : (
            <Button size="lg" onClick={onFinish} className="px-8" data-testid="lesson-summary-finish-btn">
              <Star className="w-5 h-5 mr-2" /> Finish Lesson
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">Your vocabulary has been added to your review queue.</p>
      </div>
    </div>
  );
}

export default LessonSummary;
