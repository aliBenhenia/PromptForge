import { promises as fs } from 'fs';
import path from 'path';

// Type definitions for external API data
interface APIIntegration {
  name: string;
  endpoint: string;
  method: string;
  description: string;
  example_request: string;
  example_response: string;
  rate_limit?: string;
}

interface NextJSConcept {
  concept: string;
  description: string;
  implementation_in_project: string;
  benefits: string[];
  code_example?: string;
}

interface ProjectFeature {
  name: string;
  description: string;
  tech_used: string[];
  implementation: string;
}

// Mock external API data - In real implementation, you'd fetch from your API
const apiIntegrations: APIIntegration[] = [
  {
    name: "DeepSeek Chat Completion",
    endpoint: "https://api.deepseek.com/v1/chat/completions",
    method: "POST",
    description: "Generate AI-powered code explanations and bug fixes using DeepSeek's advanced language model.",
    example_request: `{
  "model": "deepseek-coder",
  "messages": [
    {"role": "system", "content": "You are an expert code assistant"},
    {"role": "user", "content": "Explain this React component..."}
  ],
  "temperature": 0.7
}`,
    example_response: `{
  "id": "chatcmpl-123",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "This React component uses hooks for state management..."
    }
  }],
  "usage": {"total_tokens": 150}
}`,
    rate_limit: "100 requests/hour"
  },
  {
    name: "OpenAI Code Completion",
    endpoint: "https://api.openai.com/v1/completions",
    method: "POST",
    description: "Generate regex patterns and code completions with OpenAI's models.",
    example_request: `{
  "model": "gpt-4",
  "prompt": "Generate regex for email validation",
  "max_tokens": 100
}`,
    example_response: `{
  "id": "cmpl-123",
  "choices": [{
    "text": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  }]
}`,
    rate_limit: "60 requests/minute"
  },
  {
    name: "JWT Authentication",
    endpoint: "/api/auth/login",
    method: "POST",
    description: "Secure user authentication with JSON Web Tokens.",
    example_request: `{
  "email": "user@example.com",
  "password": "securepassword123"
}`,
    example_response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}`
  }
];

const nextJSConcepts: NextJSConcept[] = [
  {
    concept: "Static Site Generation (SSG)",
    description: "Pre-renders pages at build time, generating static HTML files that can be served instantly.",
    implementation_in_project: "Used for documentation pages, landing pages, and any content that doesn't require real-time data fetching.",
    benefits: [
      "Lightning fast page loads",
      "Excellent SEO performance",
      "Reduced server load",
      "CDN cacheable content"
    ],
    code_example: `// This page uses SSG with revalidation
export async function generateStaticParams() {
  return [{ slug: 'docs' }];
}

export const revalidate = 3600; // Revalidate every hour (ISR)`
  },
  {
    concept: "Incremental Static Regeneration (ISR)",
    description: "Allows you to update static content after build time without rebuilding the entire site.",
    implementation_in_project: "Applied to documentation that might need updates without redeployment. API docs are regenerated periodically.",
    benefits: [
      "Dynamic content with static speed",
      "No need for full rebuilds",
      "Background regeneration",
      "Stale-while-revalidate pattern"
    ]
  },
  {
    concept: "App Router Structure",
    description: "Next.js 13+ introduces a file-system based router with improved performance and features.",
    implementation_in_project: "Organized with app/ directory structure, using layout.tsx for shared UI and page.tsx for route segments.",
    benefits: [
      "Nested layouts",
      "Streaming support",
      "Improved loading states",
      "Simplified data fetching"
    ]
  },
  {
    concept: "Server Components by Default",
    description: "Components are rendered on the server by default, reducing JavaScript bundle size.",
    implementation_in_project: "All documentation pages are server components, fetching data and rendering HTML on the server.",
    benefits: [
      "Smaller client bundles",
      "Faster initial load",
      "Better SEO",
      "Direct database/API access"
    ]
  },
  {
    concept: "Route Handlers (API Routes)",
    description: "Create API endpoints alongside your pages in the app directory.",
    implementation_in_project: "Used for authentication, AI API proxying, and user data management in /app/api/ routes.",
    benefits: [
      "Unified project structure",
      "TypeScript support",
      "Middleware integration",
      "Edge runtime support"
    ]
  }
];

