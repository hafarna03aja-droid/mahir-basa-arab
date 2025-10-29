import React, { useState, useCallback } from 'react';
import { generateGrammarExplanation } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const topics = [
  'Isim (Kata Benda)',
  'Fi\'il (Kata Kerja)',
  'Harf (Partikel)',
  'Mubtada\' dan Khabar (Subjek dan Predikat)',
  'Jumlah Ismiyyah (Kalimat Nominal)',
  'Jumlah Fi\'liyyah (Kalimat Verbal)',
  'Fi\'il Madhi (Kata Kerja Lampau)',
  'Fi\'il Mudhari\' (Kata Kerja Sekarang/Mendatang)',
  'Fi\'il Amr (Kata Perintah)',
  'Idhafah (Frasa Genitif)',
  'Dhamir (Kata Ganti)',
  'Isim Isyarah (Kata Tunjuk)',
  'Isim Maushul (Kata Sambung)',
  'Mufrad, Mutsanna, Jamak (Tunggal, Ganda, Jamak)',
  'Mudzakkar dan Muannats (Maskulin & Feminin)',
  'Na\'at dan Man\'ut (Sifat dan yang Disifati)',
  'I\'rab (Kasus Tata Bahasa: Rafa\', Nashb, Jar)',
  'Kana wa Akhwatuha (Saudara-saudara Kana)',
  'Inna wa Akhwatuha (Saudara-saudara Inna)',
  'Adawatul Istifham (Kata Tanya)',
  'Huruf Jar (Preposisi)',
];

// Simple Markdown to HTML parser
const parseMarkdown = (text: string) => {
  let html = text;
  
  // Process lists first to wrap them correctly
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/((?:<li>.*?<\/li>\s*)+)/gs, '<ul class="list-disc list-inside space-y-1 mt-2 mb-4">$1</ul>');

  // Process headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-teal-300 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-sky-400 mt-6 mb-3">$1</h2>');
  
  // Process bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-teal-300">$1</strong>');
  
  // Process line breaks
  html = html.replace(/\n/g, '<br />');

  // Cleanup extra breaks around block elements
  html = html.replace(/<br \s*\/?>(\s*<(?:ul|h[2-3]))/gi, '$1');
  html = html.replace(/(<\/(?:ul|h[2-3])>)<br \s*\/?>/gi, '$1');

  return html;
};


const GrammarHelper: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { translations } = useLanguage();

  const fetchExplanation = useCallback(async (topic: string) => {
    if (!topic) return;
    setIsLoading(true);
    setError('');
    setExplanation('');
    try {
      const text = await generateGrammarExplanation(topic);
      setExplanation(text);
    } catch (err) {
      setError(translations.grammar.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [translations.grammar.error]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topic = e.target.value;
    setSelectedTopic(topic);
    fetchExplanation(topic);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-sky-400">{translations.grammar.title}</h2>
      <div className="mb-6">
        <select
          value={selectedTopic}
          onChange={handleTopicChange}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="">{translations.grammar.selectTopic}</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      {isLoading && <div className="text-center">{translations.grammar.loading}</div>}
      {error && <div className="text-center text-red-400">{error}</div>}
      
      {!isLoading && explanation && (
        <div className="bg-slate-700/50 p-5 rounded-lg border border-slate-600 mt-4 animate-fade-in">
          <div className="prose prose-invert max-w-none text-slate-300" 
               dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation) }}>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarHelper;