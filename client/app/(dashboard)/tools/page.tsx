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
  Layers,
  Cpu,
  Database,
  Globe,
  Terminal as TerminalIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { toolService } from '@/services/tool-service';
import { Tool } from '@/types/tool';
import { motion } from 'framer-motion';

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
      toast({ variant: 'destructive', title: 'Error', description: 'Prompt failed.' });
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
      case 'cpu': return <Cpu className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'globe': return <Globe className="h-5 w-5" />;
      case 'terminal': return <TerminalIcon className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  if (isLoadingTools) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gradient-to-br from-background via-background/90 to-muted backdrop-blur-sm">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-2xl font-semibold text-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading AI Tools
          </motion.p>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Preparing the most advanced developer tools
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-muted p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div 
              className="p-4 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl mr-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Sparkles className="h-10 w-10 text-primary" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AI Developer Toolkit
            </h1>
          </div>
          <motion.p 
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Supercharge your development workflow with our suite of AI-powered tools designed for modern developers
          </motion.p>
        </motion.div>

        {isSubmitting && (
          <motion.div 
            className="fixed top-0 left-0 w-full h-1.5 bg-muted z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl">
                  <Layers className="h-5 w-5 mr-2 text-primary" />
                  Available Tools
                </CardTitle>
                <CardDescription>Select a tool to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        selectedTool?.id === tool.id 
                          ? 'border-primary bg-gradient-to-r from-primary/10 to-blue-500/10 ring-2 ring-primary/30 shadow-md' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleToolSelect(tool.id)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CardHeader className="flex flex-row items-center space-x-4 p-4">
                        <div className={`p-2 rounded-lg transition-all ${
                          selectedTool?.id === tool.id ? 'bg-primary/20 text-primary' : 'bg-muted'
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
                  </motion.div>
                ))}
              </CardContent>
            </Card>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-card/80 backdrop-blur-sm border-border shadow-lg">
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
            </motion.div>
          </motion.div>

          {/* Main */}
          <motion.div 
            className="lg:col-span-9"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {selectedTool ? (
              <Card className="border-2 border-border bg-card/90 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-6 bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      {renderToolIcon(selectedTool.icon)}
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl">{selectedTool.name}</CardTitle>
                      <CardDescription className="text-base">{selectedTool.description}</CardDescription>
                    </div>
                  </div>
                  <motion.div 
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-foreground">4.8</span>
                  </motion.div>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs defaultValue="prompt">
                    <TabsList className="mb-6 bg-muted/50 p-1 rounded-lg">
                      <TabsTrigger 
                        value="prompt" 
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-4 py-2"
                      >
                        Prompt
                      </TabsTrigger>
                      <TabsTrigger 
                        value="response" 
                        disabled={!rawResponse}
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md px-4 py-2"
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
                            className="min-h-[250px] font-mono text-sm bg-background/50 border-border focus:ring-2 focus:ring-primary focus:border-primary transition-all rounded-xl"
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end">
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              onClick={handlePromptSubmit} 
                              disabled={isSubmitting}
                              className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                            >
                              {isSubmitting ? (
                                <>
                                  <motion.svg 
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </motion.svg>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CornerRightDown className="mr-2 h-5 w-5" />
                                  Generate Response
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response">
                      {rawResponse && (
                        <motion.div 
                          className="space-y-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold flex items-center space-x-2 text-foreground">
                              <motion.div 
                                className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20"
                                whileHover={{ scale: 1.05 }}
                              >
                                {renderToolIcon(selectedTool.icon)}
                              </motion.div>
                              <span>Generated Response</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={copyToClipboard}
                                  variant="outline"
                                  className="border-border hover:bg-muted rounded-lg"
                                >
                                  {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                                  {copied ? 'Copied!' : 'Copy'}
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={exportResponse}
                                  variant="outline"
                                  className="border-border hover:bg-muted rounded-lg"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Export
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  onClick={regenerateResponse}
                                  variant="outline"
                                  className="border-border hover:bg-muted rounded-lg"
                                >
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Regenerate
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                          
                          <motion.div 
                            className="bg-gradient-to-br from-muted/50 to-muted/30 border border-border rounded-2xl p-6 max-h-[500px] overflow-y-auto shadow-inner"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
                              {response}
                            </pre>
                          </motion.div>
                          
                          <motion.div 
                            className="pt-6 border-t border-border"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <h4 className="text-base font-medium text-foreground mb-4">Was this response helpful?</h4>
                            <div className="flex space-x-4">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => handleFeedback('up')}
                                  variant={feedback.current === 'up' ? "default" : "outline"}
                                  className={
                                    feedback.current === 'up' 
                                      ? "bg-green-500/10 text-green-600 border-green-500 hover:bg-green-500/20 rounded-lg" 
                                      : "border-border hover:bg-muted rounded-lg"
                                  }
                                >
                                  <ThumbsUp className="w-5 h-5 mr-2" />
                                  Yes
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  onClick={() => handleFeedback('down')}
                                  variant={feedback.current === 'down' ? "default" : "outline"}
                                  className={
                                    feedback.current === 'down' 
                                      ? "bg-red-500/10 text-red-600 border-red-500 hover:bg-red-500/20 rounded-lg" 
                                      : "border-border hover:bg-muted rounded-lg"
                                  }
                                >
                                  <ThumbsDown className="w-5 h-5 mr-2" />
                                  No
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <motion.div 
                className="flex items-center justify-center h-96 border-2 border-dashed border-border rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <motion.div 
                    className="p-4 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Layers className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="text-muted-foreground text-lg">Select a tool to get started</p>
                  <p className="text-muted-foreground/70 mt-2">Choose from our collection of AI-powered developer tools</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}