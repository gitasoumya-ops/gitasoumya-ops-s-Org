import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageGeneratorForm } from './components/ImageGeneratorForm';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage } from './services/geminiService';
import type { AspectRatio, ImageStyle } from './types';

const LOCAL_STORAGE_PROMPT_KEY = 'one-click-image-ready-prompt';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>(() => {
        try {
            return localStorage.getItem(LOCAL_STORAGE_PROMPT_KEY) || '';
        } catch (error) {
            console.error("Could not read prompt from localStorage", error);
            return '';
        }
    });
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [imageStyle, setImageStyle] = useState<ImageStyle>('Cinematic');
    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [negativePrompt, setNegativePrompt] = useState<string>('');
    const [seed, setSeed] = useState<number | null>(null);

    useEffect(() => {
        const timerId = setTimeout(() => {
            try {
                localStorage.setItem(LOCAL_STORAGE_PROMPT_KEY, prompt);
            } catch (error) {
                console.error("Could not save prompt to localStorage", error);
            }
        }, 500); // Wait 500ms after user stops typing to save

        return () => {
            clearTimeout(timerId);
        };
    }, [prompt]);

    const handleGenerate = useCallback(async () => {
        if (!prompt && !referenceImage) {
            setError('Please provide a prompt or a reference image.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateImage(
                prompt, 
                aspectRatio, 
                imageStyle, 
                referenceImage,
                negativePrompt,
                seed
            );
            setGeneratedImage(imageUrl);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio, imageStyle, referenceImage, negativePrompt, seed]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <Header />
            <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3">
                    <ImageGeneratorForm
                        prompt={prompt}
                        setPrompt={setPrompt}
                        aspectRatio={aspectRatio}
                        setAspectRatio={setAspectRatio}
                        imageStyle={imageStyle}
                        setImageStyle={setImageStyle}
                        referenceImage={referenceImage}
                        setReferenceImage={setReferenceImage}
                        isLoading={isLoading}
                        onGenerate={handleGenerate}
                        negativePrompt={negativePrompt}
                        setNegativePrompt={setNegativePrompt}
                        seed={seed}
                        setSeed={setSeed}
                    />
                </div>
                <div className="lg:col-span-8 xl:col-span-9">
                    <ImageDisplay
                        generatedImage={generatedImage}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;