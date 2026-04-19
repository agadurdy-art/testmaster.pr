import React from 'react';
import { useI18n, LANGUAGES } from '../lib/i18n';
import { Button } from './ui/button';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useI18n();

  if (compact) {
    return (
      <div className="flex items-center space-x-1 text-xs">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded-full border text-xs font-medium ${
            language === 'en'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={`px-2 py-1 rounded-full border text-xs font-medium ${
            language === 'vi'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          VI
        </button>
        <button
          type="button"
          onClick={() => setLanguage('tr')}
          className={`px-2 py-1 rounded-full border text-xs font-medium ${
            language === 'tr'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          TR
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-gray-500">Lang</span>
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        className="text-xs px-2 py-1 h-7"
        onClick={() => setLanguage('en')}
      >
        {LANGUAGES.en}
      </Button>
      <Button
        variant={language === 'vi' ? 'default' : 'outline'}
        size="sm"
        className="text-xs px-2 py-1 h-7"
        onClick={() => setLanguage('vi')}
      >
        {LANGUAGES.vi}
      </Button>
      <Button
        variant={language === 'tr' ? 'default' : 'outline'}
        size="sm"
        className="text-xs px-2 py-1 h-7"
        onClick={() => setLanguage('tr')}
      >
        {LANGUAGES.tr}
      </Button>
    </div>
  );
}
