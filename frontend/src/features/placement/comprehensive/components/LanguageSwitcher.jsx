import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../../../../lib/i18n';

// Language Switcher Component
const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();
  
  return (
    <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full shadow-sm px-2 py-1 text-xs">
      <Globe className="w-3 h-3 text-gray-400" />
      <button
        onClick={() => setLanguage('en')}
        className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
          language === 'en' 
            ? 'bg-violet-600 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('vi')}
        className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
          language === 'vi' 
            ? 'bg-violet-600 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        VI
      </button>
      <button
        onClick={() => setLanguage('tr')}
        className={`px-1.5 py-0.5 rounded-full font-medium transition-colors ${
          language === 'tr' 
            ? 'bg-violet-600 text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        TR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
