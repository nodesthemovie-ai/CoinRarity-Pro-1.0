import { MultiCoinAnalysisResult, SingleCoinData } from '../types';

export const analyzeCoinImage = async (
  base64Image: string,
  reverseBase64Image?: string | null,
  mimeType = 'image/jpeg'
): Promise<MultiCoinAnalysisResult> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      reverseImage: reverseBase64Image || undefined,
      mimeType,
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to analyze coin image';
    try {
      const errJson = await response.json();
      if (errJson.error) errorDetail = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const result = (await response.json()) as MultiCoinAnalysisResult;
  return result;
};

export const generateNarrationAudio = async (text: string, voice = 'Fenrir'): Promise<string> => {
  const response = await fetch('/api/narrate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, voice }),
  });

  if (!response.ok) {
    let errorDetail = 'Audio generation failed';
    try {
      const errJson = await response.json();
      if (errJson.error) errorDetail = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
};

export interface ConsultHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export const consultNumismatist = async (
  question: string,
  coinContext?: SingleCoinData,
  history: ConsultHistoryItem[] = [],
  image?: string | null,
  reverseImage?: string | null
): Promise<string> => {
  const response = await fetch('/api/consult', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      coinContext,
      history,
      image: image || undefined,
      reverseImage: reverseImage || undefined,
    }),
  });

  if (!response.ok) {
    let errorDetail = 'Failed to consult numismatist';
    try {
      const errJson = await response.json();
      if (errJson.error) errorDetail = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  return data.answer || 'No response received from expert.';
};
