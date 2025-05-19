
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lead } from '@/types/lead';
import { cn } from '@/lib/utils'; // Import cn utility

interface LeadDistributionProps extends React.HTMLAttributes<HTMLDivElement> {
  leads: Lead[];
}

export const LeadDistribution = ({ leads, className, ...props }: LeadDistributionProps) => {
  const [viewType, setViewType] = useState<'status' | 'source' | 'type'>('status');
  
  // Ensure leads is always an array
  const safeLeads = Array.isArray(leads) ? leads : [];
  
  const statusColors = {
    'New': '#3b82f6',
    'Contacted': '#8b5cf6',
    'Qualified': '#10b981',
    'Proposal': '#f59e0b',
    'Converted': '#059669',
    'Lost': '#6b7280'
  };
  
  const sourceColors = {
    'Website': '#3b82f6',
    'Facebook Ad': '#8b5cf6',
    'Google Ads': '#f59e0b',
    'Referral': '#10b981',
    'Direct': '#ec4899',
    'Other': '#6b7280'
  };
  
  const typeColors = {
    'Mortgage': '#8b5cf6',
    'Realtor': '#f59e0b'
  };
  
  const generateChartData = () => {
    if (!safeLeads || safeLeads.length === 0) {
      return [];
    }
    
    if (viewType === 'status') {
      const statusCounts = safeLeads.reduce((acc, lead) => {
        const status = lead && lead.status ? lead.status : 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name as keyof typeof statusColors] || '#6b7280'
      }));
    }
    
    else if (viewType === 'source') {
      const sourceCounts = safeLeads.reduce((acc, lead) => {
        const source = lead && lead.source ? lead.source : 'Unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(sourceCounts).map(([name, value]) => ({
        name,
        value,
        color: sourceColors[name as keyof typeof sourceColors] || '#6b7280'
      }));
    }
    
    else { // type
      const typeCounts = safeLeads.reduce((acc, lead) => {
        const type = lead && lead.type ? lead.type : 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value,
        color: typeColors[name as keyof typeof typeColors] || '#6b7280'
      }));
    }
  };
  
  const chartData = generateChartData();
  const totalLeads = safeLeads.length;
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload;
      const percentage = totalLeads > 0 ? Math.round((data.value / totalLeads) * 100) : 0;
      
      return (
        <div className="bg-background p-2 border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{data.value} leads ({percentage}%)</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className={cn("col-span-1 lg:col-span-2", className)} {...props}> {/* Apply className here and spread other props */}
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
          <div>
            <CardTitle>Lead Distribution</CardTitle>
            <CardDescription>Breakdown of leads by {viewType}</CardDescription>
          </div>
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as any)} className="w-fit">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="source">Source</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-0 lg:pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
