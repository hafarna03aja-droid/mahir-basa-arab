import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createArabicLiveSession, createPcmBlob, textToSpeech, getAIResponseInArabic } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import type { LiveServerMessage, LiveSession } from "@google/genai";
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import PlayIcon from './icons/PlayIcon';
import SoundWaveIcon from './icons/SoundWaveIcon';
import UserIcon from './icons/UserIcon';
import RobotIcon from './icons/RobotIcon';
import { useLanguage } from '../contexts/LanguageContext';

let audioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;

const AICompanion: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [userQuestion, setUserQuestion] = useState<string>('');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { translations } = useLanguage();

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const currentQuestionRef = useRef<string>('');

    const playResponseAudio = useCallback(async (text: string) => {
        if (!text || isPlaying) return;
        setIsPlaying(true);
        try {
            if (!outputAudioContext || outputAudioContext.state === 'closed') {
                outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const base64Audio = await textToSpeech(text);
            if (base64Audio && outputAudioContext) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                source.start();
                source.onended = () => setIsPlaying(false);
            } else {
                setError(translations.ai.playbackError);
                setIsPlaying(false);
            }
        } catch (err) {
            console.error('Error playing audio:', err);
            setError(translations.ai.playbackError);
            setIsPlaying(false);
        }
    }, [isPlaying, translations.ai.playbackError]);

    const cleanupRecording = useCallback(() => {
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if(mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
         if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if(audioContext && audioContext.state !== 'closed') {
           audioContext.close();
           audioContext = null;
        }
    }, []);

    const stopRecording = useCallback(async () => {
        setIsRecording(false);
        cleanupRecording();
        const finalQuestion = currentQuestionRef.current.trim();
        setUserQuestion(finalQuestion);
        
        if (finalQuestion) {
            setIsProcessing(true);
            setAiResponse('');
            try {
                const answer = await getAIResponseInArabic(finalQuestion);
                setAiResponse(answer);

                if (answer && answer !== "عذراً، لا يمكنني الإجابة في الوقت الحالي.") {
                    await playResponseAudio(answer);
                }

            } catch (e) {
                setError(translations.ai.answerError);
                console.error(e);
            } finally {
                setIsProcessing(false);
            }
        }
    }, [cleanupRecording, playResponseAudio, translations.ai.answerError]);

    const startRecording = async () => {
        setError('');
        setUserQuestion('');
        setAiResponse('');
        currentQuestionRef.current = '';

        if (isRecording) {
            await stopRecording();
            return;
        }

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);

            const callbacks = {
                onopen: () => console.log('Arabic live session opened for AI Companion'),
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentQuestionRef.current += text;
                        setUserQuestion(currentQuestionRef.current);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError(translations.ai.recordingError);
                    stopRecording();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Live session closed');
                },
            };

            sessionPromiseRef.current = createArabicLiveSession(callbacks);

            if (!audioContext || audioContext.state === 'closed') {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            }
            mediaStreamSourceRef.current = audioContext.createMediaStreamSource(streamRef.current);
            scriptProcessorRef.current = audioContext.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                if(sessionPromiseRef.current){
                    sessionPromiseRef.current.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContext.destination);

        } catch (err) {
            setError(translations.ai.micError);
            console.error('Error starting recording:', err);
            setIsRecording(false);
        }
    };

    useEffect(() => {
        return () => {
           cleanupRecording();
           if(outputAudioContext && outputAudioContext.state !== 'closed'){
               outputAudioContext.close();
           }
        };
    }, [cleanupRecording]);

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-800 rounded-xl shadow-2xl flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center mb-4 text-sky-400">{translations.ai.title}</h2>
            <p className="text-slate-400 text-center mb-6">{translations.ai.description}</p>

            <button
                onClick={startRecording}
                className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                    isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-sky-600 hover:bg-sky-500'
                } text-white shadow-lg`}
            >
                {isRecording ? <StopIcon /> : <MicIcon />}
                 {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            </button>
            <p className="mt-4 text-sm text-slate-400">{isRecording ? translations.ai.statusListening : translations.ai.statusIdle}</p>

            {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

            <div className="w-full mt-8 space-y-6">
                {(userQuestion || isRecording) && (
                    <div className="flex justify-end gap-3 animate-fade-in">
                        <div className="bg-sky-600 p-4 rounded-lg rounded-br-none max-w-xs sm:max-w-md">
                            <p className="text-white min-h-[2rem] font-arabic text-right text-xl">{userQuestion || '...'}</p>
                        </div>
                        <div className="bg-slate-600 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                            <UserIcon />
                        </div>
                    </div>
                )}
                
                {isProcessing && <p className="text-center animate-pulse text-sky-400">{translations.ai.statusProcessing}</p>}

                {aiResponse && (
                     <div className="flex justify-start gap-3 animate-fade-in">
                        <div className="bg-slate-600 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                           <RobotIcon />
                        </div>
                       <div className="bg-slate-700 p-4 rounded-lg rounded-bl-none max-w-xs sm:max-w-md">
                           <div className="flex justify-between items-start gap-4">
                               <p className="text-2xl font-arabic text-right text-white">{aiResponse}</p>
                                <button onClick={() => playResponseAudio(aiResponse)} disabled={isPlaying} className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-500 text-white p-3 rounded-full transition-colors duration-200 shrink-0">
                                   {isPlaying ? <SoundWaveIcon /> : <PlayIcon />}
                               </button>
                           </div>
                       </div>
                   </div>
                )}
            </div>
        </div>
    );
};

export default AICompanion;