"use client"

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
  const [feedback, setFeedback] = useState<{ [key: string]: 'up' | 'down' | null }>({});
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
      toast({ variant: 'destructive', title: 'Error', description: 'messageYou have reached your daily request limit' });
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
    setFeedback(prev => ({
      ...prev,
      current: type
    }));
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
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-foreground">Loading AI Tools...</p>
          <p className="text-muted-foreground mt-2">Preparing the most advanced developer tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full mr-3">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI Developer Toolkit
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Supercharge your development workflow with our suite of AI-powered tools designed for modern developers
          </p>
        </div>

        {isSubmitting && (
          <div className="fixed top-0 left-0 w-full h-1.5 bg-muted z-50">
            <div
              className="h-full bg-gradient-to-r from-primary to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Layers className="h-5 w-5 mr-2 text-primary" />
                  Available Tools
                </CardTitle>
                <CardDescription>Select a tool to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {tools.map(tool => (
                  <Card
                    key={tool.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedTool?.id === tool.id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleToolSelect(tool.id)}
                  >
                    <CardHeader className="flex flex-row items-center space-x-4 p-4">
                      <div className={`p-2 rounded-lg ${
                        selectedTool?.id === tool.id ? 'bg-primary/10 text-primary' : 'bg-muted'
                      }`}>
                        {renderToolIcon(tool.icon)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">{tool.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2 mt-1">{tool.description}</CardDescription>
                        <div className="flex items-center mt-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground ml-1">4.8</span>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Performance Metrics</h3>
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Accuracy</p>
                      <p className="font-semibold text-foreground">98.7%</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                      <Clock className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Response</p>
                      <p className="font-semibold text-foreground">1.2s</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="font-semibold text-foreground">12.4k</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main */}
          <div className="lg:col-span-9">
            {selectedTool ? (
              <Card className="border-2 border-border bg-card shadow-xl">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-6 bg-muted/50 border-b border-border">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      {renderToolIcon(selectedTool.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{selectedTool.name}</CardTitle>
                      <CardDescription className="text-base">{selectedTool.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-foreground">4.8</span>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs defaultValue="prompt">
                    <TabsList className="mb-6 bg-muted p-1 rounded-lg">
                      <TabsTrigger 
                        value="prompt" 
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
                      >
                        Prompt
                      </TabsTrigger>
                      <TabsTrigger 
                        value="response" 
                        disabled={!rawResponse}
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md"
                      >
                        Response
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Your Prompt
                          </label>
                          <Textarea
                            placeholder={`Enter your ${selectedTool.name.toLowerCase()} prompt...`}
                            className="min-h-[250px] font-mono text-sm bg-background border-border focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            onClick={handlePromptSubmit} 
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
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
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response">
                      {rawResponse && (
                        <div className="space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold flex items-center space-x-2 text-foreground">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {renderToolIcon(selectedTool.icon)}
                              </div>
                              <span>Generated Response</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Button 
                                onClick={copyToClipboard}
                                variant="outline"
                                className="border-border hover:bg-muted"
                              >
                                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? 'Copied!' : 'Copy'}
                              </Button>
                              <Button 
                                onClick={exportResponse}
                                variant="outline"
                                className="border-border hover:bg-muted"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                              </Button>
                              <Button 
                                onClick={regenerateResponse}
                                variant="outline"
                                className="border-border hover:bg-muted"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Regenerate
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 border border-border rounded-xl p-6 max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                              {response}
                            </pre>
                          </div>
                          
                          <div className="pt-6 border-t border-border">
                            <h4 className="text-base font-medium text-foreground mb-4">Was this response helpful?</h4>
                            <div className="flex space-x-4">
                              <Button
                                onClick={() => handleFeedback('up')}
                                variant={feedback.current === 'up' ? "default" : "outline"}
                                className={
                                  feedback.current === 'up' 
                                    ? "bg-green-500/10 text-green-600 border-green-500 hover:bg-green-500/20" 
                                    : "border-border hover:bg-muted"
                                }
                              >
                                <ThumbsUp className="w-5 h-5 mr-2" />
                                Yes
                              </Button>
                              <Button
                                onClick={() => handleFeedback('down')}
                                variant={feedback.current === 'down' ? "default" : "outline"}
                                className={
                                  feedback.current === 'down' 
                                    ? "bg-red-500/10 text-red-600 border-red-500 hover:bg-red-500/20" 
                                    : "border-border hover:bg-muted"
                                }
                              >
                                <ThumbsDown className="w-5 h-5 mr-2" />
                                No
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-xl bg-muted/30">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg">Select a tool to get started</p>
                  <p className="text-muted-foreground/70 mt-2">Choose from our collection of AI-powered developer tools</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}