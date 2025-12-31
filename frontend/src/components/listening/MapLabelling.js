import React from 'react';

/**
 * IELTS Map Labelling Component
 * Renders interactive maps for listening questions
 * 
 * Visual shows letters (A, B, C...) on the map
 * Some locations are pre-labeled (given), others are marked with letters only
 * Questions ask user to match descriptions to letters
 */

// Icon components for different map elements
const TreeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M12 2L8 8h2v4H8l4 6 4-6h-2V8h2L12 2zM8 20v2h8v-2H8z" />
  </svg>
);

const BuildingIcon = ({ shape }) => {
  if (shape === 'tower') {
    return (
      <div className="w-8 h-12 bg-slate-300 border-2 border-slate-500 flex items-center justify-center">
        <div className="w-1 h-full bg-slate-400"></div>
      </div>
    );
  }
  if (shape === 'dome') {
    return (
      <div className="relative">
        <div className="w-10 h-5 bg-slate-300 border-2 border-slate-500 rounded-t-full"></div>
        <div className="w-10 h-4 bg-slate-200 border-2 border-t-0 border-slate-500"></div>
      </div>
    );
  }
  return (
    <div className="w-10 h-8 bg-slate-200 border-2 border-slate-500"></div>
  );
};

// Compass component
const Compass = () => (
  <div className="absolute top-2 right-2 flex flex-col items-center text-xs font-bold text-slate-600">
    <span>N</span>
    <div className="flex items-center gap-1">
      <span>W</span>
      <div className="w-6 h-6 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-slate-800"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center mt-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-slate-400"></div>
        </div>
      </div>
      <span>E</span>
    </div>
    <span>S</span>
  </div>
);

