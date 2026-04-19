import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ContentAdmin() {
  const [testType, setTestType] = useState('reading');
  const [testTitle, setTestTitle] = useState('');
  const [passageText, setPassageText] = useState('');
  const [questionsText, setQuestionsText] = useState('');
  const [answersText, setAnswersText] = useState('');

  const handleImport = async () => {
    try {
      // Parse the pasted content
      let passages = [];
      let questions = [];
      let answerKey = [];

      if (testType === 'reading') {
        // Try to parse passages
        if (passageText) {
          passages = [{ id: 1, title: 'Passage 1', text: passageText }];
        }
      }

      // Parse questions (expect one per line with format: "1. Question text")
      const questionLines = questionsText.split('\n').filter(line => line.trim());
      questions = questionLines.map((line, idx) => {
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          return {
            id: parseInt(match[1]),
            passage: Math.ceil(parseInt(match[1]) / 13), // Assuming ~13 questions per passage
            type: 'sentence_completion',
            question: match[2]
          };
        }
        return null;
      }).filter(Boolean);

      // Parse answers (expect format: "1. answer")
      const answerLines = answersText.split('\n').filter(line => line.trim());
      answerKey = answerLines.map(line => {
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match) {
          return {
            question_id: parseInt(match[1]),
            answer: match[2]
          };
        }
        return null;
      }).filter(Boolean);

      const testData = {
        title: testTitle || `${testType} Test`,
        test_type: testType,
        duration: testType === 'reading' ? 60 : testType === 'listening' ? 40 : testType === 'writing' ? 60 : 15,
        passages: passages.length > 0 ? passages : undefined,
        questions,
        answer_key: answerKey
      };

      // Save to database
      const response = await axios.post(`${API_URL}/api/tests`, testData);
      
      toast.success('Test content imported successfully!');
      
      // Clear form
      setPassageText('');
      setQuestionsText('');
      setAnswersText('');
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import content: ' + (error.response?.data?.detail || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Content Import Tool</h1>
            <p className="text-gray-600">
              Paste your Cambridge IELTS 19 test content here to import it into the platform
            </p>
          </div>

          <Tabs value={testType} onValueChange={setTestType} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reading">Reading</TabsTrigger>
              <TabsTrigger value="listening">Listening</TabsTrigger>
              <TabsTrigger value="writing">Writing</TabsTrigger>
              <TabsTrigger value="speaking">Speaking</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Test Title</label>
              <Input
                placeholder="e.g., Cambridge IELTS 19 - Test 1 - Reading"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>

            {testType === 'reading' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Passage Text (Copy from your book)
                </label>
                <Textarea
                  placeholder="Paste the full passage text here..."
                  value={passageText}
                  onChange={(e) => setPassageText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Repeat this process for each of the 3 passages
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Questions (One per line)
              </label>
              <Textarea
                placeholder={`Format: Number. Question text
Example:
1. The first bicycles had no pedals.
2. What year was the velocipede invented?
3. Modern bicycles are made from _______`}
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Answer Key (One per line)
              </label>
              <Textarea
                placeholder={`Format: Number. Answer
Example:
1. True
2. C
3. carbon fiber`}
                value={answersText}
                onChange={(e) => setAnswersText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <Button 
              onClick={handleImport}
              className="w-full primary-gradient text-white text-lg py-6"
              disabled={!testTitle || !questionsText}
            >
              Import Test Content
            </Button>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Guide:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Select test type (Reading, Listening, Writing, or Speaking)</li>
              <li>Enter a test title</li>
              <li>For Reading: Paste passage text from your Cambridge IELTS book</li>
              <li>Copy and paste questions - one per line with number</li>
              <li>Copy and paste answers - one per line with number</li>
              <li>Click "Import Test Content"</li>
              <li>Test will be immediately available to students</li>
            </ol>
            
            <div className="mt-4 p-4 bg-white rounded border border-blue-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">Note:</p>
              <p className="text-sm text-gray-700">
                This tool helps you manually input your licensed Cambridge IELTS content. 
                The platform cannot automatically extract copyrighted material, but once you 
                add it here, all features (AI evaluation, timing, scoring) will work perfectly.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
