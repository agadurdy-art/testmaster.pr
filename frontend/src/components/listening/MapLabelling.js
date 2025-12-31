import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * IELTS Map Labelling Component
 * 
 * Displays saved PNG map images from Visual Generator
 * Shows questions for users to match letters (A-H) to locations
 */

export default function MapLabelling({ 
  visual, 
  questions, 
  answers, 
  onAnswerChange, 
  questionStartNum = 1,
  testId = null 
}) {
  const [mapImageUrl, setMapImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load saved PNG from backend via API
    const loadMapImage = async () => {
      setLoading(true);
      
      // Check if there's a saved PNG for this test
      if (testId) {
        const possibleNames = [
          `academic_${testId}_campus`,
          `general_${testId}_campus`,
          `${testId}_map`,
          `campus_map_${testId}`
        ];
        
        for (const name of possibleNames) {
          try {
            const url = `${API_URL}/api/visuals/image/${name}`;
            const res = await fetch(url);
            if (res.ok && res.headers.get('content-type')?.includes('image')) {
              setMapImageUrl(url);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Continue to next name
          }
        }
      }
      
      // Fallback: check for generic campus map (Set C)
      try {
        const url = `${API_URL}/api/visuals/image/academic_set_c_campus`;
        const res = await fetch(url);
        if (res.ok && res.headers.get('content-type')?.includes('image')) {
          setMapImageUrl(url);
        }
      } catch (e) {
        console.log('No saved map image found');
      }
      
      setLoading(false);
    };

    loadMapImage();
  }, [testId]);

  // Filter only map labelling questions
  const mapQuestions = questions?.filter(q => q.type === 'map_labelling') || [];
  
  // Get letter range from questions or default
  const getLetterRange = () => {
    const letters = mapQuestions.map(q => q.answer).filter(a => /^[A-Z]$/.test(a));
    if (letters.length === 0) return ['A', 'H'];
    const sorted = [...new Set(letters)].sort();
    return [sorted[0], sorted[sorted.length - 1]];
  };
  
  const [startLetter, endLetter] = getLetterRange();

  if (!visual && !mapImageUrl && !loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        No map visual available for this section.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Visual */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-slate-200">
        {/* Instructions */}
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <p className="text-amber-800 font-medium">
            Label the map below. Write the correct letter, <strong>{startLetter}-{endLetter}</strong>, next to Questions {questionStartNum}-{questionStartNum + mapQuestions.length - 1}.
          </p>
        </div>
        
        {/* Map Image */}
        <div className="p-4 flex justify-center">
          {loading ? (
            <div className="h-96 flex items-center justify-center text-slate-400">
              Loading map...
            </div>
          ) : mapImageUrl ? (
            <img 
              src={mapImageUrl} 
              alt={visual?.title || "Map"} 
              className="max-w-full h-auto border border-slate-300 rounded-lg shadow-sm"
              style={{ maxHeight: '500px' }}
            />
          ) : (
            // Fallback to SVG rendering if no PNG
            <FallbackMapRenderer visual={visual} />
          )}
        </div>
      </div>
      
      {/* Questions Section */}
      {mapQuestions.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm">
          <div className="p-4 bg-slate-50 border-b">
            <h4 className="font-bold text-slate-900">
              Questions {questionStartNum}-{questionStartNum + mapQuestions.length - 1}
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              Write the correct letter ({startLetter}-{endLetter}) for each building.
            </p>
          </div>
          
          {/* Quick letter reference */}
          <div className="p-3 border-b bg-slate-50 flex flex-wrap gap-2 justify-center">
            {Array.from({ length: endLetter.charCodeAt(0) - startLetter.charCodeAt(0) + 1 }, (_, i) => 
              String.fromCharCode(startLetter.charCodeAt(0) + i)
            ).map(letter => (
              <span
                key={letter}
                className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-300 rounded-full font-bold text-slate-700 text-sm"
              >
                {letter}
              </span>
            ))}
          </div>
          
          <div className="p-4 space-y-3">
            {mapQuestions.map((q, idx) => {
              const qNum = questionStartNum + idx;
              // Clean up question text
              let questionText = q.question
                .replace(/^Write the correct letter[:\s]*/i, '')
                .replace(/^[A-Z]-[A-Z][:\s]*/i, '')
                .trim();
              
              return (
                <div key={q.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <span className="font-bold text-slate-700 w-8 text-lg">{qNum}</span>
                  <span className="flex-1 text-slate-800">{questionText}</span>
                  <input
                    type="text"
                    value={answers?.[q.id] || ''}
                    onChange={(e) => onAnswerChange?.(q.id, e.target.value.toUpperCase())}
                    maxLength={1}
                    className="w-14 h-12 text-center text-xl font-bold border-2 border-blue-400 rounded-lg uppercase 
                             focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none
                             bg-blue-50"
                    placeholder=""
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Fallback SVG Map Renderer (when no PNG available)
 */
function FallbackMapRenderer({ visual }) {
  if (!visual) return null;
  
  return (
    <div className="relative bg-amber-50 border-2 border-slate-400 rounded-lg p-4" style={{ minHeight: '400px', minWidth: '600px' }}>
      {/* Title */}
      <h3 className="text-center font-bold text-lg mb-4">{visual.title}</h3>
      
      {/* Compass */}
      <div className="absolute top-4 right-4 flex flex-col items-center text-xs font-bold text-slate-600">
        <span>N</span>
        <div className="w-6 h-6 flex items-center justify-center">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-slate-800"></div>
        </div>
        <span className="text-slate-400">S</span>
      </div>
      
      {/* Simple element rendering */}
      <div className="relative w-full h-80">
        {visual.elements?.map((element, idx) => {
          const x = (element.position?.x || 50);
          const y = (element.position?.y || 50);
          
          return (
            <div
              key={element.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {element.given ? (
                <div className="px-2 py-1 bg-slate-100 border border-slate-400 rounded text-xs font-medium">
                  {element.label}
                </div>
              ) : (
                <div className="w-10 h-10 bg-amber-100 border-2 border-amber-500 rounded flex items-center justify-center">
                  <span className="font-bold text-amber-700">{element.id}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Key */}
      <div className="absolute bottom-4 right-4 bg-white border border-slate-300 rounded p-2 text-xs">
        <div className="font-bold mb-1">Key</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-amber-100 border border-amber-500"></div>
          <span>Building to label</span>
        </div>
      </div>
    </div>
  );
}
