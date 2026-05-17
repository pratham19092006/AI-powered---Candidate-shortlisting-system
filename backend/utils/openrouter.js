const axios = require('axios');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

// Sends a chat request to OpenRouter using the API key from the environment.
const chatWithOpenRouter = async ({ messages, temperature = 0.2, maxTokens = 1200 }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing');
  }

  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model: DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'Candidate Shortlisting System',
      },
      timeout: 60000,
    }
  );

  return response.data;
};

// OpenRouter often returns JSON inside markdown fences, so this helper extracts it safely.
const extractJsonFromText = (text = '') => {
  const cleaned = String(text).trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const startIndex = cleaned.indexOf('{');
    const endIndex = cleaned.lastIndexOf('}');

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return JSON.parse(cleaned.slice(startIndex, endIndex + 1));
    }

    throw new Error('AI response did not contain valid JSON');
  }
};

module.exports = {
  chatWithOpenRouter,
  extractJsonFromText,
};