// Single floor map renderer
const FloorMap = ({ floor, title }) => {
  const elements = floor?.elements || [];
  
  return (
    <div className="relative bg-amber-50 border-2 border-slate-400 rounded-lg p-4" style={{ minHeight: '300px' }}>
      {/* Floor title */}
      {floor?.level && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-white border border-slate-300 rounded text-sm font-medium">
          {floor.level}
        </div>
      )}
      
      {/* Compass */}
      <Compass />
      
      {/* Map elements */}
      <div className="relative w-full h-64">
        {elements.map((element, idx) => {
          const x = element.position?.x || 50;
          const y = element.position?.y || 50;
          
          return (
            <div
              key={element.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Element visual */}
              {element.type === 'area' && (
                <div className="px-3 py-1 bg-green-100 border border-green-400 rounded text-xs">
                  {element.given ? element.label : ''}
                </div>
              )}
              {element.type === 'entrance' && (
                <div className="px-2 py-1 bg-blue-100 border-2 border-blue-400 rounded text-xs font-medium">
                  {element.label}
                </div>
              )}
              {element.type === 'feature' && (
                <div className="w-8 h-8 bg-blue-200 border-2 border-blue-400 rounded-full flex items-center justify-center text-xs">
                  {element.label?.charAt(0)}
                </div>
              )}
              {(element.type === 'building' || element.type === 'shop' || element.type === 'department_store' || element.type === 'desk' || element.type === 'cafe') && (
                <div className={`px-3 py-2 rounded border-2 ${element.given ? 'bg-slate-100 border-slate-400' : 'bg-amber-100 border-amber-500'}`}>
                  {element.given ? (
                    <span className="text-xs font-medium">{element.label}</span>
                  ) : (
                    <span className="text-lg font-bold text-amber-700">{element.id}</span>
                  )}
                </div>
              )}
              {element.type === 'gate' && (
                <div className="px-2 py-1 bg-gray-200 border-2 border-gray-500 rounded text-xs">
                  {element.label}
                </div>
              )}
              {element.type === 'path' && (
                <div className="text-xs text-slate-500 italic">{element.label}</div>
              )}
              {element.type === 'escalator' && (
                <div className="px-2 py-1 bg-purple-100 border border-purple-400 rounded text-xs">
                  ↗ {element.label}
                </div>
              )}
              {element.type === 'lift' && (
                <div className="px-2 py-1 bg-purple-100 border border-purple-400 rounded text-xs">
                  ⬆ {element.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Campus/Estate style map (like Farley House)
const EstateMap = ({ visual }) => {
  const elements = visual?.elements || [];
  
  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg p-4 relative" style={{ minHeight: '350px' }}>
      {/* Title */}
      <h4 className="text-center font-bold text-lg mb-4">{visual?.title}</h4>
      
      {/* Compass */}
      <Compass />
      
      {/* Map container */}
      <div className="relative w-full h-72 bg-amber-50 border border-slate-300 rounded">
        {/* Draw paths as dotted lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {visual?.paths?.map((path, idx) => (
            <path
              key={idx}
              d={path.d}
              fill="none"
              stroke="#666"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}
        </svg>
        
        {/* Elements */}
        {elements.map((element, idx) => {
          const x = element.position?.x || 50;
          const y = element.position?.y || 50;
          
          return (
            <div
              key={element.id || idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Trees */}
              {element.type === 'trees' && (
                <div className="flex gap-1 text-green-600">
                  <TreeIcon /><TreeIcon /><TreeIcon />
                </div>
              )}
              
              {/* Lake */}
              {element.type === 'lake' && (
                <div 
                  className="bg-blue-200 border border-blue-400 rounded-full flex items-center justify-center"
                  style={{ width: element.size?.width || 60, height: element.size?.height || 40 }}
                >
                  <span className="text-xs text-blue-700">{element.label}</span>
                </div>
              )}
              
              {/* Building */}
              {element.type === 'building' && (
                <div className={`px-3 py-2 border-2 ${element.given ? 'bg-slate-100 border-slate-500' : 'bg-white border-slate-400'}`}>
                  {element.given ? (
                    <span className="text-sm font-medium">{element.label}</span>
                  ) : (
                    <span className="text-xl font-bold text-slate-700 px-2">{element.id}</span>
                  )}
                </div>
              )}
              
              {/* Labeled area */}
              {element.type === 'area' && (
                <div className={`px-3 py-1 ${element.given ? 'bg-slate-100 border border-slate-400' : 'bg-amber-100 border-2 border-amber-500'} rounded`}>
                  {element.given ? (
                    <span className="text-sm">{element.label}</span>
                  ) : (
                    <span className="text-xl font-bold text-amber-700">{element.id}</span>
                  )}
                </div>
              )}
              
              {/* Letter marker (for unlabeled locations) */}
              {element.type === 'marker' && (
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 bg-amber-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-700">{element.id}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Map Labelling Component
export default function MapLabelling({ visual, questions, answers, onAnswerChange, questionStartNum = 1 }) {
  if (!visual) return null;
  
  const isMultiFloor = visual.type === 'floor_plan' && visual.floors;
  const isCombined = visual.type === 'combined';
  
  // Get all available letter options from the visual
  const getLetterOptions = () => {
    let letters = [];
    if (isMultiFloor) {
      visual.floors.forEach(floor => {
        floor.elements?.forEach(el => {
          if (!el.given && el.id.match(/^[A-Z]$/)) {
            letters.push(el.id);
          }
        });
      });
    } else if (isCombined) {
      visual.elements?.forEach(el => {
        if (el.type === 'map' && el.elements) {
          el.elements.forEach(mapEl => {
            if (!mapEl.given && mapEl.id.match(/^[A-Z]$/)) {
              letters.push(mapEl.id);
            }
          });
        }
      });
    } else {
      visual.elements?.forEach(el => {
        if (!el.given && el.id.match(/^[A-Z]$/)) {
          letters.push(el.id);
        }
      });
    }
    return [...new Set(letters)].sort();
  };
  
  const letterOptions = getLetterOptions();
  
  // Filter only map labelling questions
  const mapQuestions = questions?.filter(q => q.type === 'map_labelling') || [];
  
  return (
    <div className="space-y-6">
      {/* Map Visual */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Instructions */}
        <div className="p-4 bg-amber-50 border-b border-amber-200">
          <p className="text-amber-800 font-medium">
            Label the map below. Write the correct letter, <strong>A-{letterOptions[letterOptions.length - 1] || 'H'}</strong>, next to Questions {questionStartNum}-{questionStartNum + mapQuestions.length - 1}.
          </p>
        </div>
        
        {/* Title */}
        <div className="p-4 text-center border-b">
          <h3 className="text-xl font-bold text-slate-900">{visual.title}</h3>
          {visual.description && (
            <p className="text-sm text-slate-600 mt-1">{visual.description}</p>
          )}
        </div>
        
        {/* Map */}
        <div className="p-4">
          {isMultiFloor ? (
            <div className="space-y-4">
              {visual.floors.map((floor, idx) => (
                <FloorMap key={idx} floor={floor} />
              ))}
            </div>
          ) : isCombined ? (
            <div className="space-y-4">
              {visual.elements?.map((el, idx) => {
                if (el.type === 'table') {
                  return (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <h4 className="bg-slate-100 px-4 py-2 font-semibold">{el.title}</h4>
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50">
                            {el.headers?.map((h, i) => (
                              <th key={i} className="px-4 py-2 text-left border-b">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {el.rows?.map((row, i) => (
                            <tr key={i} className="border-b last:border-0">
                              {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (el.type === 'map') {
                  return <FloorMap key={idx} floor={el} title={el.title} />;
                }
                return null;
              })}
            </div>
          ) : (
            <EstateMap visual={visual} />
          )}
        </div>
      </div>
      
      {/* Questions Section */}
      {mapQuestions.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm">
          <div className="p-4 bg-slate-50 border-b">
            <h4 className="font-bold text-slate-900">Questions {questionStartNum}-{questionStartNum + mapQuestions.length - 1}</h4>
          </div>
          <div className="p-4 space-y-3">
            {mapQuestions.map((q, idx) => {
              const qNum = questionStartNum + idx;
              // Parse question text - remove "Write the correct letter:" prefix if present
              let questionText = q.question.replace(/^Write the correct letter[:\s]*/i, '').replace(/^[A-Z]-[A-Z][:\s]*/i, '').trim();
              
              return (
                <div key={q.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="font-bold text-slate-700 w-8">{qNum}</span>
                  <span className="flex-1 text-slate-800">{questionText}</span>
                  <input
                    type="text"
                    value={answers?.[q.id] || ''}
                    onChange={(e) => onAnswerChange?.(q.id, e.target.value.toUpperCase())}
                    maxLength={1}
                    className="w-12 h-10 text-center text-lg font-bold border-2 border-blue-400 rounded uppercase focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
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
