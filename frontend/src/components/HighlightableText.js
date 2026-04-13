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
  highlightsEnabled = true,
  showParagraphLabels = false
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

  // Render text with highlights and optional paragraph labels
  const renderHighlightedText = () => {
    // If showParagraphLabels is enabled, split by paragraphs and add labels
    if (showParagraphLabels) {
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
      
      return paragraphs.map((paragraph, idx) => {
        const paragraphLabel = String.fromCharCode(65 + idx); // A, B, C, ...
        const paragraphText = paragraph.trim();
        
        // Calculate the start index of this paragraph in the original text
        let startIndex = 0;
        for (let i = 0; i < idx; i++) {
          const prevParagraph = paragraphs[i];
          startIndex = text.indexOf(prevParagraph, startIndex) + prevParagraph.length;
          // Skip past the newlines
          while (startIndex < text.length && (text[startIndex] === '\n' || text[startIndex] === ' ')) {
            startIndex++;
          }
        }
        
        // Find highlights that belong to this paragraph
        const paragraphHighlights = highlights.filter(h => {
          const actualStart = text.indexOf(paragraphText, startIndex - 10);
          const actualEnd = actualStart + paragraphText.length;
          return h.start_index >= actualStart && h.end_index <= actualEnd;
        });
        
        // Render paragraph with highlights
        let content;
        if (paragraphHighlights.length === 0) {
          content = paragraphText;
        } else {
          // Apply highlights to this paragraph
          const sortedHighlights = [...paragraphHighlights].sort((a, b) => a.start_index - b.start_index);
          const elements = [];
          let lastIdx = 0;
          const actualParagraphStart = text.indexOf(paragraphText, startIndex - 10);
          
          sortedHighlights.forEach((highlight, hIdx) => {
            const relativeStart = highlight.start_index - actualParagraphStart;
            const relativeEnd = highlight.end_index - actualParagraphStart;
            
            if (relativeStart > lastIdx) {
              elements.push(
                <span key={`p${idx}-text-${hIdx}`}>
                  {paragraphText.substring(lastIdx, relativeStart)}
                </span>
              );
            }
            
            const colorClass = HIGHLIGHT_COLORS.find(c => c.name === highlight.color)?.color || 'bg-yellow-200';
            elements.push(
              <span
                key={`p${idx}-highlight-${hIdx}`}
                className={`${colorClass} rounded px-0.5 cursor-pointer`}
                onClick={() => removeHighlight(highlight.id)}
                title="Click to remove highlight"
              >
                {paragraphText.substring(relativeStart, relativeEnd)}
              </span>
            );
            
            lastIdx = relativeEnd;
          });
          
          if (lastIdx < paragraphText.length) {
            elements.push(
              <span key={`p${idx}-text-end`}>{paragraphText.substring(lastIdx)}</span>
            );
          }
          
          content = elements;
        }
        
        return (
          <div key={`paragraph-${idx}`} className="mb-4">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mr-2 align-top mt-0.5">
              {paragraphLabel}
            </span>
            <span className="inline">{content}</span>
          </div>
        );
      });
    }
    
    // Default rendering - Split by paragraphs for better readability
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    // If no highlights, render paragraphs with spacing
    if (highlights.length === 0) {
      return (
        <>
          {paragraphs.map((para, idx) => (
            <p key={`para-${idx}`} className="mb-6 leading-relaxed">
              {para.trim()}
            </p>
          ))}
        </>
      );
    }

    // With highlights - render with paragraph breaks
    const elements = [];
    let globalOffset = 0;
    
    paragraphs.forEach((para, paraIdx) => {
      const paraStart = globalOffset;
      const paraEnd = paraStart + para.length;
      const paraHighlights = highlights.filter(h => 
        h.start_index < paraEnd && h.end_index > paraStart
      );
      
      if (paraHighlights.length === 0) {
        // No highlights in this paragraph
        elements.push(
          <p key={`para-${paraIdx}`} className="mb-6 leading-relaxed">
            {para.trim()}
          </p>
        );
      } else {
        // Has highlights - render with highlight spans
        const paraElements = [];
        let lastIdx = 0;
        
        paraHighlights.forEach((highlight, hIdx) => {
          const relStart = Math.max(0, highlight.start_index - paraStart);
          const relEnd = Math.min(para.length, highlight.end_index - paraStart);
          
          // Text before highlight
          if (relStart > lastIdx) {
            paraElements.push(
              <span key={`p${paraIdx}-t${hIdx}`}>
                {para.substring(lastIdx, relStart)}
              </span>
            );
          }
          
          // Highlighted text
          const colorClass = HIGHLIGHT_COLORS.find(c => c.name === highlight.color)?.color || 'bg-yellow-200';
          paraElements.push(
            <span
              key={`p${paraIdx}-h${hIdx}`}
              className={`${colorClass} rounded px-0.5 cursor-pointer`}
              onClick={() => removeHighlight(highlight.id)}
              title="Click to remove highlight"
            >
              {para.substring(relStart, relEnd)}
            </span>
          );
          
          lastIdx = relEnd;
        });
        
        // Remaining text
        if (lastIdx < para.length) {
          paraElements.push(
            <span key={`p${paraIdx}-end`}>
              {para.substring(lastIdx)}
            </span>
          );
        }
        
        elements.push(
          <p key={`para-${paraIdx}`} className="mb-6 leading-relaxed">
            {paraElements}
          </p>
        );
      }
      
      globalOffset = paraEnd + 2; // +2 for \n\n
    });

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
