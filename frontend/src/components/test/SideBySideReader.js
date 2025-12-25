import React, { useState } from 'react';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Side-by-Side Reader Component
 * Displays passage on left, questions on right with adjustable ratio
 * Default: 70% passage / 30% questions
 */
const SideBySideReader = ({
  passage,
  passageTitle = 'Reading Passage',
  children, // Questions content
  defaultRatio = 70, // Default passage width percentage
  onHighlight,
  highlightedText = '',
  className = ''
}) => {
  const [passageRatio, setPassageRatio] = useState(defaultRatio);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newRatio = Math.min(Math.max((x / rect.width) * 100, 30), 80);
    setPassageRatio(newRatio);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const presetRatios = [
    { label: '50-50', value: 50 },
    { label: '60-40', value: 60 },
    { label: '70-30', value: 70 },
    { label: '80-20', value: 80 },
  ];

  // Highlight text in passage
  const renderPassageWithHighlight = () => {
    if (!highlightedText || !passage.includes(highlightedText)) {
      return passage;
    }
    const parts = passage.split(highlightedText);
    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {part}
        {i < parts.length - 1 && (
          <mark className="bg-yellow-200 px-0.5 rounded">{highlightedText}</mark>
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Ratio Control Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Layout:</span>
          {presetRatios.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setPassageRatio(preset.value)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                Math.abs(passageRatio - preset.value) < 3
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Passage {Math.round(passageRatio)}% | Questions {Math.round(100 - passageRatio)}%
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-gray-200 rounded"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-500" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Side by Side Content */}
      <div
        className={`flex ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
        style={{ height: isFullscreen ? '100vh' : '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Passage Panel */}
        <div
          className="overflow-y-auto border-r bg-gray-50 p-6"
          style={{ width: `${passageRatio}%` }}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-4 sticky top-0 bg-gray-50 py-2">
            {passageTitle}
          </h3>
          <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
            {renderPassageWithHighlight()}
          </div>
        </div>

        {/* Resizer Handle */}
        <div
          className={`w-2 bg-gray-200 hover:bg-violet-400 cursor-col-resize flex items-center justify-center transition-colors ${
            isDragging ? 'bg-violet-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Questions Panel */}
        <div
          className="overflow-y-auto p-6 bg-white"
          style={{ width: `${100 - passageRatio}%` }}
        >
          <h3 className="font-bold text-lg text-gray-800 mb-4 sticky top-0 bg-white py-2">
            Questions
          </h3>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SideBySideReader;
