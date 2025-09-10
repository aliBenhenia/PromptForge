"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Clock, 
  Code, 
  Lightbulb, 
  Zap, 
  TrendingUp, 
  Users, 
  Star,
  Calendar,
  BarChart3,
  Rocket,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { statsService, UsageStats } from '@/services/stats-service';
import { toolService } from '@/services/tool-service';
import { PromptRequest, Tool } from '@/types/tool';
import { RequestHistory } from '@/components/RequestHistory';

export default function DashboardPage() {
  const { user } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<PromptRequest[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [stats, history, toolsData] = await Promise.all([
          statsService.getUserStats(),
          toolService.getRequestHistory(),
          toolService.getTools(),
        ]);
        
        setUsageStats(stats);
        setRecentRequests(history.slice(0, 5)); // Get only the 5 most recent
        setTools(toolsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const getToolNameById = (id: string): string => {
    const tool = tools.find(t => t.id === id);
    return tool ? tool.name : id;
  };
  
  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format date for recent requests
  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-4 rounded-xl shadow-lg">
          <p className="text-sm font-semibold text-foreground">{formatDate(label)}</p>
          <p className="text-sm text-primary mt-1">
            {`${payload[0].value} requests`}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-foreground">Loading Dashboard...</p>
          <p className="text-muted-foreground mt-2">Preparing your personalized insights</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center mb-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name}
                </h1>
                <CheckCircle className="h-6 w-6 text-green-500 ml-3" />
              </div>
              <p className="text-lg text-muted-foreground">
                Here's an overview of your AI assistant usage and recent activity.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/tools">
                <Button className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                  <Zap className="mr-2 h-5 w-5" />
                  Use Tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usage
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{usageStats?.totalRequests || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                All-time prompts
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today's Usage
                </CardTitle>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{usageStats?.requestsToday || 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Prompts today
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Remaining Requests
                </CardTitle>
                <Rocket className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {usageStats ? (usageStats.requestLimit - usageStats.totalRequests) : 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Out of {usageStats?.requestLimit || 1000}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quota Usage
                </CardTitle>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {usageStats ? Math.round((usageStats.totalRequests / usageStats.requestLimit) * 100) : 0}%
              </div>
              <div className="mt-3">
                <Progress 
                  value={
                    usageStats && 
                    typeof usageStats.totalRequests === 'number' &&
                    typeof usageStats.requestLimit === 'number' &&
                    usageStats.requestLimit > 0
                      ? (usageStats.totalRequests / usageStats.requestLimit) * 100
                      : 0
                  }
                  className="h-2.5"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs for chart and tools */}
        <Tabs defaultValue="usage" className="mb-8">
          <TabsList className="bg-muted p-1 rounded-xl">
            <TabsTrigger 
              value="usage" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-6 py-2.5"
            >
              Usage Statistics
            </TabsTrigger>
            <TabsTrigger 
              value="tools" 
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg px-6 py-2.5"
            >
              Available Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="pt-6">
            <Card className="border-border bg-card shadow-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Usage Over Time</CardTitle>
                    <CardDescription className="text-base">
                      Your prompt requests over the last 7 days
                    </CardDescription>
                  </div>
                  <div className="flex items-center px-3 py-1.5 bg-primary/10 rounded-full">
                    <TrendingUp className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium text-foreground">+12% from last week</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  {usageStats?.dailyUsage && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={usageStats.dailyUsage}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date"
                          tickFormatter={formatDate}
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: '12px' }}
                          tickMargin={10}
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: '12px' }}
                          tickMargin={10}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorPv)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.id} className="border-border bg-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-primary/10 mr-4">
                          {tool.icon === 'code' && <Code className="h-6 w-6 text-primary" />}
                          {tool.icon === 'bug' && <Zap className="h-6 w-6 text-primary" />}
                          {tool.icon === 'idea' && <Lightbulb className="h-6 w-6 text-primary" />}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{tool.name}</CardTitle>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-muted-foreground ml-1">4.8</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="min-h-[60px] text-base">{tool.description}</CardDescription>
                    <Link href={`/tools?tool=${tool.id}`} className="mt-6 inline-block w-full">
                      <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground py-3 transition-all">
                        Use Tool
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Recent Requests */}
        <Card className="border-border bg-card shadow-xl mt-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                <CardDescription className="text-base">Your most recent prompt requests</CardDescription>
              </div>
              <div className="flex items-center px-3 py-1.5 bg-green-500/10 rounded-full">
                <Users className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-600">5 active today</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentRequests.length > 0 ? (
              <div className="space-y-6">
                {/* Display each request */}
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-primary/10 mr-4">
                          {request.toolId === 'code-generator' && <Code className="h-5 w-5 text-primary" />}
                          {request.toolId === 'bug-fixer' && <Zap className="h-5 w-5 text-primary" />}
                          {request.toolId === 'idea-generator' && <Lightbulb className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{getToolNameById(request.toolId)}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1 max-w-md">
                            {request.prompt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground hidden sm:block">
                          {request.createdAt ? formatDateTime(request.createdAt) : 'N/A'}
                        </span>
                        <div className="flex items-center">
                          {request.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <Link href="/history" className="inline-flex items-center text-primary hover:underline">
                    View all history
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No recent activity</h3>
                <p className="text-muted-foreground mb-6">You haven't made any requests yet</p>
                <Link href="/tools">
                  <Button className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    Try a Tool Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}