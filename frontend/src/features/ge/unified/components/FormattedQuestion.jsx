import React from 'react';

// ═══════ FORMATTED QUESTION - Child-friendly with bold/colored keywords ═══════
const FormattedQuestion = ({ text, className = '' }) => {
  if (!text) return null;
  // Highlight quoted words, words in ALL CAPS, words with underscores
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-700">$1</strong>')
    .replace(/"([^"]+)"/g, '<strong class=\'text-indigo-600 bg-indigo-50 px-1 rounded\'>&ldquo;$1&rdquo;</strong>')
    .replace(/'([^']+)'/g, '<strong class=\'text-indigo-600 bg-indigo-50 px-1 rounded\'>&#39;$1&#39;</strong>')
    .replace(/___+/g, '<span class="inline-block align-middle mx-1.5" style="width:80px;height:0;border-bottom:3px solid #2563eb;padding-top:2px"></span>')
    .replace(/\b([A-Z]{2,})\b/g, '<strong class="text-purple-700">$1</strong>');
  return <span className={className} dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export default FormattedQuestion;