const projectFeatures: ProjectFeature[] = [
  {
    name: "Code Explainer",
    description: "AI-powered code analysis that breaks down complex code into understandable explanations.",
    tech_used: ["DeepSeek API", "React", "CodeMirror"],
    implementation: "Uses server actions to process code through AI APIs, with streaming responses for real-time explanations."
  },
  {
    name: "Bug Fixer",
    description: "Automatically detects and fixes common programming errors with detailed explanations.",
    tech_used: ["OpenAI API", "Syntax Analysis", "Context API"],
    implementation: "Parses error messages and code context, then generates optimized fixes with step-by-step reasoning."
  },
  {
    name: "Regex Generator",
    description: "Converts natural language descriptions into functional regular expressions.",
    tech_used: ["OpenAI GPT-4", "Regex Validation", "Clipboard API"],
    implementation: "Processes user descriptions, generates and tests regex patterns, provides explanations and usage examples."
  },
  {
    name: "JWT Authentication",
    description: "Secure user authentication with token-based sessions and protected routes.",
    tech_used: ["jsonwebtoken", "bcrypt", "HttpOnly Cookies"],
    implementation: "Stateless authentication with refresh tokens, role-based access control, and secure credential storage."
  }
];

// In a real implementation, you might fetch this from an external API
async function getExternalAPIDocs() {
  // Simulate API call - replace with actual fetch in production
  return {
    timestamp: new Date().toISOString(),
    integrations: apiIntegrations,
    concepts: nextJSConcepts,
    features: projectFeatures
  };
}

// Generate static params for SSG
export async function generateStaticParams() {
  return [{ slug: 'docs' }];
}

// Revalidate every hour (ISR)
export const revalidate = 3600;

