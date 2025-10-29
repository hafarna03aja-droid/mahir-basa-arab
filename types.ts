export type TabKey = 'audio' | 'vocab' | 'grammar' | 'practice' | 'ai';

export interface VocabularyItem {
  arabic: string;
  transliteration: string;
  indonesian: string;
}

export interface TranslationAndAnswer {
  translation: string;
  answer: string;
}