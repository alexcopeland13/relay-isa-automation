
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, TrendingUp, Activity } from 'lucide-react';

interface LeadV2 {
  id: string;
  phone_e164: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  lead_score: number;
  lead_temperature: string;
  qualification_status: string;
  status: string;
  source: string;
  created_at: string;
  last_contacted_at: string;
}

export const LeadsV2Dashboard = () => {
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads-v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads_v2')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as LeadV2[];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['leads-v2-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads_v2')
        .select('status, lead_temperature, qualification_status, source');
      
      if (error) throw error;
      
      const total = data.length;
      const byStatus = data.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const byTemperature = data.reduce((acc, lead) => {
        acc[lead.lead_temperature] = (acc[lead.lead_temperature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const bySource = data.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { total, byStatus, byTemperature, bySource };
    }
  });

  const getTemperatureBadge = (temp: string) => {
    const variants = {
      'hot': 'destructive',
      'warm': 'default',
      'cool': 'secondary',
      'cold': 'outline'
    } as const;
    
    return <Badge variant={variants[temp as keyof typeof variants] || 'outline'}>{temp}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'new': 'default',
      'contacted': 'secondary',
      'qualified': 'default',
      'converted': 'default',
      'lost': 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.byTemperature?.hot || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.byStatus?.contacted || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CINC Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.bySource?.cinc || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads (V2 System)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Contact</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Temperature</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Source</th>
                  <th className="text-left p-3">Score</th>
                  <th className="text-left p-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads?.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">
                          {lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'}
                        </div>
                        {lead.email && (
                          <div className="text-sm text-gray-600">{lead.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-sm">{lead.phone_e164}</span>
                    </td>
                    <td className="p-3">
                      {lead.lead_temperature && getTemperatureBadge(lead.lead_temperature)}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{lead.source}</Badge>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium">{lead.lead_score || 0}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
