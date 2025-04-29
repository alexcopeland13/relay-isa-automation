import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, CalendarRange, Download, FileText, TrendingUp, ZoomIn } from 'lucide-react';

// Conversion rates by stage
const stageConversionData = [
  { name: 'Initial Contact', rate: 78 },
  { name: 'Qualification', rate: 65 },
  { name: 'Proposal', rate: 48 },
  { name: 'Negotiation', rate: 35 },
  { name: 'Closing', rate: 22 },
];

// Monthly conversion trend
const monthlyTrendData = [
  { month: 'Jan', rate: 18 },
  { month: 'Feb', rate: 19 },
  { month: 'Mar', rate: 21 },
  { month: 'Apr', rate: 24 },
  { month: 'May', rate: 22 },
  { month: 'Jun', rate: 25 },
  { month: 'Jul', rate: 27 },
  { month: 'Aug', rate: 28 },
  { month: 'Sep', rate: 24 },
  { month: 'Oct', rate: 26 },
  { month: 'Nov', rate: 28 },
  { month: 'Dec', rate: 30 },
];

// Conversion by source
const sourceConversionData = [
  { name: 'Website', value: 35 },
  { name: 'Referral', value: 25 },
  { name: 'Social Media', value: 20 },
  { name: 'Direct', value: 15 },
  { name: 'Other', value: 5 },
];

// Conversion by agent
const agentConversionData = [
  { name: 'John Smith', count: 35, rate: 28 },
  { name: 'Jane Doe', count: 42, rate: 32 },
  { name: 'David Wilson', count: 28, rate: 24 },
  { name: 'Emily Taylor', count: 37, rate: 30 },
  { name: 'Michael Scott', count: 21, rate: 18 },
];

// Sample recent conversions
const recentConversions = [
  { 
    id: 'conv-001', 
    leadName: 'Michael Johnson', 
    leadSource: 'Website', 
    convertedBy: 'John Smith', 
    convertedOn: '2025-04-12', 
    conversionType: 'Loan Origination', 
    value: 325000 
  },
  { 
    id: 'conv-002', 
    leadName: 'Sarah Williams', 
    leadSource: 'Referral', 
    convertedBy: 'Jane Doe', 
    convertedOn: '2025-04-10', 
    conversionType: 'Refinance', 
    value: 450000 
  },
  { 
    id: 'conv-003', 
    leadName: 'David Anderson', 
    leadSource: 'Social Media', 
    convertedBy: 'Emily Taylor', 
    convertedOn: '2025-04-08', 
    conversionType: 'Loan Origination', 
    value: 275000 
  },
  { 
    id: 'conv-004', 
    leadName: 'Jennifer Miller', 
    leadSource: 'Direct', 
    convertedBy: 'David Wilson', 
    convertedOn: '2025-04-05', 
    conversionType: 'Refinance', 
    value: 520000 
  },
  { 
    id: 'conv-005', 
    leadName: 'Robert Brown', 
    leadSource: 'Website', 
    convertedBy: 'John Smith', 
    convertedOn: '2025-04-03', 
    conversionType: 'Loan Origination', 
    value: 380000 
  },
];

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ConversionOutcomes = () => {
  const [timeRange, setTimeRange] = useState('90days');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format currency with safety check
  const formatCurrency = (value: number | undefined | null) => {
    // Add safety check to handle undefined or null values
    if (value === undefined || value === null) {
      return '$0';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Conversion Outcomes</h1>
            <p className="text-muted-foreground mt-1">Track and analyze lead conversion metrics</p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <CalendarRange className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                +2.5%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">158</div>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                +15.3%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(385000)}</div>
            <div className="flex items-center pt-1">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                +3.8%
              </Badge>
              <span className="text-xs text-muted-foreground ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-source">By Source</TabsTrigger>
          <TabsTrigger value="by-agent">By Agent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion by Stage</CardTitle>
                <CardDescription>Percentage of leads that convert at each stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stageConversionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                      <Bar dataKey="rate" fill="#8884d8" label={{ position: 'right', formatter: (value) => `${value}%` }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Conversion Trend</CardTitle>
                <CardDescription>Conversion rate over the past 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                      <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="by-source" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion by Lead Source</CardTitle>
                <CardDescription>Distribution of conversions by acquisition channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceConversionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourceConversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Conversion']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Analysis of lead sources by conversion count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sourceConversionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                      <Bar dataKey="value" fill="#8884d8">
                        {sourceConversionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="by-agent" className="mt-0">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conversion by Agent</CardTitle>
              <CardDescription>Conversion rates and counts by agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentConversionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={(value) => `${value}%`} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Conversion Count" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="rate" name="Conversion Rate (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversions</CardTitle>
          <CardDescription>Most recent lead conversions and outcomes</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Lead Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Converted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentConversions.map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell className="font-medium">{conversion.leadName || 'Unknown'}</TableCell>
                  <TableCell>{conversion.leadSource || 'Unknown'}</TableCell>
                  <TableCell>{conversion.convertedBy || 'Unknown'}</TableCell>
                  <TableCell>{conversion.convertedOn || 'Unknown'}</TableCell>
                  <TableCell>{conversion.conversionType || 'Unknown'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(conversion.value)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default ConversionOutcomes;
