import { useState, useEffect } from 'react';

// Highlighting & Notes state + handlers, moved verbatim from
// pages/FullTestInterface.js during the fulltest feature split.
export default function useHighlightsNotes(currentSection) {
  // Highlighting & Notes state
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, text: '', range: null });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({ text: '', note: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);

  // ============ HIGHLIGHTING & NOTES HANDLERS ============
  const handleTextSelection = (e) => {
    // Only show context menu on right-click
    if (e.type === 'contextmenu') {
      e.preventDefault();
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        setContextMenu({
          show: true,
          x: e.clientX,
          y: e.clientY,
          text: selectedText,
          range: selection.getRangeAt(0).cloneRange()
        });
      }
    }
  };

  const handleHighlight = () => {
    if (contextMenu.text) {
      const newHighlight = {
        id: Date.now(),
        text: contextMenu.text,
        section: currentSection,
        createdAt: new Date().toISOString()
      };
      setHighlights(prev => [...prev, newHighlight]);
      setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
    }
  };

  const handleAddNote = () => {
    if (contextMenu.text) {
      setCurrentNote({ text: contextMenu.text, note: '' });
      setShowNoteModal(true);
      setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
    }
  };

  const saveNote = () => {
    if (currentNote.text && currentNote.note) {
      if (editingNoteId) {
        setNotes(prev => prev.map(n =>
          n.id === editingNoteId ? { ...n, note: currentNote.note } : n
        ));
      } else {
        const newNote = {
          id: Date.now(),
          text: currentNote.text,
          note: currentNote.note,
          section: currentSection,
          createdAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
        // Also add to highlights
        setHighlights(prev => [...prev, { id: newNote.id, text: currentNote.text, section: currentSection, hasNote: true }]);
      }
      setShowNoteModal(false);
      setCurrentNote({ text: '', note: '' });
      setEditingNoteId(null);
    }
  };

  const removeHighlight = (id) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, text: '', range: null });
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Function to render text with highlights
  const renderTextWithHighlights = (text, sectionType) => {
    if (!text) return text;

    const sectionHighlights = highlights.filter(h => h.section === sectionType);
    if (sectionHighlights.length === 0) return text;

    let result = text;
    sectionHighlights.forEach(highlight => {
      const hasNote = notes.some(n => n.id === highlight.id);
      const highlightClass = hasNote
        ? 'bg-blue-200 cursor-pointer border-b-2 border-blue-400'
        : 'bg-yellow-200 cursor-pointer';

      result = result.replace(
        new RegExp(highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<mark class="${highlightClass}" data-highlight-id="${highlight.id}">${highlight.text}</mark>`
      );
    });

    return result;
  };

  return {
    highlights,
    setHighlights,
    notes,
    setNotes,
    contextMenu,
    showNoteModal,
    setShowNoteModal,
    currentNote,
    setCurrentNote,
    setEditingNoteId,
    handleTextSelection,
    handleHighlight,
    handleAddNote,
    saveNote,
    removeHighlight,
    renderTextWithHighlights,
  };
}
