import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { language, setLanguage, translations } = useLanguage();

  return (
    <header className="bg-slate-800 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-sky-500">
              {translations.headerTitle}
            </h1>
            <p className="text-slate-400 mt-1">{translations.headerSubtitle}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setLanguage('id')}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                language === 'id' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${
                language === 'en' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;