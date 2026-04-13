import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { BookOpen, Save, Trash2, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function NotebookPanel({ user, testId, testType, isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (isOpen && user?.id && testId) {
      loadNotes();
    }
  }, [isOpen, testId, user?.id]);

  const loadNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notes/${user.id}/${testId}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (e) {
      console.error('Failed to load notes');
    }
  };

  const saveNote = async () => {
    if (!newNote.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          test_id: testId,
          test_type: testType,
          content: newNote.trim(),
          timestamp: new Date().toISOString()
        })
      });
      
      if (res.ok) {
        const savedNote = await res.json();
        setNotes([...notes, savedNote]);
        setNewNote('');
        toast.success('Note saved!');
      }
    } catch (e) {
      toast.error('Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const res = await fetch(`${API_URL}/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
        toast.success('Note deleted');
      }
    } catch (e) {
      toast.error('Failed to delete note');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-4 top-20 w-80 z-50 animate-in slide-in-from-right">
      <Card className="bg-white border shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-semibold">My Notes</h3>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="p-4">
            {/* New Note Input */}
            <div className="mb-4">
              <Textarea
                placeholder="Write a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[80px] text-sm resize-none border-amber-200 focus:border-amber-400"
              />
              <Button
                onClick={saveNote}
                disabled={loading || !newNote.trim()}
                className="mt-2 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                size="sm"
              >
                <Save className="w-4 h-4 mr-1" />
                {loading ? 'Saving...' : 'Save Note'}
              </Button>
            </div>

            {/* Notes List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No notes yet. Start taking notes!
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-amber-50 rounded-lg border border-amber-100 group"
                  >
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
