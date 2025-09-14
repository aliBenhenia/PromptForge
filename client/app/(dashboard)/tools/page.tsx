"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Code, 
  Zap, 
  Lightbulb, 
  CornerRightDown, 
  Copy, 
  Download, 
  RotateCcw, 
  Check,
  Star,
  Clock,
  TrendingUp,
  Users,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { toolService } from '@/services/tool-service';
import { Tool } from '@/types/tool';

// Typewriter effect for AI response
function useTypingEffect(text: string, speed = 20) {
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
  return displayed;
}

export default function ToolsPage() {
  const searchParams = useSearchParams();
  const initialToolId = searchParams.get('tool');

  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [prompt, setPrompt] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const response = useTypingEffect(rawResponse, 20);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<{ current: 'up' | 'down' | null }>({ current: null });
  const { toast } = useToast();

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoadingTools(true);
      try {
        const data = await toolService.getTools();
        setTools(data);
        const initial = initialToolId
          ? data.find(t => t.id === initialToolId)
          : data[0];
        if (initial) {
          setSelectedTool(initial);
          setPrompt(initial.placeholderPrompt);
        }
      } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load tools.' });
      } finally {
        setIsLoadingTools(false);
      }
    };
    fetchTools();
  }, [initialToolId, toast]);

  const handleToolSelect = (id: string) => {
    const tool = tools.find(t => t.id === id);
    if (tool) {
      setSelectedTool(tool);
      setPrompt(tool.placeholderPrompt);
      setRawResponse('');
      setProgress(0);
      setFeedback({ current: null });
    }
  };

  const handlePromptSubmit = async () => {
    if (!selectedTool) return;
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Empty Prompt', description: 'Please enter a prompt.' });
      return;
    }
    setIsSubmitting(true);
    setRawResponse('');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90));
    }, 300);
    try {
      const result = await toolService.submitPrompt(selectedTool.id, prompt);
      clearInterval(interval);
      setProgress(100);
      setRawResponse(result.response);
      toast({ title: 'Success', description: 'Response received.' });
    } catch (err) {
      clearInterval(interval);
      toast({ variant: 'destructive', title: 'Error', description: 'You have reached your daily request limit' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportResponse = () => {
    const element = document.createElement('a');
    const file = new Blob([rawResponse], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${selectedTool?.name.replace(/\s+/g, '_')}_response.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const regenerateResponse = () => {
    handlePromptSubmit();
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, current: type }));
  };

  const renderToolIcon = (icon: string) => {
    switch (icon) {
      case 'code': return <Code className="h-5 w-5" />;
      case 'bug': return <Zap className="h-5 w-5" />;
      case 'idea': return <Lightbulb className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  if (isLoadingTools) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            Loading AI Tools...
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Preparing the most advanced developer tools with next-gen AI precision
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-3xl blur-xl -z-10"></div>
          <div className="flex items-center justify-center mb-6 relative z-10">
            <div className="p-4 bg-primary/10 rounded-2xl backdrop-blur-sm border border-primary/20">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
            AI Developer Toolkit
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Supercharge your development workflow with our suite of AI-powered tools designed for modern developers — precise, fast, and intuitive.
          </p>
        </div>

        {/* Progress Bar */}
        {isSubmitting && (
          <div className="fixed top-0 left-0 w-full h-1.5 z-50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-blue-500 to-indigo-600 transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tools List */}
            <Card className="bg-card border-border shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-semibold text-foreground">
                  <Layers className="h-5 w-5 mr-3 text-primary" />
                  Available Tools
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Choose your AI assistant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {tools.map(tool => (
                  <Card
                    key={tool.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border ${
                      selectedTool?.id === tool.id 
                        ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20 shadow-lg scale-102' 
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
                    }`}
                    onClick={() => handleToolSelect(tool.id)}
                  >
                    <CardHeader className="flex flex-row items-center space-x-4 p-4">
                      <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                        selectedTool?.id === tool.id 
                          ? 'bg-primary/10 text-primary shadow-md' 
                          : 'bg-muted hover:bg-primary/5'
                      }`}>
                        {renderToolIcon(tool.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-foreground truncate leading-tight">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1 text-muted-foreground">
                          {tool.description}
                        </CardDescription>
                        <div className="flex items-center mt-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-muted-foreground ml-1">4.8</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-card border-border shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-lg text-foreground">Performance Metrics</h3>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="p-2 bg-green-500/20 rounded-lg mr-3">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="font-bold text-foreground text-lg">98.7%</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Response</p>
                      <p className="font-bold text-foreground text-lg">1.2s</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="p-2 bg-purple-500/20 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="font-bold text-foreground text-lg">12.4k+</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {selectedTool ? (
              <Card className="border-0 bg-card shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden">
                {/* Header */}
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-8 bg-gradient-to-r from-muted/50 to-transparent border-b border-border/50">
                  <div className="flex items-center space-x-5">
                    <div className="p-4 rounded-2xl bg-primary/10 shadow-md">
                      {renderToolIcon(selectedTool.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black text-foreground">{selectedTool.name}</CardTitle>
                      <CardDescription className="text-lg text-muted-foreground font-normal">
                        {selectedTool.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/30">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-foreground">4.8</span>
                  </div>
                </CardHeader>

                {/* Tabs */}
                <CardContent className="p-8">
                  <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="mb-8 bg-muted/50 p-2 rounded-2xl border border-border/40 shadow-inner">
                      <TabsTrigger 
                        value="prompt" 
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:rounded-xl px-6 py-3 text-base font-medium transition-all duration-200"
                      >
                        Your Prompt
                      </TabsTrigger>
                      <TabsTrigger 
                        value="response" 
                        disabled={!rawResponse}
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generated Response
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt">
                      <div className="space-y-8">
                        <div>
                          <label className="block text-lg font-medium text-foreground mb-3">
                            Your Prompt
                          </label>
                          <Textarea
                            placeholder={`Enter your ${selectedTool.name.toLowerCase()} prompt...`}
                            className="min-h-[300px] font-mono text-sm bg-background border-border focus:ring-2 focus:ring-primary/50 focus:border-primary/70 transition-all duration-300 resize-none rounded-xl shadow-sm"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={handlePromptSubmit} 
                            disabled={isSubmitting}
                            className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-medium rounded-xl"
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
                                <CornerRightDown className="mr-3 h-5 w-5" />
                                Generate Response
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response">
                      {rawResponse && (
                        <div className="space-y-8">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-2xl font-bold flex items-center space-x-3 text-foreground">
                              <div className="p-3 rounded-xl bg-primary/10">
                                {renderToolIcon(selectedTool.icon)}
                              </div>
                              <span>Generated Response</span>
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              <Button 
                                onClick={copyToClipboard}
                                variant="outline"
                                className="border-border hover:bg-muted/50 transition-all duration-200 px-5 py-3 rounded-xl text-sm font-medium"
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                  </>
                                )}
                              </Button>
                              <Button 
                                onClick={exportResponse}
                                variant="outline"
                                className="border-border hover:bg-muted/50 transition-all duration-200 px-5 py-3 rounded-xl text-sm font-medium"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              <Button 
                                onClick={regenerateResponse}
                                variant="outline"
                                className="border-border hover:bg-muted/50 transition-all duration-200 px-5 py-3 rounded-xl text-sm font-medium"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Regenerate
                              </Button>
                            </div>
                          </div>
                          
                          {/* Response Box */}
                          <div className="bg-muted/50 border border-border/40 rounded-2xl p-6 max-h-[500px] overflow-y-auto shadow-inner">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
                              {response}
                            </pre>
                          </div>
                          
                          {/* Feedback Section */}
                          <div className="pt-6 border-t border-border/40">
                            <h4 className="text-lg font-semibold text-foreground mb-4">Was this response helpful?</h4>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <Button
                                onClick={() => handleFeedback('up')}
                                variant={feedback.current === 'up' ? "default" : "outline"}
                                className={
                                  feedback.current === 'up' 
                                    ? "bg-green-500/10 text-green-600 border-green-500 hover:bg-green-500/20 shadow-md" 
                                    : "border-border hover:bg-muted/50"
                                }
                              >
                                <ThumbsUp className="w-5 h-5 mr-2" />
                                Yes — This helped!
                              </Button>
                              <Button
                                onClick={() => handleFeedback('down')}
                                variant={feedback.current === 'down' ? "default" : "outline"}
                                className={
                                  feedback.current === 'down' 
                                    ? "bg-red-500/10 text-red-600 border-red-500 hover:bg-red-500/20 shadow-md" 
                                    : "border-border hover:bg-muted/50"
                                }
                              >
                                <ThumbsDown className="w-5 h-5 mr-2" />
                                No — Needs improvement
                              </Button>
                            </div>
                            {feedback.current && (
                              <p className="mt-3 text-sm text-muted-foreground italic">
                                Thank you for your feedback! We’re improving every response.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-border/40 rounded-2xl bg-muted/30 backdrop-blur-sm">
                <div className="text-center">
                  <div className="p-5 bg-primary/10 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-5">
                    <Layers className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No tool selected</h3>
                  <p className="text-muted-foreground">Choose a tool from the sidebar to begin your AI-powered development journey.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}