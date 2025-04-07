
import { useState } from 'react';
import { FollowUp, Template, Sequence } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Calendar, 
  ChevronDown,
  ChevronUp, 
  Download, 
  Mail, 
  Phone, 
  MessageSquare, 
  ArrowRight,
  ArrowUp,
  ArrowDown,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PerformanceMetricsProps {
  followUps: FollowUp[];
  templates: Template[];
  sequences: Sequence[];
}

export const PerformanceMetrics = ({ followUps, templates, sequences }: PerformanceMetricsProps) => {
  const [dateRange, setDateRange] = useState('30days');
  
  // Dummy conversion rate data by channel
  const conversionRateData = [
    { name: 'Email', value: 42, previousValue: 38, change: 10.5 },
    { name: 'Phone', value: 65, previousValue: 58, change: 12.1 },
    { name: 'SMS', value: 38, previousValue: 35, change: 8.6 },
    { name: 'Overall', value: 48, previousValue: 44, change: 9.1 }
  ];
  
  // Dummy response time data
  const responseTimeData = [
    { name: 'Email', value: 8.2, unit: 'hours', previousValue: 9.5, change: -13.7 },
    { name: 'Phone', value: 82, unit: '%', previousValue: 78, change: 5.1 },
    { name: 'SMS', value: 12, unit: 'minutes', previousValue: 18, change: -33.3 },
  ];
  
  // Dummy template performance data
  const templatePerformanceData = templates.map(template => ({
    name: template.name,
    responseRate: template.performanceMetrics.responseRate,
    conversionRate: template.performanceMetrics.conversionRate,
    usageCount: template.performanceMetrics.usageCount
  })).sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 5);
  
  // Dummy sequence performance data
  const sequencePerformanceData = sequences.map(sequence => ({
    name: sequence.name,
    completionRate: sequence.performanceMetrics.completionRate,
    conversionRate: sequence.performanceMetrics.conversionRate,
    leadsInSequence: sequence.performanceMetrics.avgLeadsInSequence
  })).sort((a, b) => b.conversionRate - a.conversionRate);
  
  // Dummy response data by time of day
  const responseByTimeData = [
    { name: '8am', email: 35, phone: 42, sms: 28 },
    { name: '10am', email: 58, phone: 65, sms: 40 },
    { name: '12pm', email: 42, phone: 52, sms: 36 },
    { name: '2pm', email: 48, phone: 58, sms: 42 },
    { name: '4pm', email: 52, phone: 48, sms: 38 },
    { name: '6pm', email: 38, phone: 32, sms: 48 },
    { name: '8pm', email: 28, phone: 15, sms: 45 },
  ];
  
  // Dummy response data by day of week
  const responseByDayData = [
    { name: 'Mon', email: 45, phone: 52, sms: 40 },
    { name: 'Tue', email: 48, phone: 58, sms: 42 },
    { name: 'Wed', email: 52, phone: 62, sms: 44 },
    { name: 'Thu', email: 49, phone: 60, sms: 45 },
    { name: 'Fri', email: 42, phone: 55, sms: 38 },
    { name: 'Sat', email: 35, phone: 30, sms: 48 },
    { name: 'Sun', email: 32, phone: 25, sms: 50 },
  ];
  
  // Dummy follow-up effectiveness trend data
  const followUpTrendData = [
    { name: 'Week 1', conversion: 35, response: 58 },
    { name: 'Week 2', conversion: 38, response: 62 },
    { name: 'Week 3', conversion: 42, response: 65 },
    { name: 'Week 4', conversion: 45, response: 68 },
    { name: 'Week 5', conversion: 48, response: 72 },
    { name: 'Week 6', conversion: 46, response: 70 },
    { name: 'Week 7', conversion: 50, response: 75 },
    { name: 'Week 8', conversion: 52, response: 78 },
  ];
  
  // Helper function to generate trend indicator
  const getTrendIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span>{change.toFixed(1)}%</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-3 w-3 mr-1" />
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-muted-foreground">
          <ArrowRight className="h-3 w-3 mr-1" />
          <span>0%</span>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <Tabs value={dateRange} onValueChange={setDateRange}>
            <TabsList>
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Custom Range
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-2">
                <div className="text-sm text-muted-foreground mb-4">
                  Custom date range selector (placeholder)
                </div>
                <Button className="w-full" size="sm">Apply Range</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {conversionRateData.map((data) => (
          <Card key={data.name}>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">
                  {data.name === 'Email' ? (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-blue-500" />
                      <span>Email Conversion</span>
                    </div>
                  ) : data.name === 'Phone' ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-green-500" />
                      <span>Call Conversion</span>
                    </div>
                  ) : data.name === 'SMS' ? (
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-purple-500" />
                      <span>SMS Conversion</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <BarChart className="h-4 w-4 mr-1 text-primary" />
                      <span>Overall Conversion</span>
                    </div>
                  )}
                </span>
                
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold">{data.value}%</div>
                  <div className="text-xs">{getTrendIndicator(data.change)}</div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  vs. {data.previousValue}% last period
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Channel Response Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {responseTimeData.map((data) => (
          <Card key={data.name}>
            <CardContent className="p-6">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">
                  {data.name === 'Email' ? (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-blue-500" />
                      <span>Email Response Time</span>
                    </div>
                  ) : data.name === 'Phone' ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-green-500" />
                      <span>Call Answer Rate</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-purple-500" />
                      <span>SMS Response Time</span>
                    </div>
                  )}
                </span>
                
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold">
                    {data.value} {data.unit}
                  </div>
                  <div className="text-xs">{getTrendIndicator(data.change)}</div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-1">
                  vs. {data.previousValue} {data.unit} last period
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Follow-up Trend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Follow-up Effectiveness Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={followUpTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="response" 
                  name="Response Rate"
                  stroke="#4ade80" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="conversion" 
                  name="Conversion Rate"
                  stroke="#3b82f6" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Template Performance Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Performing Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templatePerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="responseRate" 
                  name="Response Rate"
                  fill="#4ade80" 
                />
                <Bar 
                  dataKey="conversionRate" 
                  name="Conversion Rate"
                  fill="#3b82f6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Response by Time & Day Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response by Time of Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseByTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="email" 
                    name="Email"
                    stroke="#3b82f6" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="phone" 
                    name="Phone"
                    stroke="#4ade80" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sms" 
                    name="SMS"
                    stroke="#a855f7" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Response by Day of Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseByDayData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="email" 
                    name="Email"
                    stroke="#3b82f6" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="phone" 
                    name="Phone"
                    stroke="#4ade80" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sms" 
                    name="SMS"
                    stroke="#a855f7" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sequence Performance Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sequence Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sequencePerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="completionRate" 
                  name="Completion Rate"
                  fill="#a855f7" 
                />
                <Bar 
                  dataKey="conversionRate" 
                  name="Conversion Rate"
                  fill="#3b82f6" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
