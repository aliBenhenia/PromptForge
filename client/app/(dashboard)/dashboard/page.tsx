"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Code, Lightbulb, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { statsService, UsageStats } from '@/services/stats-service';
import { toolService } from '@/services/tool-service';
import { PromptRequest, Tool } from '@/types/tool';
import { RequestHistory } from '@/components/RequestHistory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

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
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-md shadow-sm">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-primary">
            {`${payload[0].value} requests`}
          </p>
        </div>
      );
    }
    
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your AI assistant usage and recent activity.
          </p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 md:mt-0"
        >
          <Link href="/tools">
            <Button>
              <Zap className="mr-2 h-4 w-4" />
              Use Tools
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Usage Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { 
            title: "Total Usage", 
            value: usageStats?.totalRequests || 0, 
            subtitle: "All-time prompts",
            icon: <Zap className="h-4 w-4" />
          },
          { 
            title: "Today's Usage", 
            value: usageStats?.requestsToday || 0, 
            subtitle: "Prompts today",
            icon: <Clock className="h-4 w-4" />
          },
          { 
            title: "Remaining Requests", 
            value: usageStats ? (usageStats.requestLimit - usageStats.totalRequests) : 0, 
            subtitle: `Out of ${usageStats?.requestLimit || 1000}`,
            icon: <Lightbulb className="h-4 w-4" />
          },
          { 
            title: "Quota Usage", 
            value: `${usageStats ? Math.round((usageStats.totalRequests / usageStats.requestLimit) * 100) : 0}%`,
            subtitle: "Usage percentage",
            icon: <Code className="h-4 w-4" />
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ y: -5 }}
          >
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {stat.icon}
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
                {stat.title === "Quota Usage" && usageStats && (
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
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Tabs for chart and tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Usage Statistics
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Available Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Usage Over Time
                </CardTitle>
                <CardDescription>
                  Your prompt requests over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {usageStats?.dailyUsage && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={usageStats.dailyUsage}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date"
                          tickFormatter={formatDate}
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          style={{ fontSize: '12px' }}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--primary))"
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
          
          <TabsContent value="tools" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="p-2 rounded-md bg-primary/10 mr-3">
                            {tool.icon === 'code' && <Code className="h-5 w-5 text-primary" />}
                            {tool.icon === 'bug' && <Zap className="h-5 w-5 text-primary" />}
                            {tool.icon === 'code-2' && <Lightbulb className="h-5 w-5 text-primary" />}
                          </div>
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="min-h-[60px] text-sm">{tool.description}</CardDescription>
                      <Link href={`/tools?tool=${tool.id}`} className="mt-4 inline-block w-full">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Use Tool
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Recent Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your most recent prompt requests</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {recentRequests.length} requests
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length > 0 ? (
              <ScrollArea className="h-[400px] p-6">
                <div className="space-y-4 pr-2">
                  <RequestHistory 
                    recentRequests={recentRequests} 
                    getToolNameById={getToolNameById} 
                  />
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-6">No recent requests found</p>
                <Link href="/tools" className="inline-block">
                  <Button variant="default">
                    <Zap className="mr-2 h-4 w-4" />
                    Try a Tool Now
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}