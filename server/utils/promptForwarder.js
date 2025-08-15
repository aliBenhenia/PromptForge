// Enhanced AI Prompt Forwarder with Plain-Text Responses
const fetch = require('node-fetch');

// Use a secure environment variable for your API key
const OPENROUTER_API_KEY = process.env.OPENROUTER_KEY;
const SITE_URL = process.env.SITE_URL || 'https://promptforge.dev';
const SITE_NAME = 'PromptForge AI Assistant';

// Centralized, context-rich prompt templates
const toolPrompts = {
  'explain-code': (code) => `
You are an expert software engineer and technical writer. Provide a comprehensive, step-by-step explanation of the following code snippet in plain text only. Do not use Markdown, headings, or code blocks. Cover:

1. Overall Purpose: What problem does it solve?
2. Key Components: Describe each function, variable, and control flow.
3. Behavior: How data moves through the code.
4. Edge Cases & Improvements: Potential pitfalls and suggestions for optimization.

Code:
${code}
  `,

  'fix-bug': (code) => `
You are a seasoned developer and code review expert. Analyze the following JavaScript code in plain text only (no Markdown, no code blocks). Identify any bugs, logical errors, or poor practices, and provide:

1. List of Issues: Numbered list explaining each defect or anti-pattern.
2. Corrected Code: A clean, refactored version with comments.
3. Rationale: Brief explanation of why each change improves the code.

Original Code:
${code}
  `,

  'generate-regex': (prompt) => `
You are a regex architect and educator. Craft a regular expression to satisfy the following requirements in plain text only (no Markdown, no code blocks). Include:

1. Pattern Description: Human-readable summary of what it matches.
2. Regex Pattern: The final expression.
3. Component Breakdown: Explain each part of the pattern.
4. Test Examples: At least three examples that match and three that do not.

Requirement:
${prompt}
  `,
};

// Strip any leftover Markdown characters (safety fallback)
function stripMarkdown(text) {
  return text.replace(/[`*_#]/g, '').replace(/\n{2,}/g, '\n').trim();
}

// Process prompts via OpenRouter API
async function processPrompt(toolId, prompt) {
  if (!OPENROUTER_API_KEY) {
    console.warn('API key not set — using mock response');
    return getMockResponse(toolId, prompt);
  }

  const content = toolPrompts[toolId]?.(prompt);
  if (!content) throw new Error(`Unknown toolId: ${toolId}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          { role: 'system', content: 'You are an expert developer assistant.' },
          { role: 'user', content }
        ]
      })
    });

    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || 'No response content';
    return stripMarkdown(rawText); // Ensure plain text output
  } catch (error) {
    console.error('Error calling AI API:', error);
    return getMockResponse(toolId, prompt);
  }
}

// Mock fallback responses
function getMockResponse(toolId, prompt) {
  return 'Mock response: AI service unavailable. Please provide a valid API key to get real results.';
}

module.exports = { processPrompt };
