
import { useState } from 'react';
import { FollowUp, MessageTemplate, Sequence } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface PerformanceMetricsProps {
  followUps: FollowUp[];
  templates: MessageTemplate[];
  sequences: Sequence[];
}

export const PerformanceMetrics = ({ followUps, templates, sequences }: PerformanceMetricsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Overview metrics
  const totalFollowUps = followUps.length;
  const completedFollowUps = followUps.filter(f => f.status === 'completed').length;
  const completionRate = totalFollowUps > 0 ? Math.round((completedFollowUps / totalFollowUps) * 100) : 0;
  
  const overviewData = [
    { name: 'Email', value: followUps.filter(f => f.channel === 'email').length },
    { name: 'Phone', value: followUps.filter(f => f.channel === 'phone').length },
    { name: 'SMS', value: followUps.filter(f => f.channel === 'sms').length },
  ];
  
  const statusData = [
    { name: 'Pending', value: followUps.filter(f => f.status === 'pending').length },
    { name: 'Approved', value: followUps.filter(f => f.status === 'approved').length },
    { name: 'Scheduled', value: followUps.filter(f => f.status === 'scheduled').length },
    { name: 'Completed', value: completedFollowUps },
    { name: 'Declined', value: followUps.filter(f => f.status === 'declined').length },
  ];
  
  // Template performance data
  const templateData = templates.map(template => {
    // Safely access performanceMetrics which might be undefined
    const metrics = template.performanceMetrics || { openRate: 0, clickRate: 0, responseRate: 0 };
    return {
      name: template.title,
      openRate: metrics.openRate || 0,
      clickRate: metrics.clickRate || 0,
      responseRate: metrics.responseRate || 0,
      conversionRate: metrics.conversionRate || 0,
      usageCount: metrics.usageCount || 0,
      channel: template.channel
    };
  });
  
  // Sequence performance data
  const sequenceData = sequences.map(sequence => ({
    name: sequence.name,
    completionRate: sequence.performanceMetrics.completionRate,
    conversionRate: sequence.performanceMetrics.conversionRate,
    leadsInSequence: sequence.performanceMetrics.avgLeadsInSequence,
    steps: sequence.steps.length
  }));
  
  // Priority distribution for radar chart
  const priorityData = [
    { subject: 'High Priority', A: followUps.filter(f => f.priority === 'high').length, fullMark: totalFollowUps },
    { subject: 'Medium Priority', A: followUps.filter(f => f.priority === 'medium').length, fullMark: totalFollowUps },
    { subject: 'Low Priority', A: followUps.filter(f => f.priority === 'low').length, fullMark: totalFollowUps },
  ];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <CardTitle className="text-xl">Performance Metrics</CardTitle>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full min-w-[400px] grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="sequences">Sequences</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Follow-up Channel Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={overviewData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" name="Follow-ups" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Status Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Follow-up Priority Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} width={730} height={250} data={priorityData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                          <Radar name="Follow-ups" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Completion Rate</h3>
                    <div className="flex flex-col items-center justify-center h-80">
                      <div className="text-5xl font-bold text-blue-600">{completionRate}%</div>
                      <div className="text-sm text-muted-foreground mt-2">of follow-ups completed</div>
                      <div className="mt-4 text-center">
                        <div className="text-sm"><span className="font-medium">{completedFollowUps}</span> completed</div>
                        <div className="text-sm"><span className="font-medium">{totalFollowUps - completedFollowUps}</span> pending or declined</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Template Performance Metrics</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={templateData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="openRate" name="Open Rate %" fill="#8884d8" />
                          <Bar dataKey="clickRate" name="Click Rate %" fill="#82ca9d" />
                          <Bar dataKey="responseRate" name="Response Rate %" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-3">Template Conversion Rates</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={templateData.filter(t => t.conversionRate > 0)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="conversionRate" name="Conversion Rate %" stroke="#8884d8" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-3">Template Usage Count</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={templateData.filter(t => t.usageCount > 0)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="usageCount" name="Usage Count" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="sequences" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-3">Sequence Performance Comparison</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sequenceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="completionRate" name="Completion Rate %" fill="#8884d8" />
                          <Bar dataKey="conversionRate" name="Conversion Rate %" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-3">Average Leads in Sequence</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={sequenceData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="leadsInSequence" name="Average Leads" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="border rounded-md p-4">
                      <h3 className="text-sm font-medium mb-3">Sequence Steps vs. Conversion Rate</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={sequenceData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <RechartsTooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="steps" name="Number of Steps" stroke="#8884d8" />
                            <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="Conversion Rate %" stroke="#82ca9d" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
