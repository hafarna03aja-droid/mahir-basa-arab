import React, { useState, useCallback } from 'react';
import { generateVocabulary, textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import type { VocabularyItem } from '../types';
import SpeakerIcon from './icons/SpeakerIcon';
import SoundWaveIcon from './icons/SoundWaveIcon';
import { useLanguage } from '../contexts/LanguageContext';

const topics = [
  'Sapaan', 'Keluarga', 'Makanan', 'Perjalanan', 'Pekerjaan', 'Angka', 'Warna', 'Hari dan Waktu', 'Di Pasar', 
  'Kesehatan', 'Pakaian', 'Alam', 'Hobi', 'Di Sekolah', 'Transportasi', 'Perasaan', 'Teknologi', 'Olahraga', 
  'Profesi', 'Hewan', 'Di Restoran', 'Arah'
];
let audioContext: AudioContext | null = null;

const VocabularyBuilder: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const { translations } = useLanguage();

  const fetchVocabulary = useCallback(async (topic: string) => {
    if (!topic) return;
    setIsLoading(true);
    setError('');
    setVocabulary([]);
    try {
      const items = await generateVocabulary(topic);
      setVocabulary(items);
    } catch (err) {
      setError(translations.vocab.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [translations.vocab.error]);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const topic = e.target.value;
    setSelectedTopic(topic);
    fetchVocabulary(topic);
  };

  const playAudio = async (text: string, index: number) => {
    if (playingIndex !== null) return;
    setPlayingIndex(index);
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await textToSpeech(text);
      if (base64Audio && audioContext) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        source.onended = () => setPlayingIndex(null);
      } else {
        setPlayingIndex(null);
      }
    } catch (err) {
      console.error("Error playing audio", err);
      setPlayingIndex(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-sky-400">{translations.vocab.title}</h2>
      <div className="mb-6">
        <select
          value={selectedTopic}
          onChange={handleTopicChange}
          className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="">{translations.vocab.selectTopic}</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
      </div>

      {isLoading && <div className="text-center">{translations.vocab.loading}</div>}
      {error && <div className="text-center text-red-400">{error}</div>}
      
      {!isLoading && vocabulary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabulary.map((item, index) => (
            <div key={index} className="bg-slate-700/50 border border-slate-700 p-4 rounded-lg shadow-lg flex flex-col justify-between transition-all duration-300 hover:shadow-sky-500/20 hover:border-sky-500/50">
              <div>
                <p className="text-2xl font-arabic text-right text-teal-300">{item.arabic}</p>
                <p className="text-slate-400 text-right">{item.transliteration}</p>
                <p className="text-slate-200 mt-2 font-semibold">{item.indonesian}</p>
              </div>
              <button
                onClick={() => playAudio(item.arabic, index)}
                disabled={playingIndex !== null && playingIndex !== index}
                className="mt-4 self-start bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 data-[playing=true]:bg-teal-500 text-white p-2 rounded-full transition-colors duration-200"
                aria-label={`Dengarkan ${item.arabic}`}
                data-playing={playingIndex === index}
              >
                {playingIndex === index ? <SoundWaveIcon /> : <SpeakerIcon />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VocabularyBuilder;