import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Highlighter, Palette, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: 'bg-yellow-200', textColor: 'text-gray-900' },
  { name: 'Green', color: 'bg-green-200', textColor: 'text-gray-900' },
  { name: 'Blue', color: 'bg-blue-200', textColor: 'text-gray-900' },
  { name: 'Pink', color: 'bg-pink-200', textColor: 'text-gray-900' },
  { name: 'Orange', color: 'bg-orange-200', textColor: 'text-gray-900' },
];

export default function HighlightableText({ 
  text, 
  user, 
  testId, 
  testType,
  highlightsEnabled = true 
}) {
  const [highlights, setHighlights] = useState([]);
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState(null);

  useEffect(() => {
    const loadHighlights = async () => {
      if (!user?.id || !testId) return;
      try {
        const res = await fetch(`${API_URL}/api/highlights/${user.id}/${testId}`);
        if (res.ok) {
          const data = await res.json();
          setHighlights(data);
        }
      } catch (e) {
        console.error('Failed to load highlights');
      }
    };

    if (user?.id && testId && highlightsEnabled) {
      loadHighlights();
    }
  }, [user?.id, testId, highlightsEnabled]);

  const saveHighlight = async (start, end, color) => {
    try {
      const res = await fetch(`${API_URL}/api/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          test_id: testId,
          test_type: testType,
          start_index: start,
          end_index: end,
          color: color.name,
          highlighted_text: text.substring(start, end),
          timestamp: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        const savedHighlight = await res.json();
        setHighlights([...highlights, savedHighlight]);
        toast.success('Highlight saved!');
      }
    } catch (e) {
      toast.error('Failed to save highlight');
    }
  };

  const removeHighlight = async (highlightId) => {
    try {
      const res = await fetch(`${API_URL}/api/highlights/${highlightId}`, { method: 'DELETE' });
      if (res.ok) {
        setHighlights(highlights.filter(h => h.id !== highlightId));
        toast.success('Highlight removed');
      }
    } catch (e) {
      toast.error('Failed to remove highlight');
    }
  };

  const handleTextSelection = useCallback(() => {
    if (!highlightsEnabled) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionInfo(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      setSelectionInfo(null);
      return;
    }

    // Get the selection range relative to the text content
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Find the start index in the original text
    const start = text.indexOf(selectedText);
    if (start === -1) {
      setSelectionInfo(null);
      return;
    }
    
    const end = start + selectedText.length;

    // Get position for the floating button
    const rect = range.getBoundingClientRect();
    
    setSelectionInfo({
      start,
      end,
      text: selectedText,
      position: {
        top: rect.top - 40,
        left: rect.left + rect.width / 2
      }
    });
  }, [text, highlightsEnabled]);

  const handleHighlight = () => {
    if (selectionInfo) {
      saveHighlight(selectionInfo.start, selectionInfo.end, selectedColor);
      setSelectionInfo(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  // Render text with highlights
  const renderHighlightedText = () => {
    if (highlights.length === 0) {
      return <span>{text}</span>;
    }

    // Sort highlights by start index
    const sortedHighlights = [...highlights].sort((a, b) => a.start_index - b.start_index);
    
    const elements = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, idx) => {
      // Add text before highlight
      if (highlight.start_index > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {text.substring(lastIndex, highlight.start_index)}
          </span>
        );
      }

      // Add highlighted text
      const colorClass = HIGHLIGHT_COLORS.find(c => c.name === highlight.color)?.color || 'bg-yellow-200';
      elements.push(
        <span
          key={`highlight-${idx}`}
          className={`${colorClass} rounded px-0.5 cursor-pointer group relative`}
          onClick={() => removeHighlight(highlight.id)}
          title="Click to remove highlight"
        >
          {text.substring(highlight.start_index, highlight.end_index)}
        </span>
      );

      lastIndex = highlight.end_index;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="relative">
      {/* Highlighter Controls */}
      {highlightsEnabled && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Highlighter className="w-4 h-4" />
            <span>Highlighter:</span>
          </div>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-7 px-2"
            >
              <div className={`w-4 h-4 rounded ${selectedColor.color} mr-1`}></div>
              <Palette className="w-3 h-3" />
            </Button>
            
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border z-10 flex gap-1">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded ${color.color} hover:ring-2 ring-gray-400 ${
                      selectedColor.name === color.name ? 'ring-2 ring-gray-600' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            )}
          </div>
          
          <span className="text-xs text-gray-400">
            Select text to highlight • Click highlight to remove
          </span>
        </div>
      )}

      {/* Text Content */}
      <div
        className="leading-relaxed text-gray-700 select-text"
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
      >
        {renderHighlightedText()}
      </div>

      {/* Floating Highlight Button */}
      {selectionInfo && (
        <div
          className="fixed z-50 animate-in fade-in"
          style={{
            top: `${selectionInfo.position.top}px`,
            left: `${selectionInfo.position.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <Button
            size="sm"
            onClick={handleHighlight}
            className={`${selectedColor.color} ${selectedColor.textColor} shadow-lg border-0 h-8 px-3`}
          >
            <Highlighter className="w-3 h-3 mr-1" />
            Highlight
          </Button>
        </div>
      )}
    </div>
  );
}
