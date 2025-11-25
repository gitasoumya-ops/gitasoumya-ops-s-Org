import React, { useState, useRef, useEffect } from 'react';
import type { AspectRatio, ImageStyle } from '../types';
import { MicIcon } from './icons/MicIcon';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

// Fix: Add types for the browser-specific SpeechRecognition API to the global window object.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ImageGeneratorFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    imageStyle: ImageStyle;
    setImageStyle: (style: ImageStyle) => void;
    referenceImage: string | null;
    setReferenceImage: (image: string | null) => void;
    isLoading: boolean;
    onGenerate: () => void;
    negativePrompt: string;
    setNegativePrompt: (prompt: string) => void;
    seed: number | null;
    setSeed: (seed: number | null) => void;
}

const aspectRatios: AspectRatio[] = ["16:9", "9:16", "1:1"];
const imageStyles: ImageStyle[] = ["Cinematic", "3D Style", "Animation", "None"];
const styleDescriptions: Record<ImageStyle, string> = {
    "Cinematic": "Creates dramatic, movie-like images with high contrast and emotional lighting.",
    "3D Style": "Generates images with a computer-generated, three-dimensional look.",
    "Animation": "Produces images in a cartoon or animated illustration style.",
    "None": "Generates the image based purely on your prompt without a specific style.",
};
const PROMPT_MAX_LENGTH = 1000;


export const ImageGeneratorForm: React.FC<ImageGeneratorFormProps> = ({
    prompt, setPrompt, aspectRatio, setAspectRatio, imageStyle, setImageStyle,
    referenceImage, setReferenceImage, isLoading, onGenerate,
    negativePrompt, setNegativePrompt, seed, setSeed
}) => {
    const [isListening, setIsListening] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.length <= PROMPT_MAX_LENGTH) {
                    setPrompt(transcript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    alert('Microphone access denied. Please enable it in your browser settings.');
                } else {
                    alert(`An error occurred during speech recognition: ${event.error}`);
                }
            };
            
            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [setPrompt]);


    const handleMicClick = () => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            try {
                recognition.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error starting speech recognition:", err);
                setIsListening(false);
            }
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    
    const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 space-y-6 shadow-lg h-full flex flex-col">
            <div>
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => {
                            if (e.target.value.length <= PROMPT_MAX_LENGTH) {
                                setPrompt(e.target.value)
                            }
                        }}
                        placeholder="Describe your image..."
                        className="w-full h-32 p-4 pr-24 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                    />
                    <div className="absolute top-3 right-3 flex items-center space-x-1">
                        {prompt.length > 0 && (
                            <button
                                onClick={() => setPrompt('')}
                                className="p-2 rounded-full text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                aria-label="Clear prompt"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={handleMicClick}
                            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/80 text-white animate-pulse' : 'bg-gray-700 hover:bg-purple-600'}`}
                            aria-label="Use microphone"
                        >
                            <MicIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div className="flex justify-end items-center space-x-4 text-xs text-gray-400 mt-1 pr-1">
                    <span>Words: {wordCount}</span>
                    <span>{prompt.length} / {PROMPT_MAX_LENGTH}</span>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Style</label>
                <div className="grid grid-cols-2 gap-2">
                    {imageStyles.map(style => (
                        <div key={style} className="relative group">
                            <button 
                                onClick={() => setImageStyle(style)} 
                                className={`w-full px-4 py-2 text-sm rounded-lg transition-all ${imageStyle === style ? 'bg-purple-600 text-white font-semibold shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {style}
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-1.5 text-xs font-medium text-white bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {styleDescriptions[style]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Aspect Ratio</label>
                <div className="flex items-center space-x-2">
                    {aspectRatios.map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex-1 py-2 text-sm rounded-lg transition-all ${aspectRatio === ratio ? 'bg-purple-600 text-white font-semibold shadow-md' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <button 
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="w-full flex justify-between items-center py-2 text-sm font-medium text-gray-300"
                    aria-expanded={isAdvancedOpen}
                >
                    <span>Advanced Options</span>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </button>
                {isAdvancedOpen && (
                    <div className="space-y-4 pt-4 mt-2 border-t border-gray-700">
                        <div>
                            <label htmlFor="negative-prompt" className="text-xs font-medium text-gray-400 mb-1 block">Negative Prompt</label>
                            <textarea
                                id="negative-prompt"
                                value={negativePrompt}
                                onChange={(e) => setNegativePrompt(e.target.value)}
                                placeholder="e.g., blurry, text, watermark"
                                className="w-full h-20 p-2 bg-gray-900/50 border border-gray-600 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="seed" className="text-xs font-medium text-gray-400 mb-1 block">Seed</label>
                            <input
                                id="seed"
                                type="number"
                                min="1"
                                value={seed === null ? '' : seed}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSeed(val === '' ? null : parseInt(val, 10));
                                }}
                                placeholder="Random"
                                className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-lg text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <label htmlFor="num-images" className="text-xs font-medium text-gray-400 mb-1 block">Number of Images</label>
                            <input
                                id="num-images"
                                type="number"
                                value="1"
                                disabled
                                className="w-full p-2 bg-gray-900/80 border border-gray-600 rounded-lg text-sm disabled:opacity-50 cursor-not-allowed"
                            />
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] px-3 py-1.5 text-xs font-medium text-white bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                The current model supports generating one image at a time.
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-grow flex flex-col">
                <div className="relative flex-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                    />
                    <button
                        onClick={handleUploadClick}
                        className={`w-full h-full border-2 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-purple-500 transition-all p-2 ${
                            referenceImage ? 'border-solid border-purple-600 bg-gray-900/30' : 'border-dashed border-gray-600'
                        }`}
                    >
                        {referenceImage ? (
                            <div className="text-center">
                                <img src={referenceImage} alt="Reference" className="max-h-24 object-contain rounded-md" />
                                <div className="mt-2 flex items-center justify-center text-green-400">
                                    <CheckIcon className="w-5 h-5 mr-1.5" />
                                    <span className="text-sm font-medium">Image Ready</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <UploadIcon className="w-8 h-8 mb-2" />
                                <span className="text-sm">Upload Reference Image</span>
                            </>
                        )}
                    </button>
                </div>
                {referenceImage && (
                    <button
                        onClick={() => setReferenceImage(null)}
                        className="mt-2 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-red-600 transition-colors"
                        aria-label="Remove reference image"
                    >
                        Remove Image
                    </button>
                )}
            </div>

            <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105"
            >
                {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
        </div>
    );
};