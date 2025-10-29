import React from 'react';
import type { TabKey } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TabsProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const { translations } = useLanguage();
  
  const tabs: { key: TabKey, label: string }[] = [
    { key: 'audio', label: translations.tabs.audio },
    { key: 'vocab', label: translations.tabs.vocab },
    { key: 'grammar', label: translations.tabs.grammar },
    { key: 'practice', label: translations.tabs.practice },
    { key: 'ai', label: translations.tabs.ai },
  ];

  return (
    <div className="flex justify-center border-b border-slate-700">
      <div className="flex flex-wrap -mb-px space-x-4 sm:space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-block p-4 border-b-2 rounded-t-lg transition-colors duration-200 text-sm sm:text-base ${
              activeTab === tab.key
                ? 'border-sky-400 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;