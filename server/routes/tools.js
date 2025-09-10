const express = require('express');
const PromptRequest = require('../models/PromptRequest');
const checkRateLimit = require('../middleware/rateLimiter');
const promptForwarder = require('../utils/promptForwarder');
const router = express.Router();

// Tools data - expanded with more tools
const tools = [
  {
    id: 'explain-code',
    name: 'Explain Code',
    description: 'Get a clear explanation of what your code does',
    icon: 'code',
    placeholderPrompt: 'function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}',
    category: 'Code Analysis'
  },
  {
    id: 'fix-bug',
    name: 'Fix Bug',
    description: 'Identify and fix issues in your code',
    icon: 'bug',
    placeholderPrompt: 'function sortArray(arr) {\n  for(let i = 0; i < arr.length; i++) {\n    for(let j = 0; j < arr.length; j++) {\n      if(arr[i] < arr[j]) {\n        let temp = arr[i];\n        arr[i] = arr[j];\n        arr[j] = temp;\n      }\n    }\n  }\n}',
    category: 'Debugging'
  },
  {
    id: 'generate-regex',
    name: 'Generate Regex',
    description: 'Create regular expressions for your needs',
    icon: 'code-2',
    placeholderPrompt: 'Create a regex to validate email addresses',
    category: 'Code Generation'
  },
  {
    id: 'refactor-code',
    name: 'Refactor Code',
    description: 'Improve code quality and structure',
    icon: 'layers',
    placeholderPrompt: 'Refactor this function to be more readable and efficient:\nfunction processData(data) {\n  let result = [];\n  for (let i=0; i<data.length; i++) {\n    if (data[i].active) {\n      result.push({name: data[i].name, value: data[i].val * 2});\n    }\n  }\n  return result;\n}',
    category: 'Code Optimization'
  },
  {
    id: 'generate-docs',
    name: 'Generate Documentation',
    description: 'Create documentation for your code',
    icon: 'file-text',
    placeholderPrompt: 'Create JSDoc documentation for this function:\nfunction calculateTax(amount, rate) {\n  return amount * (rate / 100);\n}',
    category: 'Documentation'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Get feedback on your code quality',
    icon: 'eye',
    placeholderPrompt: 'Review this code for best practices and potential issues:\nconst fetchData = async (url) => {\n  const res = await fetch(url);\n  return res.json();\n};',
    category: 'Code Quality'
  },
  {
    id: 'generate-unit-tests',
    name: 'Generate Unit Tests',
    description: 'Create test cases for your functions',
    icon: 'test-tube',
    placeholderPrompt: 'Write unit tests for this function:\nfunction isPalindrome(str) {\n  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, \'\');\n  return cleaned === cleaned.split(\'\').reverse().join(\'\');\n}',
    category: 'Testing'
  },
  {
    id: 'optimize-performance',
    name: 'Optimize Performance',
    description: 'Improve your code\'s efficiency',
    icon: 'zap',
    placeholderPrompt: 'Optimize this code for better performance:\nfunction findDuplicates(arr) {\n  let duplicates = [];\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {\n        duplicates.push(arr[i]);\n      }\n    }\n  }\n  return duplicates;\n}',
    category: 'Performance'
  },
  {
    id: 'convert-language',
    name: 'Convert Language',
    description: 'Translate code between programming languages',
    icon: 'languages',
    placeholderPrompt: 'Convert this Python code to JavaScript:\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
    category: 'Code Translation'
  },
  {
    id: 'design-patterns',
    name: 'Design Patterns',
    description: 'Implement design patterns in your code',
    icon: 'layout',
    placeholderPrompt: 'Implement the Singleton pattern in JavaScript',
    category: 'Architecture'
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Identify security vulnerabilities',
    icon: 'shield',
    placeholderPrompt: 'Audit this code for security vulnerabilities:\napp.get(\'/user/:id\', (req, res) => {\n  const userId = req.params.id;\n  const user = db.query(`SELECT * FROM users WHERE id = ${userId}`);\n  res.json(user);\n});',
    category: 'Security'
  },
  {
    id: 'database-query',
    name: 'Database Query Helper',
    description: 'Generate and optimize database queries',
    icon: 'database',
    placeholderPrompt: 'Write an SQL query to find the top 5 customers by total purchase amount',
    category: 'Database'
  }
];

// @route   GET /api/tools
// @desc    Get all available tools
// @access  Private
router.get('/', async (req, res) => {
  try {
    res.json(tools);
  } catch (error) {
    console.error('Get tools error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/tools/categories
// @desc    Get all tool categories
// @access  Private
router.get('/categories', async (req, res) => {
  try {
    const categories = [...new Set(tools.map(tool => tool.category))];
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/tools/category/:category
// @desc    Get tools by category
// @access  Private
router.get('/category/:category', async (req, res) => {
  try {
    const categoryTools = tools.filter(tool => tool.category === req.params.category);
    res.json(categoryTools);
  } catch (error) {
    console.error('Get tools by category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const mongoose = require('mongoose');
const User = require('../models/User');

router.get('/history', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find prompt history using user's _id
    const history = await PromptRequest.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/history', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = await PromptRequest.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tool = tools.find(t => t.id === req.params.id);
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    console.error('Get tool error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/tools/:id/prompt
// @desc    Submit a prompt to a specific tool
// @access  Private
router.post('/:id/prompt', checkRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt } = req.body;
    
    // Check if tool exists
    const tool = tools.find(t => t.id === id);
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    // Forward prompt to AI service
    const response = await promptForwarder.processPrompt(id, prompt);
    
    // Save request to database
    const promptRequest = new PromptRequest({
      user: req.user._id,
      toolId: id,
      prompt,
      response,
    });
    
    await promptRequest.save();
    
    // Return response
    res.json({ response });
  } catch (error) {
    console.error('Submit prompt error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/tools/search/:query
// @desc    Search tools by name or description
// @access  Private
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const matchingTools = tools.filter(tool => 
      tool.name.toLowerCase().includes(query) || 
      tool.description.toLowerCase().includes(query)
    );
    res.json(matchingTools);
  } catch (error) {
    console.error('Search tools error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;