import React, { useState } from 'react';
import { translateText } from '../services/geminiService';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import { useLanguage } from '../contexts/LanguageContext';

const TranslationPractice: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [translation, setTranslation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { translations } = useLanguage();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError('');
    setTranslation('');
    setIsCopied(false);
    try {
      const result = await translateText(inputText, 'Indonesia', 'Arab');
      setTranslation(result);
    } catch (err) {
      setError(translations.practice.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (translation) {
      navigator.clipboard.writeText(translation);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-sky-400">{translations.practice.title}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="indonesian-text" className="block mb-2 text-sm font-medium text-slate-300">{translations.practice.label}</label>
          <textarea
            id="indonesian-text"
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-sky-500 focus:border-sky-500 transition"
            placeholder={translations.practice.placeholder}
          ></textarea>
        </div>
        <button
          onClick={handleTranslate}
          disabled={isLoading}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading ? translations.practice.translating : translations.practice.button}
        </button>
        {error && <p className="text-red-400 text-center">{error}</p>}
        {translation && (
          <div className="bg-slate-900/50 border border-slate-700 p-5 rounded-lg mt-4 animate-fade-in">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-teal-300">{translations.practice.result}</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-1 px-3 rounded-lg transition-colors duration-200"
                >
                  {isCopied ? <CheckIcon /> : <CopyIcon />}
                  {isCopied ? translations.practice.copied : translations.practice.copy}
                </button>
             </div>
            <p className="text-2xl font-arabic text-right text-white bg-slate-700/50 p-4 rounded-md">{translation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationPractice;