import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export default function AdminPage() {
  const [testData, setTestData] = useState({
    title: '',
    test_type: 'reading',
    duration: 60,
    passages: '',
    questions: '',
    answer_key: ''
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin: Add IELTS Test Content</h1>
          <p className="text-gray-600 mb-8">
            Use this interface to add your licensed Cambridge IELTS test content to the platform.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Test Title</label>
              <Input 
                placeholder="e.g., Cambridge IELTS 19 - Test 1 - Reading"
                value={testData.title}
                onChange={(e) => setTestData({...testData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Test Type</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={testData.test_type}
                onChange={(e) => setTestData({...testData, test_type: e.target.value})}
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
              <Input 
                type="number"
                value={testData.duration}
                onChange={(e) => setTestData({...testData, duration: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Passages (JSON format for reading tests)
              </label>
              <Textarea 
                placeholder='[{"id": 1, "title": "Passage Title", "text": "Full passage text..."}]'
                className="min-h-[200px] font-mono text-sm"
                value={testData.passages}
                onChange={(e) => setTestData({...testData, passages: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Questions (JSON format)
              </label>
              <Textarea 
                placeholder='[{"id": 1, "passage": 1, "type": "true_false_notgiven", "question": "Question text..."}]'
                className="min-h-[300px] font-mono text-sm"
                value={testData.questions}
                onChange={(e) => setTestData({...testData, questions: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Answer Key (JSON format)
              </label>
              <Textarea 
                placeholder='[{"question_id": 1, "answer": "True"}]'
                className="min-h-[200px] font-mono text-sm"
                value={testData.answer_key}
                onChange={(e) => setTestData({...testData, answer_key: e.target.value})}
              />
            </div>

            <Button 
              className="w-full primary-gradient text-white"
              onClick={() => toast.info('Admin functionality ready - connect to backend API')}
            >
              Save Test
            </Button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Copy content from your licensed Cambridge IELTS materials</li>
              <li>Format as JSON according to the placeholders shown</li>
              <li>The platform supports all IELTS question types</li>
              <li>Tests will be immediately available to students after saving</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
