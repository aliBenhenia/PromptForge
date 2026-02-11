// 🚀 Gemini 3 Prompt Forwarder with Plain-Text Responses
const fetch = require('node-fetch');

// Your working Google AI key
const GOOGLE_AI_KEY = 'AIzaSyBeSB-D2Ws-KPK4jIudsK6lc5yz3grrBMw';
// 🔴 FIXED: Use v1alpha instead of v1beta
const API_URL = 'https://generativelanguage.googleapis.com/v1alpha/models/gemini-3-flash-preview:generateContent';

// Your EXACT toolPrompts object - 100% UNCHANGED
const toolPrompts = {
  // ... your entire toolPrompts object (keep exactly as you have it) ...
};

// Strip any leftover Markdown characters
function stripMarkdown(text) {
  return text.replace(/[`*_#]/g, '').replace(/\n{2,}/g, '\n').trim();
}

// Process prompts via Google Gemini 3 Flash API
async function processPrompt(toolId, prompt) {
  if (!GOOGLE_AI_KEY) {
    console.warn('API key not set — using mock response');
    return getMockResponse(toolId, prompt);
  }

  const content = toolPrompts[toolId]?.(prompt);
  if (!content) throw new Error(`Unknown toolId: ${toolId}`);

  try {
    const response = await fetch(`${API_URL}?key=${GOOGLE_AI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: content }]
        }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 2000,
          thinkingConfig: {
            thinkingLevel: "none"  // 🚀 MAXIMUM SPEED
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API failed: ${error.error?.message || response.status}`);
    }
    
    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response content';
    return stripMarkdown(rawText);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getMockResponse(toolId, prompt);
  }
}

// Mock fallback responses
function getMockResponse(toolId, prompt) {
  return 'Mock response: AI service unavailable. Please check your API key or endpoint.';
}

module.exports = { processPrompt };