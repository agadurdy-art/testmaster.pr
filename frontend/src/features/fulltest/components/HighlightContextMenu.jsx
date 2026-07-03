import React from 'react';

// Context Menu for Highlighting/Notes
export default function HighlightContextMenu({ contextMenu, handleHighlight, handleAddNote }) {
  return (
    <div
      className="fixed bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <button
        onClick={handleHighlight}
        className="w-full px-4 py-2 text-left text-sm hover:bg-yellow-100 flex items-center gap-2 border-b border-slate-200"
      >
        <span className="w-4 h-4 bg-yellow-300 rounded"></span>
        Highlight
      </button>
      <button
        onClick={handleAddNote}
        className="w-full px-4 py-2 text-left text-sm hover:bg-blue-100 flex items-center gap-2"
      >
        <span className="w-4 h-4 bg-blue-300 rounded"></span>
        Notes
      </button>
    </div>
  );
}
