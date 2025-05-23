
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { EnhancedLeadQualificationData } from './EnhancedLeadQualificationData';

interface LeadQualificationDataProps {
  leadId: string;
}

export const LeadQualificationData = ({ leadId }: LeadQualificationDataProps) => {
  const [qualificationData, setQualificationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQualificationData = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('qualification_data')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setQualificationData(data || []);
      } catch (err) {
        console.error('Error fetching qualification data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (leadId) {
      fetchQualificationData();
    }
  }, [leadId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading qualification data...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error loading qualification data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (qualificationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Qualification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No qualification data available for this lead.</p>
        </CardContent>
      </Card>
    );
  }

  const latestQualification = qualificationData[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Qualification Data</CardTitle>
        {qualificationData.length > 1 && (
          <Badge variant="outline">{qualificationData.length} records</Badge>
        )}
      </CardHeader>
      <CardContent>
        <EnhancedLeadQualificationData data={latestQualification} />
      </CardContent>
    </Card>
  );
};
