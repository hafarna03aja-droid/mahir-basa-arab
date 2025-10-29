import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import VocabularyBuilder from './components/VocabularyBuilder';
import GrammarHelper from './components/GrammarHelper';
import AudioTranslator from './components/AudioTranslator';
import TranslationPractice from './components/TranslationPractice';
import AICompanion from './components/AICompanion';
import type { TabKey } from './types';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('audio');
  const { translations } = useLanguage();

  const renderContent = () => {
    switch (activeTab) {
      case 'vocab':
        return <VocabularyBuilder />;
      case 'grammar':
        return <GrammarHelper />;
      case 'audio':
        return <AudioTranslator />;
      case 'practice':
        return <TranslationPractice />;
      case 'ai':
        return <AICompanion />;
      default:
        return <AudioTranslator />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8 flex-grow">
          {renderContent()}
        </div>
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>{translations.footerText}</p>
      </footer>
    </div>
  );
};

export default App;