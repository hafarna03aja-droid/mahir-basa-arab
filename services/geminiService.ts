import { GoogleGenAI, Type, Modality, LiveCallbacks, Blob } from "@google/genai";
import { encode } from '../utils/audioUtils';
import type { VocabularyItem, TranslationAndAnswer } from "../types";

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateVocabulary = async (topic: string): Promise<VocabularyItem[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buatkan daftar 10 kosakata bahasa Arab terkait topik "${topic}" untuk pemula. Sertakan transliterasi dan arti dalam bahasa Indonesia.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              arabic: { type: Type.STRING },
              transliteration: { type: Type.STRING },
              indonesian: { type: Type.STRING },
            },
            required: ["arabic", "transliteration", "indonesian"],
          },
        },
      },
    });
    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as VocabularyItem[];
  } catch (error) {
    console.error("Error saat membuat kosakata:", error);
    return [];
  }
};


export const generateGrammarExplanation = async (topic: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Jelaskan konsep tata bahasa Arab "${topic}" secara sederhana dan mudah dimengerti untuk pemula. Gunakan contoh jika perlu. Format jawaban dalam Markdown, gunakan heading, bold, dan list jika relevan.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error saat membuat penjelasan tata bahasa:", error);
        return "Gagal memuat penjelasan. Silakan coba lagi.";
    }
};

export const translateText = async (text: string, from: string, to: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Terjemahkan teks berikut dari ${from} ke ${to}: "${text}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Error saat menerjemahkan teks:", error);
        return "Terjemahan gagal.";
    }
};


export const textToSpeech = async (text: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A good voice for Arabic
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error dengan Text-to-Speech:", error);
        return null;
    }
};

export const createLiveSession = async (callbacks: LiveCallbacks): Promise<any> => {
    return await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction: 'You are a helpful AI assistant that transcribes Indonesian audio to text. Listen to the user and provide an accurate transcription.',
        },
    });
};

export const createArabicLiveSession = async (callbacks: LiveCallbacks): Promise<any> => {
    return await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            systemInstruction: 'You are a helpful AI assistant that transcribes Arabic audio to text. Listen to the user and provide an accurate transcription.',
        },
    });
};

export const translateAndAnswer = async (indonesianQuestion: string): Promise<TranslationAndAnswer> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Terjemahkan pertanyaan berikut dari Bahasa Indonesia ke Bahasa Arab, lalu jawab pertanyaan tersebut dalam Bahasa Arab. Kembalikan hasilnya dalam format JSON dengan kunci "translation" untuk terjemahan pertanyaan, dan "answer" untuk jawabannya. Pertanyaan: "${indonesianQuestion}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translation: {
                            type: Type.STRING,
                            description: "Terjemahan dari pertanyaan asli ke dalam Bahasa Arab."
                        },
                        answer: {
                            type: Type.STRING,
                            description: "Jawaban untuk pertanyaan yang sudah diterjemahkan, dalam Bahasa Arab."
                        },
                    },
                    required: ["translation", "answer"],
                },
            },
        });
        const parsedResponse = JSON.parse(response.text);
        return parsedResponse as TranslationAndAnswer;
    } catch (error) {
        console.error("Error saat menerjemahkan dan menjawab:", error);
        return {
            translation: "Terjemahan gagal.",
            answer: "عذراً، لا يمكنني الإجابة في الوقت الحالي."
        };
    }
};

export const getAIResponseInArabic = async (arabicQuestion: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `Jawab pertanyaan berikut dalam Bahasa Arab. Jawaban harus dalam Bahasa Arab saja, tanpa terjemahan atau penjelasan dalam bahasa lain. Pertanyaan: "${arabicQuestion}"`,
        });
        return response.text;
    } catch (error) {
        console.error("Error saat mendapatkan jawaban AI dalam Bahasa Arab:", error);
        return "عذراً، لا يمكنني الإجابة في الوقت الحالي.";
    }
};


export const createPcmBlob = (inputData: Float32Array): Blob => {
    const l = inputData.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
};