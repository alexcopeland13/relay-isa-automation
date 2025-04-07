
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  MessageCircle
} from 'lucide-react';

// Sample monitoring data
const responseTimeData = [
  { time: '08:00', value: 850 },
  { time: '09:00', value: 740 },
  { time: '10:00', value: 920 },
  { time: '11:00', value: 1020 },
  { time: '12:00', value: 980 },
  { time: '13:00', value: 870 },
  { time: '14:00', value: 760 },
  { time: '15:00', value: 880 },
  { time: '16:00', value: 1100 },
  { time: '17:00', value: 940 },
];

const errorRateData = [
  { time: '08:00', value: 0.5 },
  { time: '09:00', value: 0.8 },
  { time: '10:00', value: 1.2 },
  { time: '11:00', value: 0.7 },
  { time: '12:00', value: 0.3 },
  { time: '13:00', value: 0.5 },
  { time: '14:00', value: 1.8 },
  { time: '15:00', value: 2.1 },
  { time: '16:00', value: 0.9 },
  { time: '17:00', value: 0.4 },
];

const serviceBreakdown = [
  { name: 'Successful', value: 92 },
  { name: 'Degraded', value: 5 },
  { name: 'Failed', value: 3 }
];

const activeConversations = [
  { id: 'conv-1234', leadName: 'Jason Miller', duration: '3:42', sentiment: 'positive', status: 'active' },
  { id: 'conv-1235', leadName: 'Sarah Thompson', duration: '1:15', sentiment: 'neutral', status: 'active' },
  { id: 'conv-1236', leadName: 'Robert Davis', duration: '0:48', sentiment: 'negative', status: 'active' },
  { id: 'conv-1237', leadName: 'Emma Wilson', duration: '2:21', sentiment: 'positive', status: 'handoff' },
];

const recentErrors = [
  { 
    id: 'err-1001', 
    timestamp: '14:32:15', 
    service: 'Anthropic Claude', 
    type: 'Timeout', 
    message: 'Service request timed out after 10s' 
  },
  { 
    id: 'err-1002', 
    timestamp: '14:25:03', 
    service: 'Speech-to-Text', 
    type: 'API Error', 
    message: 'Invalid audio format provided' 
  },
  { 
    id: 'err-1003', 
    timestamp: '13:58:47', 
    service: 'Workflow Automation', 
    type: 'Webhook Failed', 
    message: 'Failed to deliver event to endpoint' 
  },
  { 
    id: 'err-1004', 
    timestamp: '13:45:10', 
    service: 'OpenAI', 
    type: 'Rate Limit', 
    message: 'Rate limit exceeded, too many requests' 
  },
];

export const AiMonitoringDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="conversations" className="flex-1">Active Conversations</TabsTrigger>
          <TabsTrigger value="errors" className="flex-1">Error Monitoring</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quick stat cards */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Response Time</p>
                      <div className="text-2xl font-bold flex items-center">
                        845ms
                        <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
                          <ArrowDown className="h-3 w-3 mr-0.5" />
                          12%
                        </span>
                      </div>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Success Rate</p>
                      <div className="text-2xl font-bold flex items-center">
                        97.2%
                        <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          1.5%
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-muted-foreground opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Active Conversations</p>
                      <div className="text-2xl font-bold flex items-center">
                        4
                        <span className="ml-2 text-sm font-medium text-amber-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          2
                        </span>
                      </div>
                    </div>
                    <MessageCircle className="h-8 w-8 text-muted-foreground opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Error Rate</p>
                      <div className="text-2xl font-bold flex items-center">
                        1.3%
                        <span className="ml-2 text-sm font-medium text-red-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-0.5" />
                          0.4%
                        </span>
                      </div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Response time chart */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Response Time Trend</CardTitle>
                  <CardDescription>Average response time (ms) over the last 10 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={responseTimeData}>
                        <defs>
                          <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis domain={[600, 1200]} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#responseTimeGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Service status breakdown */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Service Status</CardTitle>
                  <CardDescription>Current status of AI services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={serviceBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip />
                        <Bar 
                          dataKey="value" 
                          fill={(entry) => {
                            if (entry.name === 'Successful') return '#10b981';
                            if (entry.name === 'Degraded') return '#f59e0b';
                            return '#ef4444';
                          }} 
                          label={{ position: 'right', formatter: (value) => `${value}%` }}
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Error rate chart */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Error Rate Trend</CardTitle>
                  <CardDescription>Percentage of requests resulting in errors over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={errorRateData}>
                        <defs>
                          <linearGradient id="errorRateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 3]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Error Rate']} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#ef4444" 
                          fillOpacity={1} 
                          fill="url(#errorRateGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="conversations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Conversations</CardTitle>
              <CardDescription>Live monitoring of ongoing AI conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b py-3 px-4 font-medium">
                  <div className="col-span-3">Lead</div>
                  <div className="col-span-2">Duration</div>
                  <div className="col-span-2">Sentiment</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                
                {activeConversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className="grid grid-cols-12 border-b py-3 px-4 hover:bg-muted/50"
                  >
                    <div className="col-span-3 font-medium">{conversation.leadName}</div>
                    <div className="col-span-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      {conversation.duration}
                    </div>
                    <div className="col-span-2">
                      {conversation.sentiment === 'positive' && (
                        <Badge className="bg-green-500">Positive</Badge>
                      )}
                      {conversation.sentiment === 'neutral' && (
                        <Badge className="bg-blue-500">Neutral</Badge>
                      )}
                      {conversation.sentiment === 'negative' && (
                        <Badge className="bg-red-500">Negative</Badge>
                      )}
                    </div>
                    <div className="col-span-3">
                      {conversation.status === 'active' && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          <Activity className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {conversation.status === 'handoff' && (
                        <Badge variant="outline" className="border-amber-500 text-amber-600">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Handoff
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <button className="text-sm text-blue-600 hover:underline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Monitoring</CardTitle>
              <CardDescription>Recent errors and exceptions in AI services</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {recentErrors.map((error) => (
                    <div 
                      key={error.id} 
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="grid gap-1">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="font-medium">{error.type}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {error.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{error.message}</p>
                        </div>
                        <Badge variant="outline">{error.service}</Badge>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button className="text-xs text-blue-600 hover:underline">Details</button>
                        <span className="mx-2 text-muted-foreground">|</span>
                        <button className="text-xs text-red-600 hover:underline">Resolve</button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
