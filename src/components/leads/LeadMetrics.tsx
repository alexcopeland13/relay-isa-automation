
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, DollarSign, Users, CalendarClock } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LeadMetricsProps {
  leads: Lead[];
}

export const LeadMetrics = ({ leads }: LeadMetricsProps) => {
  // Calculate metrics
  const totalLeads = leads.length;
  
  const qualifiedLeads = leads.filter(
    lead => lead.status === 'Qualified' || lead.status === 'Proposal' || lead.status === 'Converted'
  ).length;
  
  const conversionRate = totalLeads > 0 
    ? Math.round((leads.filter(lead => lead.status === 'Converted').length / totalLeads) * 100) 
    : 0;
  
  const avgScore = totalLeads > 0
    ? Math.round(leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / totalLeads)
    : 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground">
            +{Math.round(totalLeads * 0.12)} from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{qualifiedLeads}</div>
          <p className="text-xs text-muted-foreground">
            {totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0}% qualification rate
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            +2.5% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgScore}</div>
          <p className="text-xs text-muted-foreground">
            +5 points from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
