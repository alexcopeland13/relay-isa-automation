
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Filter } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, ResponsiveContainer, Tooltip, 
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { Fragment } from 'react';

// Sample data for analytics
const conversionFunnelData = [
  { stage: "New Leads", count: 250 },
  { stage: "AI Qualified", count: 180 },
  { stage: "Human Qualified", count: 165 },
  { stage: "Expert Assigned", count: 140 },
  { stage: "Documentation", count: 110 },
  { stage: "Application", count: 85 },
  { stage: "Converted", count: 62 }
];

const qualificationAccuracyData = [
  { month: "Jan", accurate: 88, overridden: 12 },
  { month: "Feb", accurate: 90, overridden: 10 },
  { month: "Mar", accurate: 92, overridden: 8 },
  { month: "Apr", accurate: 89, overridden: 11 },
  { month: "May", accurate: 94, overridden: 6 },
  { month: "Jun", accurate: 91, overridden: 9 },
  { month: "Jul", accurate: 93, overridden: 7 }
];

const handoffSuccessData = [
  { agent: "Jennifer Thompson", successful: 38, unsuccessful: 4 },
  { agent: "Michael Rodriguez", successful: 32, unsuccessful: 5 },
  { agent: "Sarah Johnson", successful: 28, unsuccessful: 7 },
  { agent: "David Chen", successful: 35, unsuccessful: 3 }
];

const documentCompletionData = [
  { name: "Completed", value: 145 },
  { name: "Pending", value: 68 },
  { name: "Overdue", value: 32 }
];

const COLORS = ['#4ade80', '#facc15', '#ef4444'];

export const TeamLeadAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('conversion');

  const chartConfig: ChartConfig = {
    count: {
      label: "Leads",
      theme: {
        light: "#0088FE",
        dark: "#0088FE",
      },
    },
    accurate: {
      label: "Accurate",
      theme: {
        light: "#00C49F",
        dark: "#00C49F",
      },
    },
    overridden: {
      label: "Overridden",
      theme: {
        light: "#FF8042",
        dark: "#FF8042",
      },
    },
    successful: {
      label: "Successful",
      theme: {
        light: "#0088FE",
        dark: "#0088FE",
      },
    },
    unsuccessful: {
      label: "Unsuccessful",
      theme: {
        light: "#FF8042",
        dark: "#FF8042",
      },
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Team Lead Analytics</CardTitle>
              <CardDescription>
                Monitor performance metrics and track handoff success rates
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="12months">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="conversion">
                Conversion Funnel
              </TabsTrigger>
              <TabsTrigger value="qualification">
                Qualification Accuracy
              </TabsTrigger>
              <TabsTrigger value="handoff">
                Handoff Success
              </TabsTrigger>
              <TabsTrigger value="documents">
                Document Completion
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversion" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                    <CardDescription>Lead progression through sales stages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ChartContainer config={chartConfig}>
                        <Fragment>
                          <BarChart
                            data={conversionFunnelData}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" tickLine={false} axisLine={false} />
                            <YAxis 
                              type="category" 
                              dataKey="stage" 
                              tickLine={false} 
                              axisLine={false}  
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" barSize={30} />
                          </BarChart>
                          <ChartLegend content={<ChartLegendContent />} />
                        </Fragment>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Funnel Metrics</CardTitle>
                    <CardDescription>Key conversion statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">Qualification Rate</p>
                          <Badge variant="outline">72%</Badge>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">Handoff Success</p>
                          <Badge variant="outline">85%</Badge>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">Document Completion</p>
                          <Badge variant="outline">59%</Badge>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '59%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-muted-foreground">Final Conversion</p>
                          <Badge variant="outline">25%</Badge>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        View Detailed Report
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="qualification" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>AI Qualification Accuracy</CardTitle>
                    <CardDescription>Accuracy of AI qualification decisions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ChartContainer config={chartConfig}>
                        <Fragment>
                          <BarChart
                            data={qualificationAccuracyData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="accurate" stackId="a" fill="var(--color-accurate)" />
                            <Bar dataKey="overridden" stackId="a" fill="var(--color-overridden)" />
                          </BarChart>
                          <ChartLegend content={<ChartLegendContent />} />
                        </Fragment>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Qualification Metrics</CardTitle>
                    <CardDescription>Decision analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center p-4 border rounded-md bg-muted/20">
                        <div className="text-4xl font-bold text-primary">91%</div>
                        <p className="text-muted-foreground">Overall Accuracy</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Qualification Breakdown</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm">AI Approved, Correct</p>
                              <span className="text-sm">62%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm">AI Rejected, Correct</p>
                              <span className="text-sm">29%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '29%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm">AI Approved, Overridden</p>
                              <span className="text-sm">6%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '6%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm">AI Rejected, Overridden</p>
                              <span className="text-sm">3%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: '3%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        Detailed Analysis
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="handoff" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Handoff Success Rates</CardTitle>
                    <CardDescription>Success rates by property expert</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ChartContainer config={chartConfig}>
                        <Fragment>
                          <BarChart
                            data={handoffSuccessData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="agent" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="successful" fill="var(--color-successful)" />
                            <Bar dataKey="unsuccessful" fill="var(--color-unsuccessful)" />
                          </BarChart>
                          <ChartLegend content={<ChartLegendContent />} />
                        </Fragment>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Handoff Metrics</CardTitle>
                    <CardDescription>Performance analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center p-4 border rounded-md bg-muted/20">
                        <div className="text-4xl font-bold text-primary">85%</div>
                        <p className="text-muted-foreground">Average Success Rate</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Top Performing Experts</h4>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span className="font-medium">David Chen</span>
                          <Badge className="bg-green-100 text-green-800">92%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span className="font-medium">Jennifer Thompson</span>
                          <Badge className="bg-green-100 text-green-800">90%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span className="font-medium">Michael Rodriguez</span>
                          <Badge className="bg-green-100 text-green-800">86%</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Common Rejection Reasons</h4>
                        <ul className="text-sm space-y-1 list-disc pl-4">
                          <li>Budget mismatch</li>
                          <li>Location change</li>
                          <li>Timeline extension</li>
                          <li>Found another service</li>
                        </ul>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        View Full Report
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="documents" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Document Completion Status</CardTitle>
                    <CardDescription>Current status of document collection</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={documentCompletionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {documentCompletionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} Leads`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Document Metrics</CardTitle>
                    <CardDescription>Collection analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center p-4 border rounded-md bg-muted/20">
                        <div className="text-4xl font-bold text-primary">59%</div>
                        <p className="text-muted-foreground">Completion Rate</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium">Document Types</h4>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span>ID Verification</span>
                          <Badge className="bg-green-100 text-green-800">92%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span>Income Proof</span>
                          <Badge className="bg-green-100 text-green-800">78%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span>Bank Statements</span>
                          <Badge className="bg-yellow-100 text-yellow-800">65%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span>Credit Reports</span>
                          <Badge className="bg-yellow-100 text-yellow-800">52%</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center p-2 bg-muted/10 rounded-md">
                          <span>Property Details</span>
                          <Badge className="bg-red-100 text-red-800">38%</Badge>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        Send Bulk Reminders
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
