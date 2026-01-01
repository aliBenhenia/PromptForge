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
  
  'refactor-code': (code) => `
You are a senior software engineer specializing in code quality and maintainability. Refactor the following code to improve its structure, readability, and efficiency. Provide your response in plain text only (no Markdown, no code blocks). Include:

1. Issues Identified: List key problems with the original code.
2. Refactored Code: The improved version in plain text.
3. Improvements Made: Explanation of changes and their benefits.

Original Code:
${code}
  `,
  
  'generate-docs': (code) => `
You are a technical documentation specialist. Create comprehensive documentation for the following code in plain text only (no Markdown, no code blocks). Include:

1. Function/Class Overview: Brief description of purpose and functionality.
2. Parameters: List and describe each input parameter.
3. Return Value: Description of what the function returns.
4. Usage Examples: At least two practical examples.
5. Exceptions: Any errors that might be thrown.

Code to Document:
${code}
  `,
  
  'code-review': (code) => `
You are a principal engineer conducting a code review. Analyze the following code for best practices, potential issues, and improvement opportunities. Provide your feedback in plain text only (no Markdown, no code blocks). Structure your response as:

1. Summary: Overall assessment of code quality.
2. Strengths: Positive aspects of the implementation.
3. Issues: Specific problems or concerns with line references.
4. Recommendations: Actionable suggestions for improvement.
5. Best Practices: Relevant coding standards or patterns.

Code for Review:
${code}
  `,
  
  'generate-unit-tests': (code) => `
You are a QA engineer specializing in unit testing. Create comprehensive unit tests for the following function in plain text only (no Markdown, no code blocks). Include:

1. Test Strategy: Approach for testing this function.
2. Test Cases: At least 5 test cases covering normal, edge, and error conditions.
3. Expected Outcomes: What each test should produce.
4. Test Implementation: Plain text representation of test code.

Function to Test:
${code}
  `,
  
  'optimize-performance': (code) => `
You are a performance optimization expert. Analyze the following code for efficiency issues and provide optimizations. Respond in plain text only (no Markdown, no code blocks). Include:

1. Performance Issues: Identified bottlenecks or inefficiencies.
2. Optimized Code: Improved version with explanations.
3. Complexity Analysis: Time/space complexity before and after.
4. Benchmark Suggestions: How to measure improvements.

Code to Optimize:
${code}
  `,
  
  'convert-language': (request) => `
You are a polyglot programming expert. Convert the following code from one programming language to another as requested. Provide your response in plain text only (no Markdown, no code blocks). Include:

1. Source Analysis: Key patterns in the original language.
2. Target Implementation: Converted code in the new language.
3. Language Differences: Notable syntactic or semantic changes.
4. Considerations: Potential issues or adaptations needed.

Conversion Request:
${request}
  `,
  
  'design-patterns': (prompt) => `
You are a software architect specializing in design patterns. Implement the requested design pattern in the specified programming language. Provide your response in plain text only (no Markdown, no code blocks). Include:

1. Pattern Overview: Explanation of the design pattern's purpose.
2. Implementation: Code example following the pattern.
3. Use Cases: When and why to use this pattern.
4. Benefits: Advantages of this approach.

Request:
${prompt}
  `,
  
  'security-audit': (code) => `
You are a cybersecurity expert specializing in application security. Conduct a security audit of the following code. Provide your findings in plain text only (no Markdown, no code blocks). Structure as:

1. Security Risks: Identified vulnerabilities with severity ratings.
2. Exploitation Scenarios: How each vulnerability could be exploited.
3. Remediation: Specific fixes for each issue.
4. Best Practices: Security principles to follow.

Code to Audit:
${code}
  `,
  
  'database-query': (prompt) => `
You are a database expert and SQL optimizer. Create or optimize the database query as requested. Provide your response in plain text only (no Markdown, no code blocks). Include:

1. Query Purpose: What data is being retrieved or manipulated.
2. SQL Query: The final query in plain text.
3. Explanation: How the query works and its components.
4. Optimization Notes: Performance considerations or improvements.
5. Usage Examples: How to execute or integrate the query.

Request:
${prompt}
  `
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
        model: 'deepseek/deepseek-r1-0528:free',
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