import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Languages, Lightbulb, FileText, CheckCircle, XCircle, AlertCircle,
  PenTool, Trophy, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function GrammarSection({
  selectedLesson,
  t,
  grammarPracticeAnswers,
  setGrammarPracticeAnswers,
  grammarPracticeSubmitted,
  setGrammarPracticeSubmitted,
  grammarPracticeScore,
  setGrammarPracticeScore,
  setCurrentSection,
}) {
    // Generate additional examples based on lesson topic
    const getAdditionalExamples = () => {
      const topic = selectedLesson?.topic?.toLowerCase() || '';
      const grammarTitle = selectedLesson?.grammar?.title?.toLowerCase() || '';
      
      // Topic-specific grammar examples
      const exampleSets = {
        family: {
          'present simple': [
            { correct: "My mother is a teacher.", wrong: "My mother are a teacher." },
            { correct: "My parents are from Turkey.", wrong: "My parents is from Turkey." },
            { correct: "He has two sisters.", wrong: "He have two sisters." },
            { correct: "She works at a hospital.", wrong: "She work at a hospital." }
          ],
          'to be': [
            { correct: "I am the youngest in my family.", wrong: "I is the youngest." },
            { correct: "My brother is 25 years old.", wrong: "My brother have 25 years." },
            { correct: "They are my cousins.", wrong: "They is my cousins." }
          ]
        },
        'daily life': {
          'present simple': [
            { correct: "I wake up at 7 AM.", wrong: "I am wake up at 7 AM." },
            { correct: "She goes to work by bus.", wrong: "She go to work by bus." },
            { correct: "We eat dinner at 8 PM.", wrong: "We eats dinner at 8 PM." },
            { correct: "He doesn't like coffee.", wrong: "He don't like coffee." }
          ]
        },
        food: {
          'countable': [
            { correct: "I would like some water.", wrong: "I would like a water." },
            { correct: "There is some rice on the plate.", wrong: "There are some rice." },
            { correct: "How much sugar do you want?", wrong: "How many sugar do you want?" },
            { correct: "I bought two loaves of bread.", wrong: "I bought two breads." }
          ],
          'present simple': [
            { correct: "I usually eat breakfast at 8.", wrong: "I usually eating breakfast." },
            { correct: "She likes Italian food.", wrong: "She like Italian food." }
          ]
        },
        work: {
          'present simple': [
            { correct: "He works in an office.", wrong: "He work in an office." },
            { correct: "They don't work on Sundays.", wrong: "They doesn't work on Sundays." },
            { correct: "Does she work here?", wrong: "Do she works here?" }
          ]
        },
        default: [
          { correct: "I am a student.", wrong: "I is a student." },
          { correct: "She has a car.", wrong: "She have a car." },
          { correct: "They are happy.", wrong: "They is happy." },
          { correct: "He doesn't speak French.", wrong: "He don't speaks French." }
        ]
      };
      
      // Find matching examples
      for (const [key, examples] of Object.entries(exampleSets)) {
        if (topic.includes(key)) {
          for (const [grammarType, sentences] of Object.entries(examples)) {
            if (grammarTitle.includes(grammarType)) {
              return sentences;
            }
          }
          return Object.values(examples)[0] || exampleSets.default;
        }
      }
      return exampleSets.default;
    };
    
    // Generate practice exercises
    const getPracticeExercises = () => {
      const topic = selectedLesson?.topic?.toLowerCase() || '';
      
      const exercises = {
        family: [
          { sentence: "My sister ___ a doctor.", options: ["is", "are", "am"], correct: "is" },
          { sentence: "I ___ two brothers.", options: ["has", "have", "am"], correct: "have" },
          { sentence: "They ___ from Istanbul.", options: ["is", "are", "am"], correct: "are" },
          { sentence: "She ___ married.", options: ["is", "are", "have"], correct: "is" }
        ],
        'daily life': [
          { sentence: "He ___ up at 6 AM every day.", options: ["wake", "wakes", "waking"], correct: "wakes" },
          { sentence: "I ___ to work by car.", options: ["goes", "go", "going"], correct: "go" },
          { sentence: "She ___ TV in the evening.", options: ["watch", "watches", "watching"], correct: "watches" },
          { sentence: "We ___ breakfast together.", options: ["has", "have", "having"], correct: "have" }
        ],
        food: [
          { sentence: "I would like ___ coffee.", options: ["a", "some", "many"], correct: "some" },
          { sentence: "How ___ apples do you want?", options: ["much", "many", "some"], correct: "many" },
          { sentence: "There ___ milk in the fridge.", options: ["is", "are", "have"], correct: "is" },
          { sentence: "She ___ pizza very much.", options: ["like", "likes", "liking"], correct: "likes" }
        ],
        work: [
          { sentence: "He ___ in a bank.", options: ["work", "works", "working"], correct: "works" },
          { sentence: "They ___ work on weekends.", options: ["doesn't", "don't", "isn't"], correct: "don't" },
          { sentence: "___ she work here?", options: ["Do", "Does", "Is"], correct: "Does" },
          { sentence: "I ___ a teacher.", options: ["am", "is", "are"], correct: "am" }
        ],
        default: [
          { sentence: "She ___ a student.", options: ["is", "are", "am"], correct: "is" },
          { sentence: "They ___ happy today.", options: ["is", "are", "am"], correct: "are" },
          { sentence: "I ___ from Turkey.", options: ["is", "are", "am"], correct: "am" },
          { sentence: "He ___ a car.", options: ["have", "has", "is"], correct: "has" }
        ]
      };
      
      for (const [key, exs] of Object.entries(exercises)) {
        if (topic.includes(key)) return exs;
      }
      return exercises.default;
    };
    
    const additionalExamples = getAdditionalExamples();
    const practiceExercises = getPracticeExercises();
    
    const handlePracticeAnswer = (index, answer) => {
      setGrammarPracticeAnswers(prev => ({ ...prev, [index]: answer }));
    };
    
    const submitPractice = () => {
      let score = 0;
      practiceExercises.forEach((ex, idx) => {
        if (grammarPracticeAnswers[idx] === ex.correct) score++;
      });
      setGrammarPracticeScore(score);
      setGrammarPracticeSubmitted(true);
    };
    
    const resetPractice = () => {
      setGrammarPracticeAnswers({});
      setGrammarPracticeSubmitted(false);
      setGrammarPracticeScore(0);
    };
    
    return (
      <div className="space-y-6" id="grammar-section">
        {/* Main Grammar Card */}
        <Card className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Languages className="w-5 h-5 text-purple-600" />
            {selectedLesson.grammar.title}
          </h3>
          
          {/* Rule Explanation */}
          <div className="bg-purple-50 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-purple-900 mb-2">{t('grammarRule') || 'Grammar Rule'}</h4>
                <p className="text-gray-700">{selectedLesson.grammar.explanation}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
              <p className="font-medium text-gray-600 text-sm mb-1">{t('example') || 'Example'}:</p>
              <p className="text-purple-700 text-lg font-medium">&ldquo;{selectedLesson.grammar.example}&rdquo;</p>
            </div>
          </div>
          
          {/* More Examples Section */}
          <div className="bg-blue-50 rounded-xl p-5 mb-6">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('moreExamples') || 'More Examples'}
            </h4>
            <div className="grid gap-3">
              {additionalExamples.slice(0, 4).map((ex, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-green-700 font-medium">{ex.correct}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-500 text-sm line-through">{ex.wrong}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Common Mistake */}
          <div className="bg-red-50 rounded-xl p-5">
            <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t('commonMistake') || 'Common Mistake'}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 line-through">{selectedLesson.common_mistake.wrong}</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">{selectedLesson.common_mistake.correct}</p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Grammar Practice Card */}
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-indigo-600" />
            {t('grammarPractice') || 'Grammar Practice'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {t('fillInBlanks') || 'Fill in the blanks with the correct word:'}
          </p>
          
          <div className="space-y-4">
            {practiceExercises.map((exercise, idx) => (
              <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-colors ${
                grammarPracticeSubmitted
                  ? grammarPracticeAnswers[idx] === exercise.correct
                    ? 'border-green-400 bg-green-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-transparent'
              }`}>
                <p className="font-medium text-gray-800 mb-3">
                  {idx + 1}. {exercise.sentence}
                </p>
                <div className="flex flex-wrap gap-2">
                  {exercise.options.map((option) => (
                    <Button
                      key={option}
                      variant={grammarPracticeAnswers[idx] === option ? "default" : "outline"}
                      size="sm"
                      onClick={() => !grammarPracticeSubmitted && handlePracticeAnswer(idx, option)}
                      disabled={grammarPracticeSubmitted}
                      className={`${
                        grammarPracticeSubmitted && option === exercise.correct
                          ? 'bg-green-500 hover:bg-green-500 text-white border-green-500'
                          : grammarPracticeSubmitted && grammarPracticeAnswers[idx] === option && option !== exercise.correct
                            ? 'bg-red-500 hover:bg-red-500 text-white border-red-500'
                            : grammarPracticeAnswers[idx] === option
                              ? 'bg-indigo-600 text-white'
                              : ''
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                {grammarPracticeSubmitted && grammarPracticeAnswers[idx] !== exercise.correct && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {t('correctAnswer') || 'Correct answer'}: <span className="font-bold">{exercise.correct}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          
          {/* Submit/Results */}
          <div className="mt-6">
            {!grammarPracticeSubmitted ? (
              <Button 
                onClick={submitPractice}
                disabled={Object.keys(grammarPracticeAnswers).length < practiceExercises.length}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('checkAnswers') || 'Check Answers'}
              </Button>
            ) : (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full mb-4 ${
                  grammarPracticeScore === practiceExercises.length
                    ? 'bg-green-100 text-green-700'
                    : grammarPracticeScore >= practiceExercises.length / 2
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {grammarPracticeScore} / {practiceExercises.length} {t('correct') || 'correct'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  {grammarPracticeScore === practiceExercises.length
                    ? (t('perfectScore') || '🎉 Perfect! You mastered this grammar!')
                    : grammarPracticeScore >= practiceExercises.length / 2
                      ? (t('goodJob') || '👍 Good job! Review the mistakes above.')
                      : (t('keepPracticing') || '📚 Keep practicing! Review the examples above.')}
                </p>
                <Button onClick={resetPractice} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('tryAgain') || 'Try Again'}
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('vocabulary') || 'Vocabulary'}
          </Button>
          <Button onClick={() => setCurrentSection('listening')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            {t('next') || 'Next'}: {t('listening') || 'Listening'} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
}
