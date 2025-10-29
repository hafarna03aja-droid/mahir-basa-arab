import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createLiveSession, createPcmBlob, translateText, textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import type { LiveServerMessage, LiveSession } from "@google/genai";
import MicIcon from './icons/MicIcon';
import StopIcon from './icons/StopIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import PlayIcon from './icons/PlayIcon';
import SoundWaveIcon from './icons/SoundWaveIcon';
import { useLanguage } from '../contexts/LanguageContext';

let audioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;

const AudioTranslator: React.FC = () => {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isTranslating, setIsTranslating] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [transcribedText, setTranscribedText] = useState<string>('');
    const [translatedText, setTranslatedText] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { translations } = useLanguage();
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const currentTranscriptionRef = useRef<string>('');

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
        setTranscribedText(currentTranscriptionRef.current);
        
        if (currentTranscriptionRef.current.trim()) {
            setIsTranslating(true);
            try {
                const translation = await translateText(currentTranscriptionRef.current, 'Indonesia', 'Arab');
                setTranslatedText(translation);
            } catch (e) {
                setError(translations.audio.translationError);
                console.error(e);
            } finally {
                setIsTranslating(false);
            }
        }
    }, [cleanupRecording, translations.audio.translationError]);

    const startRecording = async () => {
        setError('');
        setTranscribedText('');
        setTranslatedText('');
        currentTranscriptionRef.current = '';

        if (isRecording) {
            await stopRecording();
            return;
        }

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            setIsRecording(true);

            const callbacks = {
                onopen: () => console.log('Live session opened'),
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        currentTranscriptionRef.current += text;
                        setTranscribedText(currentTranscriptionRef.current);
                    }
                     
                    if (message.serverContent?.turnComplete) {
                        // The turn is complete, but we wait for user to stop recording
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError(translations.audio.recordingError);
                    stopRecording();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Live session closed');
                },
            };

            sessionPromiseRef.current = createLiveSession(callbacks);

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
            setError(translations.audio.micError);
            console.error('Error starting recording:', err);
            setIsRecording(false);
        }
    };
    
    const playTranslation = async () => {
        if (!translatedText || isPlaying) return;
        setIsPlaying(true);
        try {
            if (!outputAudioContext || outputAudioContext.state === 'closed') {
                outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const base64Audio = await textToSpeech(translatedText);
            if (base64Audio && outputAudioContext) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                const source = outputAudioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputAudioContext.destination);
                source.start();
                source.onended = () => setIsPlaying(false);
            } else {
                setError(translations.audio.playbackError);
                setIsPlaying(false);
            }
        } catch (err) {
            console.error('Error playing audio:', err);
            setError(translations.audio.playbackError);
            setIsPlaying(false);
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
            <h2 className="text-2xl font-bold text-center mb-4 text-sky-400">{translations.audio.title}</h2>
            <p className="text-slate-400 text-center mb-6">{translations.audio.description}</p>

            <button
                onClick={startRecording}
                className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                    isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-sky-600 hover:bg-sky-500'
                } text-white shadow-lg`}
            >
                {isRecording ? <StopIcon /> : <MicIcon />}
                 {isRecording && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>}
            </button>
            <p className="mt-4 text-sm text-slate-400">{isRecording ? translations.audio.statusRecording : translations.audio.statusIdle}</p>

            {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

            <div className="w-full mt-8 space-y-4">
                {(transcribedText || isRecording) && (
                    <div className="bg-slate-700/50 border border-slate-700 p-4 rounded-lg animate-fade-in">
                        <h3 className="text-sm font-semibold mb-2 text-slate-400">{translations.audio.transcriptionLabel}</h3>
                        <p className="text-slate-50 min-h-[2rem]">{transcribedText || translations.audio.listening}</p>
                    </div>
                )}

                {isTranslating && <p className="text-center animate-pulse text-sky-400">{translations.audio.statusTranslating}</p>}

                {translatedText && (
                    <div className="bg-gradient-to-br from-sky-800/50 to-teal-800/40 border border-teal-700 p-4 rounded-lg animate-fade-in">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-semibold mb-2 text-teal-300">{translations.audio.translationLabel}</h3>
                                <p className="text-3xl font-arabic text-right text-white">{translatedText}</p>
                            </div>
                            <button onClick={playTranslation} disabled={isPlaying} className="bg-teal-600 hover:bg-teal-500 disabled:bg-teal-500 text-white p-3 rounded-full transition-colors duration-200 shrink-0 ml-4">
                                {isPlaying ? <SoundWaveIcon /> : <PlayIcon />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioTranslator;