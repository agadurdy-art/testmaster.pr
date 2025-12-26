import React, { useState, useCallback } from 'react';
import { GripVertical, Maximize2, Minimize2, Highlighter, X, Eraser } from 'lucide-react';

/**
 * Side-by-Side Reader Component
 * Displays passage on left, questions on right with adjustable ratio
 * Includes text highlighter feature
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
  const [highlights, setHighlights] = useState([]);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightColor, setHighlightColor] = useState('yellow');

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

  const highlightColors = [
    { name: 'yellow', bg: 'bg-yellow-200', hover: 'hover:bg-yellow-300' },
    { name: 'green', bg: 'bg-green-200', hover: 'hover:bg-green-300' },
    { name: 'blue', bg: 'bg-blue-200', hover: 'hover:bg-blue-300' },
    { name: 'pink', bg: 'bg-pink-200', hover: 'hover:bg-pink-300' },
  ];

  // Handle text selection for highlighting
  const handleTextSelection = useCallback(() => {
    if (!highlightMode) return;
    
    const selection = window.getSelection();
    const selectedText = selection?.toString()?.trim();
    
    if (selectedText && selectedText.length > 0) {
      // Check if already highlighted
      const alreadyHighlighted = highlights.some(h => h.text === selectedText);
      if (!alreadyHighlighted) {
        setHighlights(prev => [...prev, { text: selectedText, color: highlightColor }]);
      }
      selection.removeAllRanges();
    }
  }, [highlightMode, highlightColor, highlights]);

  // Remove a specific highlight
  const removeHighlight = (textToRemove) => {
    setHighlights(prev => prev.filter(h => h.text !== textToRemove));
  };

  // Clear all highlights
  const clearAllHighlights = () => {
    setHighlights([]);
  };

  // Render passage with all highlights
  const renderPassageWithHighlights = () => {
    if (!passage) return null;
    
    let result = passage;
    const allHighlights = [...highlights];
    
    // Add external highlight if provided
    if (highlightedText && !allHighlights.some(h => h.text === highlightedText)) {
      allHighlights.push({ text: highlightedText, color: 'yellow' });
    }
    
    if (allHighlights.length === 0) {
      return <span>{passage}</span>;
    }
    
    // Sort by length (longest first) to handle overlapping
    const sortedHighlights = allHighlights.sort((a, b) => b.text.length - a.text.length);
    
    // Create a map of positions
    let segments = [{ text: passage, highlighted: false, color: null }];
    
    sortedHighlights.forEach(({ text, color }) => {
      const newSegments = [];
      segments.forEach(segment => {
        if (segment.highlighted) {
          newSegments.push(segment);
          return;
        }
        
        const parts = segment.text.split(text);
        parts.forEach((part, i) => {
          if (part) {
            newSegments.push({ text: part, highlighted: false, color: null });
          }
          if (i < parts.length - 1) {
            newSegments.push({ text, highlighted: true, color });
          }
        });
      });
      segments = newSegments;
    });
    
    const colorMap = {
      yellow: 'bg-yellow-200',
      green: 'bg-green-200',
      blue: 'bg-blue-200',
      pink: 'bg-pink-200',
    };
    
    return segments.map((segment, i) => (
      segment.highlighted ? (
        <mark 
          key={i} 
          className={`${colorMap[segment.color] || 'bg-yellow-200'} px-0.5 rounded cursor-pointer`}
          onClick={() => highlightMode && removeHighlight(segment.text)}
          title={highlightMode ? 'Click to remove highlight' : ''}
        >
          {segment.text}
        </mark>
      ) : (
        <span key={i}>{segment.text}</span>
      )
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
