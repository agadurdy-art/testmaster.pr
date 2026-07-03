import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { API_URL } from '../constants';

// Writing section: task tabs, Task 1 visuals (maps / charts) and the
// response textareas with word counts. Extracted verbatim from
// renderWritingSection in pages/CambridgeTestInterface.js.
export default function WritingSection({
  sectionData,
  currentPart,
  setCurrentPart,
  answers,
  setAnswers,
}) {
    const tasks = sectionData?.tasks || [];
    const currentTask = tasks[currentPart];
    
    if (!currentTask) return null;

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {tasks.map((task, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={currentPart === idx ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Task {task.task_number}
            </Button>
          ))}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-purple-100 text-purple-700 mb-2">{currentTask.title}</Badge>
              <h3 className="font-bold text-lg text-gray-900">{currentTask.task_type === 'report' ? 'Report' : currentTask.type === 'map_comparison' ? 'Map Description' : 'Essay'}</h3>
            </div>
          </div>

          {/* Task 1 - Simple rubric with visuals */}
          {currentTask.task_number === 1 && (
            <>
              {/* Full instruction/prompt from PDF */}
              <div className="mb-4 p-5 border border-gray-800 bg-white">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {currentTask.prompt || currentTask.instruction}
                </p>
              </div>
              
              {/* Two maps/images side by side (for map comparison tasks) */}
              {currentTask.visual_url && currentTask.visual_url_2 && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 text-center">20 years ago</h4>
                    </div>
                    <img 
                      src={currentTask.visual_url}
                      alt="Map - 20 years ago" 
                      className="max-w-full mx-auto p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 text-center">Now</h4>
                    </div>
                    <img 
                      src={currentTask.visual_url_2}
                      alt="Map - Now" 
                      className="max-w-full mx-auto p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}

              {/* Single visual + textarea side by side */}
              {currentTask.visual_url && !currentTask.visual_url_2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-fit sticky top-4">
                    <div className="bg-gray-100 px-3 py-1.5 border-b">
                      <h4 className="text-xs font-semibold text-gray-600 text-center">Visual Reference</h4>
                    </div>
                    <img 
                      src={currentTask.visual_url.startsWith('http') ? currentTask.visual_url : `${API_URL}${currentTask.visual_url}`}
                      alt="Task 1 Visual" 
                      className="w-full h-auto p-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
                    <textarea
                      data-testid="writing-task1-textarea"
                      value={answers[`writing_task${currentTask.task_number}`] || ''}
                      onChange={(e) => setAnswers(prev => ({
                        ...prev,
                        [`writing_task${currentTask.task_number}`]: e.target.value
                      }))}
                      className="w-full h-80 p-4 border rounded-lg resize-vertical focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                      placeholder="Write your response here..."
                    />
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-500">
                        Word count: <span className="font-medium text-gray-700">
                          {(answers[`writing_task${currentTask.task_number}`] || '').split(/\s+/).filter(Boolean).length}
                        </span>
                      </span>
                      <span className="text-gray-500">Target: {currentTask.word_count}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Visual data - Image with improved presentation (only if no visual_url) */}
              {currentTask.visual && !currentTask.visual_url && (
                <div className="mb-4 bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                      {currentTask.visual.title || 'Visual Reference'}
                    </h4>
                  </div>
                  {currentTask.visual.image_url && (
                    <img 
                      src={currentTask.visual.image_url.startsWith('http') ? currentTask.visual.image_url : `${API_URL}${currentTask.visual.image_url}`} 
                      alt="Task 1 Visual" 
                      className="max-w-full mx-auto p-2"
                    />
                  )}
                </div>
              )}
              
              {/* External image URL (for tests with direct URLs) - legacy support */}
              {currentTask.image_url && !currentTask.visual && !currentTask.visual_url && (
                <div className="mb-4 bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h4 className="text-sm font-semibold text-gray-700 text-center">
                      Visual Reference
                    </h4>
                  </div>
                  <img 
                    src={currentTask.image_url} 
                    alt="Task 1 Visual" 
                    className="max-w-full mx-auto p-2"
                    onError={(e) => {
                      console.error('Failed to load image:', currentTask.image_url);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Task 2 - Essay format with separate sections */}
          {currentTask.task_number === 2 && (
            <>
              {/* Instruction */}
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {currentTask.instruction}
              </p>
              
              {/* Essay Prompt - Cambridge Style: thin black border */}
              <div className="mb-4 p-5 border border-gray-800 bg-white">
                <p className="font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
                  {currentTask.prompt}
                </p>
              </div>
              
              {/* Requirements */}
              <p className="text-gray-700 mb-4 whitespace-pre-line">
                {currentTask.requirements}
              </p>
            </>
          )}

          {/* Side by Side Images for Map Comparison (only for Task 2 or tasks without visual_url) */}
          {currentTask.task_number !== 1 && currentTask.visual_data?.type === 'side_by_side_images' && (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTask.visual_data.images.map((img, idx) => (
                  <div key={idx} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-3 py-2 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 text-center">{img.title}</h4>
                    </div>
                    <img 
                      src={`${API_URL}/api/visuals/image/${img.image_url.replace('.png', '')}`}
                      alt={img.title}
                      className="w-full h-auto"
                      onError={(e) => {
                        console.error('Failed to load image:', img.image_url);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Image Visual - legacy (only for Task 2 or tasks without visual_url) */}
          {currentTask.task_number !== 1 && currentTask.visual_data?.type === 'image' && (
            <div className="mb-6">
              <img 
                src={`${API_URL}/api/visuals/image/${currentTask.visual_data.image_url.replace('.png', '')}`}
                alt={currentTask.visual_data.title || 'Visual'}
                className="w-full max-w-3xl mx-auto rounded-lg border shadow-sm"
                onError={(e) => {
                  console.error('Failed to load image:', currentTask.visual_data.image_url);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Generic textarea - skip for Task 1 with single visual (already has inline textarea) */}
          {!(currentTask.task_number === 1 && currentTask.visual_url && !currentTask.visual_url_2) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Response</label>
            <textarea
              data-testid={`writing-task${currentTask.task_number}-textarea`}
              value={answers[`writing_task${currentTask.task_number}`] || ''}
              onChange={(e) => setAnswers(prev => ({
                ...prev,
                [`writing_task${currentTask.task_number}`]: e.target.value
              }))}
              className="w-full h-80 p-4 border rounded-lg resize-vertical focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your response here..."
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-500">
                Word count: <span className="font-medium text-gray-700">
                  {(answers[`writing_task${currentTask.task_number}`] || '').split(/\s+/).filter(Boolean).length}
                </span>
              </span>
              <span className="text-gray-500">Target: {currentTask.word_count}</span>
            </div>
          </div>
          )}
        </Card>
      </div>
    );
}
