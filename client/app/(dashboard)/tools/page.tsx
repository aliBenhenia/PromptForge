

// ```jsx
import { useState, useEffect } from 'react';
import { Code, Zap, Lightbulb, CornerRightDown, Sparkles, Cpu, Database, Globe, Shield, Layers } from 'lucide-react';

const App = () => {
  const [tools] = useState([
    {
      id: 'code-generator',
      name: 'Code Generator',
      description: 'Generate production-ready code snippets in multiple languages',
      icon: 'code',
      placeholderPrompt: 'Create a React component for a login form with validation'
    },
    {
      id: 'bug-fixer',
      name: 'Bug Fixer',
      description: 'Identify and resolve common programming errors',
      icon: 'bug',
      placeholderPrompt: 'Fix the memory leak in this Node.js application'
    },
    {
      id: 'idea-generator',
      name: 'Idea Generator',
      description: 'Brainstorm creative solutions and project ideas',
      icon: 'idea',
      placeholderPrompt: 'Suggest 5 innovative AI project ideas for startups'
    },
    {
      id: 'architecture',
      name: 'System Architecture',
      description: 'Design scalable system architectures',
      icon: 'layers',
      placeholderPrompt: 'Design a microservices architecture for an e-commerce platform'
    },
    {
      id: 'database',
      name: 'Database Optimizer',
      description: 'Optimize database queries and schemas',
      icon: 'database',
      placeholderPrompt: 'Optimize this SQL query for better performance'
    },
    {
      id: 'security',
      name: 'Security Advisor',
      description: 'Identify vulnerabilities and security best practices',
      icon: 'shield',
      placeholderPrompt: 'Audit this authentication system for security flaws'
    }
  ]);

  const [selectedTool, setSelectedTool] = useState(tools[0]);
  const [prompt, setPrompt] = useState(tools[0].placeholderPrompt);
  const [rawResponse, setRawResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPrompt(selectedTool.placeholderPrompt);
    setRawResponse('');
  }, [selectedTool]);

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsSubmitting(true);
    setRawResponse('');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 300);
    
    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setRawResponse(`Generated response for: "${prompt}"\n\nBased on your request, here's a comprehensive solution:\n\n1. First, we need to analyze the requirements\n2. Then implement the core functionality\n3. Finally, optimize for performance\n\nThis is a sample response to demonstrate the UI. In a real application, this would contain the actual AI-generated content.`);
      setIsSubmitting(false);
      setTimeout(() => setProgress(0), 500);
    }, 2500);
  };

  const renderToolIcon = (icon) => {
    const iconClasses = "w-5 h-5";
    switch (icon) {
      case 'code': return <Code className={iconClasses} />;
      case 'bug': return <Zap className={iconClasses} />;
      case 'idea': return <Lightbulb className={iconClasses} />;
      case 'layers': return <Layers className={iconClasses} />;
      case 'database': return <Database className={iconClasses} />;
      case 'shield': return <Shield className={iconClasses} />;
      case 'cpu': return <Cpu className={iconClasses} />;
      case 'globe': return <Globe className={iconClasses} />;
      default: return <Sparkles className={iconClasses} />;
    }
  };

  const TypingEffect = ({ text, speed = 20 }) => {
    const [displayed, setDisplayed] = useState('');
    
    useEffect(() => {
      let idx = 0;
      setDisplayed('');
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, ++idx));
        if (idx >= text.length) clearInterval(interval);
      }, speed);
      return () => clearInterval(interval);
    }, [text, speed]);
    
    return <>{displayed}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Developer Toolkit</h1>
                <p className="text-xs text-slate-500">Professional tools for developers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">v2.1.0</span>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">AI-Powered Developer Tools</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Enhance your development workflow with our suite of AI-powered tools designed for modern developers
          </p>
        </div>

        {isSubmitting && (
          <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  Available Tools
                </h3>
                <p className="text-sm text-slate-500 mt-1">Select a tool to get started</p>
              </div>
              <div className="divide-y divide-slate-100">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                      selectedTool.id === tool.id 
                        ? 'bg-blue-50 border-r-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${
                        selectedTool.id === tool.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {renderToolIcon(tool.icon)}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{tool.name}</h4>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Pro Tips</h4>
                  <ul className="mt-2 text-sm text-slate-600 space-y-1">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Be specific with your prompts for better results</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Include context about your tech stack</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>Review generated code before implementation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {renderToolIcon(selectedTool.icon)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedTool.name}</h2>
                    <p className="text-slate-600">{selectedTool.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 mb-2">
                      Your Prompt
                    </label>
                    <textarea
                      id="prompt"
                      rows={5}
                      className="w-full px-4 py-3 text-slate-700 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm font-mono text-sm"
                      placeholder={selectedTool.placeholderPrompt}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handlePromptSubmit}
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CornerRightDown className="mr-2 h-5 w-5" />
                          Generate Response
                        </>
                      )}
                    </button>
                  </div>

                  {rawResponse && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg mr-2">
                            {renderToolIcon(selectedTool.icon)}
                          </div>
                          Generated Response
                        </h3>
                        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                          Copy to Clipboard
                        </button>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700">
                          <TypingEffect text={rawResponse} speed={20} />
                        </pre>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                          Regenerate
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                          Export Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Accuracy Rate</p>
                    <p className="text-lg font-semibold text-slate-900">98.7%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg. Response Time</p>
                    <p className="text-lg font-semibold text-slate-900">1.2s</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Active Users</p>
                    <p className="text-lg font-semibold text-slate-900">12.4k</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
// ```