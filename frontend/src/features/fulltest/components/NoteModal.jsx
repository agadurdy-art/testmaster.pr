import React from 'react';

// Note Modal
export default function NoteModal({
  currentNote,
  setCurrentNote,
  saveNote,
  setShowNoteModal,
  setEditingNoteId,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Add Note</span>
          <button
            onClick={() => {
              setShowNoteModal(false);
              setCurrentNote({ text: '', note: '' });
              setEditingNoteId(null);
            }}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Selected Text</label>
            <div className="p-3 bg-yellow-100 rounded border border-yellow-300 text-sm text-slate-700">
              &quot;{currentNote.text}&quot;
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Note</label>
            <textarea
              value={currentNote.note}
              onChange={(e) => setCurrentNote(prev => ({ ...prev, note: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Write your note here..."
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowNoteModal(false);
                setCurrentNote({ text: '', note: '' });
                setEditingNoteId(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={saveNote}
              disabled={!currentNote.note.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
