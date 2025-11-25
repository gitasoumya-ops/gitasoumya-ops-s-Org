
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="py-6 px-4 md:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                One Click Image Ready
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Your AI-powered creative partner</p>
        </header>
    );
};
