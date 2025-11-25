
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { AspectRatio, ImageStyle } from '../types';

interface Part {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

const fileToGenerativePart = (base64Data: string) => {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error('Invalid base64 image data');
    }
    const mimeType = match[1];
    const data = match[2];
    return {
        inlineData: {
            mimeType,
            data
        },
    };
};

export const generateImage = async (
    prompt: string,
    aspectRatio: AspectRatio,
    style: ImageStyle,
    referenceImage: string | null
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const fullPrompt = style === 'None' ? prompt : `${style} style, ${prompt}`;

    const parts: Part[] = [];

    if (referenceImage) {
        parts.push(fileToGenerativePart(referenceImage));
    }
    if (fullPrompt) {
        parts.push({ text: fullPrompt });
    }

    if (parts.length === 0) {
        throw new Error("Prompt or reference image must be provided.");
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio,
            },
        },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64EncodeString}`;
            }
        }
    }
    
    throw new Error('No image was generated. The prompt may have been blocked.');
};