export default async function DocumentationPage() {
  const data = await getExternalAPIDocs();
  const buildTime = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            PromptForge Documentation
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Complete guide to the AI-powered developer toolkit
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="px-3 py-1 bg-gray-800 rounded-full">
              🔮 Version 1.0.0
            </span>
            <span className="px-3 py-1 bg-purple-900/50 rounded-full">
              🚀 Production Ready
            </span>
            <span className="px-3 py-1 bg-cyan-900/50 rounded-full">
              ⚡ SSG/ISR Enabled
            </span>
            <span className="text-gray-500">
              Last generated: {buildTime}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar - Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-cyan-300">Table of Contents</h2>
              <nav className="space-y-3">
                {[
                  { id: 'overview', label: '📋 Project Overview' },
                  { id: 'features', label: '✨ Core Features' },
                  { id: 'nextjs-concepts', label: '⚡ Next.js Concepts' },
                  { id: 'api-integrations', label: '🔌 API Integrations' },
                  { id: 'tech-stack', label: '🛠️ Tech Stack' },
                  { id: 'deployment', label: '🚀 Deployment Guide' },
                  { id: 'best-practices', label: '🎯 Best Practices' }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block py-2 px-4 rounded-lg hover:bg-gray-700/50 transition-colors border-l-2 border-transparent hover:border-cyan-400"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-300">Quick Links</h3>
                <div className="space-y-2">
                  <a href="https://github.com/your-username/promptforge" className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                    <span>📦 GitHub Repository</span>
                  </a>
                  <a href="https://prompt-forge-six.vercel.app" className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                    <span>🌐 Live Demo</span>
                  </a>
                  <a href="/api/docs" className="flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
                    <span>🔧 API Reference</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-2 space-y-12">
            {/* Project Overview */}
            <section id="overview" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-purple-300 flex items-center gap-3">
                <span>📋</span> Project Overview
              </h2>
              <div className="space-y-4">
                <p className="text-lg">
                  PromptForge is a modern web-based toolkit designed to <span className="text-cyan-300 font-semibold">boost developer productivity</span> with AI-powered utilities. It provides smart, context-aware tools inside a clean and responsive interface.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-3 text-green-400">🎯 Mission</h3>
                    <p>Democratize access to AI-powered development tools through an intuitive, accessible interface that understands developer workflows.</p>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-3 text-yellow-400">✨ Vision</h3>
                    <p>Create a comprehensive suite of intelligent tools that adapt to individual coding styles and become an indispensable part of every developer's toolkit.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Features */}
            <section id="features" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-purple-300 flex items-center gap-3">
                <span>✨</span> Core Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.features.map((feature, index) => (
                  <div 
                    key={feature.name}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{feature.name}</h3>
                      <span className="text-cyan-300 text-sm font-mono bg-gray-800 px-3 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-gray-400">Tech Stack:</span>
                      <div className="flex flex-wrap gap-2">
                        {feature.tech_used.map((tech) => (
                          <span 
                            key={tech}
                            className="px-3 py-1 bg-gray-800/70 rounded-full text-sm border border-gray-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <span className="text-sm font-semibold text-gray-400">Implementation:</span>
                      <p className="text-sm text-gray-300 mt-1">{feature.implementation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Next.js Concepts */}
            <section id="nextjs-concepts" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-purple-300 flex items-center gap-3">
                <span>⚡</span> Next.js Concepts in Practice
              </h2>
              <div className="space-y-6">
                {data.concepts.map((concept) => (
                  <div 
                    key={concept.concept}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700"
                  >
                    <h3 className="text-2xl font-bold mb-3 text-cyan-300">{concept.concept}</h3>
                    <p className="text-gray-300 mb-4">{concept.description}</p>
                    
                    <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border-l-4 border-cyan-500">
                      <span className="text-sm font-semibold text-gray-400">In PromptForge:</span>
                      <p className="text-gray-200 mt-1">{concept.implementation_in_project}</p>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-sm font-semibold text-gray-400">Key Benefits:</span>
                      <ul className="mt-2 space-y-2">
                        {concept.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1">✓</span>
                            <span className="text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {concept.code_example && (
                      <div className="mt-4">
                        <span className="text-sm font-semibold text-gray-400">Code Example:</span>
                        <pre className="mt-2 p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm border border-gray-700">
                          <code className="text-gray-200">{concept.code_example}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* API Integrations */}
            <section id="api-integrations" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-purple-300 flex items-center gap-3">
                <span>🔌</span> External API Integrations
              </h2>
              <div className="space-y-6">
                {data.integrations.map((api) => (
                  <div 
                    key={api.name}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-white">{api.name}</h3>
                      <div className="flex items-center gap-3 mt-2 md:mt-0">
                        <span className="px-3 py-1 bg-purple-900/50 rounded-full text-sm font-mono">
                          {api.method}
                        </span>
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-mono text-cyan-300">
                          {api.endpoint}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6">{api.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Example Request:</h4>
                        <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm">
                          <code className="text-green-300">{api.example_request}</code>
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Example Response:</h4>
                        <pre className="p-4 bg-gray-900 rounded-lg overflow-x-auto text-sm">
                          <code className="text-yellow-300">{api.example_response}</code>
                        </pre>
                      </div>
                    </div>
                    
                    {api.rate_limit && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <span className="text-sm font-semibold text-gray-400">Rate Limit: </span>
                        <span className="text-cyan-300 ml-2">{api.rate_limit}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Tech Stack */}
            <section id="tech-stack" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-purple-300 flex items-center gap-3">
                <span>🛠️</span> Technology Stack
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { category: "Frontend", techs: ["Next.js 16", "React 18", "TypeScript", "TailwindCSS", "Shadcn/UI"] },
                  { category: "Backend", techs: ["Express.js", "Node.js", "MongoDB", "Mongoose", "JWT"] },
                  { category: "AI/ML", techs: ["DeepSeek API", "OpenAI API", "LangChain", "Prompt Engineering"] },
                  { category: "Authentication", techs: ["JWT Tokens", "bcrypt", "HttpOnly Cookies", "OAuth 2.0"] },
                  { category: "DevOps", techs: ["Vercel", "Railway", "MongoDB Atlas", "GitHub Actions"] },
                  { category: "Monitoring", techs: ["Sentry", "Vercel Analytics", "Custom Logging"] }
                ].map((stack) => (
                  <div 
                    key={stack.category}
                    className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-colors"
                  >
                    <h3 className="text-xl font-bold mb-4 text-green-300">{stack.category}</h3>
                    <ul className="space-y-2">
                      {stack.techs.map((tech) => (
                        <li key={tech} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                          <span className="text-gray-300">{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Deployment Guide */}
            <section id="deployment" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-purple-300 flex items-center gap-3">
                <span>🚀</span> Deployment Guide
              </h2>
              <div className="space-y-6">
                <div className="bg-gray-900/50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4 text-cyan-300">SSG/ISR Configuration</h3>
                  <pre className="p-4 bg-gray-800 rounded-lg overflow-x-auto text-sm mb-4">
                    <code className="text-gray-200">
{`// This page configuration
export async function generateStaticParams() {
  return [{ slug: 'docs' }];
}

// Revalidate every hour (ISR)
export const revalidate = 3600;

// Static generation without client-side JS
export default async function DocumentationPage() {
  const data = await getExternalAPIDocs();
  // ... rest of the component
}`}
                    </code>
                  </pre>
                  <p className="text-gray-300">
                    This page uses Incremental Static Regeneration (ISR) to provide fast static delivery with periodic updates. 
                    The content is generated at build time and revalidated every hour.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-green-300">Environment Variables</h3>
                    <pre className="p-4 bg-gray-800 rounded-lg overflow-x-auto text-sm">
                      <code className="text-yellow-300">
{`# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.promptforge.dev
NEXT_PUBLIC_APP_URL=https://promptforge.dev

# Backend (.env)
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
JWT_SECRET=your-secret-key
MONGO_URI=mongodb+srv://...
`}
                      </code>
                    </pre>
                  </div>
                  <div className="bg-gray-900/50 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 text-yellow-300">Build & Deploy</h3>
                    <pre className="p-4 bg-gray-800 rounded-lg overflow-x-auto text-sm">
                      <code className="text-gray-200">
{`# Production build
npm run build

# Export static files (for SSG)
npm run export

# Deploy to Vercel
vercel --prod

# Or deploy manually
npm run start`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section id="best-practices" className="bg-gray-800/30 rounded-2xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-purple-300 flex items-center gap-3">
                <span>🎯</span> Best Practices Implemented
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-5 rounded-xl border-l-4 border-green-500">
                    <h4 className="font-bold text-lg mb-2">Security</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">🔒</span>
                        <span>API keys stored server-side only</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">🛡️</span>
                        <span>JWT with HttpOnly cookies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">🔐</span>
                        <span>Rate limiting on all API endpoints</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 p-5 rounded-xl border-l-4 border-cyan-500">
                    <h4 className="font-bold text-lg mb-2">Performance</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">⚡</span>
                        <span>SSG/ISR for optimal loading</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">📦</span>
                        <span>Code splitting with dynamic imports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">🖼️</span>
                        <span>Optimized images with Next/Image</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-900/50 p-5 rounded-xl border-l-4 border-purple-500">
                    <h4 className="font-bold text-lg mb-2">Development</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">🧪</span>
                        <span>TypeScript for type safety</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">📝</span>
                        <span>Comprehensive error handling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-1">🔧</span>
                        <span>Environment-based configuration</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gray-900/50 p-5 rounded-xl border-l-4 border-yellow-500">
                    <h4 className="font-bold text-lg mb-2">SEO & Accessibility</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">🔍</span>
                        <span>Semantic HTML structure</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">♿</span>
                        <span>ARIA labels and keyboard navigation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-1">📱</span>
                        <span>Fully responsive design</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 mt-12 border-t border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    PromptForge
                  </h3>
                  <p className="text-gray-400 mt-2">AI-Powered Developer Toolkit</p>
                </div>
                <div className="mt-4 md:mt-0 text-center md:text-right">
                  <p className="text-gray-400 text-sm">
                    Built with Next.js 16 • SSG/ISR Enabled
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Documentation generated at build time • Revalidates every hour
                  </p>
                  <div className="flex gap-4 mt-4 justify-center md:justify-end">
                    <a href="https://github.com/your-username/promptforge" className="text-gray-400 hover:text-white transition-colors">
                      GitHub
                    </a>
                    <a href="https://prompt-forge-six.vercel.app" className="text-gray-400 hover:text-cyan-300 transition-colors">
                      Live Demo
                    </a>
                    <a href="/api/docs" className="text-gray-400 hover:text-purple-300 transition-colors">
                      API Docs
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} PromptForge. MIT Licensed. This page uses Incremental Static Regeneration.</p>
                <p className="mt-1">Page built: {buildTime}</p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}