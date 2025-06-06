import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';

export function useLeadsData() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeStatus, setRealTimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching leads from database...');
      
      const { data: supabaseLeads, error } = await supabase
        .from('leads')
        .select(`
          *,
          qualification_data(*),
          conversations(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('📊 Raw leads data:', supabaseLeads);

      // Transform to Lead format
      const transformedLeads: Lead[] = (supabaseLeads || []).map(lead => ({
        id: lead.id,
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead',
        email: lead.email || '',
        phone: lead.phone || '',
        phone_raw: lead.phone_raw || lead.phone,
        phone_e164: lead.phone_e164,
        cinc_lead_id: lead.cinc_lead_id,
        status: mapStatus(lead.status),
        source: lead.source || 'Unknown',
        createdAt: lead.created_at,
        lastContact: lead.last_contacted || lead.created_at,
        assignedTo: lead.assigned_to || 'unassigned',
        type: determineType(lead),
        interestType: determineInterestType(lead),
        location: determineLocation(lead),
        score: calculateScore(lead),
        notes: lead.notes || '',
        qualification_data: lead.qualification_data || [],
        conversations: lead.conversations || []
      }));

      console.log('✅ Transformed leads:', transformedLeads);
      setLeads(transformedLeads);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error fetching leads:', err);
      setError(errorMessage);
      
      toast({
        title: 'Error Loading Leads',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLead = async (leadData: Partial<Lead>) => {
    try {
      console.log('➕ Creating new lead:', leadData);
      
      const nameParts = leadData.name?.split(' ') || [''];
      const supabaseData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: leadData.email,
        phone: leadData.phone,
        phone_raw: leadData.phone_raw,
        phone_e164: leadData.phone_e164,
        status: leadData.status?.toLowerCase() || 'new',
        source: leadData.source || 'Manual Entry',
        notes: leadData.notes,
        cinc_lead_id: leadData.cinc_lead_id,
        last_contacted: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(supabaseData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Lead Created',
        description: `${data.first_name} ${data.last_name} has been added successfully.`,
      });

      return data;
    } catch (err) {
      console.error('❌ Error creating lead:', err);
      throw err;
    }
  };

  const updateLead = async (leadId: string, updates: Partial<Lead>) => {
    try {
      console.log('🔄 Updating lead:', leadId, updates);
      
      const nameParts = updates.name?.split(' ') || [''];
      const supabaseData = {
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: updates.email,
        phone: updates.phone,
        phone_raw: updates.phone_raw,
        phone_e164: updates.phone_e164,
        status: updates.status?.toLowerCase(),
        source: updates.source,
        notes: updates.notes,
        last_contacted: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('leads')
        .update(supabaseData)
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Lead Updated',
        description: `${data.first_name} ${data.last_name} has been updated successfully.`,
      });

      return data;
    } catch (err) {
      console.error('❌ Error updating lead:', err);
      throw err;
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      console.log('🗑️ Deleting lead:', leadId);
      
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Lead Deleted',
        description: 'Lead has been removed successfully.',
      });
    } catch (err) {
      console.error('❌ Error deleting lead:', err);
      throw err;
    }
  };

  // Set up real-time subscription with enhanced monitoring
  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('📡 Real-time lead change:', payload);
          
          // Show toast notification for real-time updates
          if (payload.eventType === 'INSERT') {
            const newLead = payload.new as any;
            toast({
              title: 'New Lead Added',
              description: `${newLead.first_name} ${newLead.last_name} has been added to the system.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedLead = payload.new as any;
            toast({
              title: 'Lead Updated',
              description: `${updatedLead.first_name} ${updatedLead.last_name} has been updated.`,
            });
          }
          
          // Refresh leads data
          fetchLeads();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('📡 Real-time conversation change:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Conversation',
              description: 'A new conversation has been recorded.',
            });
          }
          
          // Refresh leads data to include updated conversation counts
          fetchLeads();
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setRealTimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'connecting');
      });

    return () => {
      console.log('📡 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      setRealTimeStatus('disconnected');
    };
  }, []);

  return {
    leads,
    isLoading,
    error,
    realTimeStatus,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead
  };
}

// Helper functions remain the same
const mapStatus = (status: string | null): Lead['status'] => {
  const statusMap: Record<string, Lead['status']> = {
    'new': 'New',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'proposal': 'Proposal',
    'converted': 'Converted',
    'lost': 'Lost'
  };
  return statusMap[status?.toLowerCase() || 'new'] || 'New';
};

const determineType = (lead: any): 'Mortgage' | 'Realtor' => {
  if (lead.qualification_data?.length > 0) return 'Mortgage';
  if (lead.source?.toLowerCase().includes('realtor')) return 'Realtor';
  return 'Mortgage';
};

const determineInterestType = (lead: any): string => {
  const qual = lead.qualification_data?.[0];
  return qual?.loan_type || qual?.property_type || 'Unknown';
};

const determineLocation = (lead: any): string => {
  return lead.location || lead.qualification_data?.[0]?.property_address || 'Unknown';
};

const calculateScore = (lead: any): number => {
  let score = 50;
  
  const qual = lead.qualification_data?.[0];
  if (qual) {
    if (qual.estimated_credit_score?.includes('700')) score += 15;
    if (qual.annual_income > 100000) score += 10;
    if (qual.down_payment_percentage > 20) score += 10;
  }
  
  if (lead.conversations?.length > 0) {
    score += 5 * Math.min(lead.conversations.length, 5);
  }
  
  if (lead.status === 'qualified') score += 10;
  if (lead.status === 'proposal') score += 5;

  return Math.max(0, Math.min(100, score));
};
