import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { ErrorIcon } from './icons/ErrorIcon';

interface ImageDisplayProps {
    generatedImage: string | null;
    isLoading: boolean;
    error: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
        <svg className="animate-spin h-16 w-16 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="space-y-2">
             <h3 className="text-xl font-semibold text-white">Crafting your image...</h3>
             <p className="text-gray-400">This can take a moment. Great art needs patience!</p>
        </div>
    </div>
);

const Placeholder: React.FC = () => (
     <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Your creations will appear here</h2>
        <p className="text-gray-400 mt-2">Fill in the details on the left and let the magic happen!</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 mb-4 text-red-500">
            <ErrorIcon />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Image Generation Failed</h2>
        <p className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-300 max-w-md shadow-lg">
            {message}
        </p>
    </div>
);


export const ImageDisplay: React.FC<ImageDisplayProps> = ({ generatedImage, isLoading, error }) => {
    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl aspect-[16/9] flex items-center justify-center p-4 shadow-lg h-full">
            {isLoading && <LoadingSpinner />}
            {error && <ErrorDisplay message={error} />}
            {!isLoading && !error && generatedImage && (
                <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                    <div className="flex-grow w-full relative min-h-0">
                         <img src={generatedImage} alt="Generated" className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <a
                        href={generatedImage}
                        download="one-click-image.png"
                        className="flex-shrink-0 flex items-center justify-center gap-2 py-2 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105"
                        aria-label="Download image"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download Image</span>
                    </a>
                </div>
            )}
            {!isLoading && !error && !generatedImage && <Placeholder />}
        </div>
    );
};