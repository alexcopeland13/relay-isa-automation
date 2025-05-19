import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsList } from '@/components/leads/LeadsList';
import { Lead } from '@/types/lead'; 
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { LeadMetrics } from '@/components/leads/LeadMetrics';
import { LeadDistribution } from '@/components/leads/LeadDistribution';
import { LeadFormModal } from '@/components/leads/LeadFormModal';
import { LeadAssignmentModal } from '@/components/leads/LeadAssignmentModal';
import { 
  PlusCircle, 
  UserPlus, 
  UploadCloud, 
  ArrowDownToLine, 
  ListFilter,
  RefreshCw,
  Filter
} from 'lucide-react';
import { parsePhoneNumberWithError, PhoneNumber, CountryCode } from 'libphonenumber-js/max';
import { sampleLeads } from '@/data/sampleLeadsData';
import { useAsyncData } from '@/hooks/use-async-data';
import { ErrorContainer } from '@/components/ui/error-container';
import { ExportMenu, ExportOptions } from '@/components/ui/export-menu';
import { 
  TableSkeleton, 
  StatCardSkeleton, 
  ChartSkeleton 
} from '@/components/ui/loading-skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const fetchLeadsData = async () => {
  try {
    console.log('📞 Fetching leads data from Supabase...');
    // Try to fetch from Supabase first
    const { data: supabaseLeads, error } = await supabase
      .from('leads')
      .select(`
        *,
        qualification_data(*),
        conversations(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase fetch error:', error);
      throw new Error(`Failed to fetch leads from Supabase: ${error.message}`);
    }

    console.log('📋 Supabase returned data:', supabaseLeads);
    console.log('📋 Number of leads found:', supabaseLeads?.length || 0);

    if (!supabaseLeads || supabaseLeads.length === 0) {
      console.warn('⚠️ No leads found in Supabase, checking if this is expected...');
      // You might want to check if this is expected or add diagnostic info here
    }

    // Convert Supabase data to match the Lead type
    const formattedLeads: Lead[] = supabaseLeads.map(lead => ({
      id: lead.id,
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead',
      email: lead.email || '',
      phone: lead.phone || '', // Keep for display if needed, but UI should prefer phone_raw/phone_e164
      phone_raw: lead.phone_raw || lead.phone, // Fallback to old phone if phone_raw is not present
      phone_e164: lead.phone_e164,
      cinc_lead_id: lead.cinc_lead_id,
      status: mapLeadStatus(lead.status),
      source: lead.source || '',
      createdAt: lead.created_at,
      lastContact: lead.last_contacted || lead.created_at,
      assignedTo: lead.assigned_to || 'unassigned',
      type: determineLeadType(lead),
      interestType: determineInterestType(lead),
      location: determineLocation(lead), // This was missing, added back
      score: calculateLeadScore(lead),
      notes: lead.notes || '',
      qualification_data: lead.qualification_data || [],
      conversations: lead.conversations || []
    }));

    console.log('🔄 Fetched and formatted leads from Supabase:', formattedLeads);
    return { leads: formattedLeads };
  } catch (error) {
    console.warn('⚠️ Error with Supabase, falling back to local storage/sample data:', error);
    
    // Fallback to local storage if Supabase fetch fails
    const storedLeads = localStorage.getItem('relayLeads');
    
    // Log diagnostic information
    if (storedLeads) {
      console.log('🔄 Using leads from localStorage as fallback');
      try {
        const parsedLeads = JSON.parse(storedLeads);
        console.log('🔄 Number of leads in localStorage:', parsedLeads.length);
        return { leads: parsedLeads };
      } catch (parseError) {
        console.error('❌ Error parsing localStorage leads:', parseError);
      }
    } else {
      console.log('🔄 No leads in localStorage, using sample data');
    }
    
    return {
      leads: storedLeads ? JSON.parse(storedLeads) : sampleLeads,
    };
  }
};

// Helper functions for mapping data
const mapLeadStatus = (status: string | null): Lead['status'] => {
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

const determineLeadType = (lead: any): 'Mortgage' | 'Realtor' => {
  if (lead.qualification_data && lead.qualification_data.length > 0) {
    return 'Mortgage';
  }
  // Check source or other indicators if needed
  if (lead.source?.toLowerCase().includes('realtor')) return 'Realtor';
  return 'Mortgage'; // Default type
};

const determineInterestType = (lead: any): string => {
  if (lead.qualification_data && lead.qualification_data.length > 0) {
    const qualification = lead.qualification_data[0];
    if (qualification.loan_type) return qualification.loan_type;
    if (qualification.property_type) return qualification.property_type;
  }
  // Infer from other fields if possible, e.g. notes or source specific data
  return lead.interest_type || 'Unknown'; // Assuming an interest_type field might exist
};

const determineLocation = (lead: any): string => {
  // Assuming location might be part of lead object or qualification_data
  return lead.location || (lead.qualification_data?.[0]?.property_location) || 'Unknown';
};

const calculateLeadScore = (lead: any): number => {
  let score = 50;
  if (lead.qualification_data && lead.qualification_data.length > 0) {
    const qual = lead.qualification_data[0];
    if (qual.estimated_credit_score) {
      if (qual.estimated_credit_score.includes('700')) score += 15;
      else if (qual.estimated_credit_score.includes('600')) score += 10;
    }
    if (qual.annual_income && qual.annual_income > 100000) score += 10;
    if (qual.down_payment_percentage && qual.down_payment_percentage > 20) score += 10;
  }
  if (lead.conversations && lead.conversations.length > 0) {
    score += 5 * Math.min(lead.conversations.length, 5);
  }
  // Adjust score based on status
  if (lead.status === 'Qualified') score += 10;
  if (lead.status === 'Proposal') score += 5;

  return Math.max(0, Math.min(100, score));
};

const Leads = () => {
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const { toast } = useToast();
  
  const { 
    data, 
    isLoading, 
    error, 
    refresh // Removed retry as it's not used directly, refresh is used.
  } = useAsyncData(fetchLeadsData, null, [refreshTrigger]);

  const [leadsData, setLeadsData] = useState<{ leads: Lead[] } | null>(null);
  
  // Effect to update state when data changes
  useEffect(() => {
    if (data) {
      console.log("Setting leads data:", data);
      setLeadsData(data);
      
      // Store in localStorage as fallback
      localStorage.setItem('relayLeads', JSON.stringify(data.leads));
    }
  }, [data]);
  
  // Force refresh on mount and when refreshTrigger changes
  useEffect(() => {
    const refreshTimeout = setTimeout(() => {
      refresh();
    }, 300);
    
    const channel = supabase
      .channel('schema-db-changes-leads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload: any) => { // Use any for payload if specific type is complex
          console.log('Lead data changed via Supabase real-time:', payload);
          refresh();
          
          const eventType = payload.eventType;
          let leadName = 'A lead';
          if (payload.new && (payload.new.first_name || payload.new.last_name)) {
            leadName = `${payload.new.first_name || ''} ${payload.new.last_name || ''}`.trim();
          } else if (payload.old && (payload.old.first_name || payload.old.last_name)) {
            // For DELETE events, use old data if available
            leadName = `${payload.old.first_name || ''} ${payload.old.last_name || ''}`.trim();
          }


          if (eventType === 'INSERT') {
            toast({
              title: 'New Lead Added',
              description: `${leadName} has been added to the system.`,
            });
          } else if (eventType === 'UPDATE') {
            toast({
              title: 'Lead Updated',
              description: `${leadName} has been updated.`,
            });
          } else if (eventType === 'DELETE') {
             toast({
              title: 'Lead Deleted',
              description: `${leadName} has been removed from the system.`,
              variant: 'destructive' 
            });
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('📢 Successfully subscribed to leads table changes!');
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
          console.error('❌ Realtime subscription error:', status, err);
          toast({
            title: "Realtime Error",
            description: "Could not connect to live updates. Data may be stale.",
            variant: "destructive"
          });
        }
      });
    
    return () => {
      clearTimeout(refreshTimeout);
      supabase.removeChannel(channel)
        .then(() => console.log("📢 Unsubscribed from leads table changes."))
        .catch(err => console.error("Error unsubscribing from channel:", err));
    };
  }, [refresh, refreshTrigger, toast]);

  const handleManualRefresh = useCallback(() => {
    toast({
      title: 'Refreshing Data',
      description: 'Fetching the latest leads...',
    });
    setRefreshTrigger(Date.now());
  }, [toast]);

  const handleLeadSave = async (leadToSave: Lead) => { // leadToSave now comes from LeadFormModal with phone_raw and phone_e164
    try {
        const isNewLead = !leadToSave.id || !leadsData?.leads.find(l => l.id === leadToSave.id);
        
        // Prepare data for Supabase (snake_case, split name, etc.)
        const nameParts = leadToSave.name.split(' ');
        const first_name = nameParts[0] || '';
        const last_name = nameParts.slice(1).join(' ') || '';

        const supabaseLeadData = {
            first_name: first_name,
            last_name: last_name,
            email: leadToSave.email,
            phone: leadToSave.phone, // Keep old phone field for now if db schema still has it
            phone_raw: leadToSave.phone_raw,
            phone_e164: leadToSave.phone_e164,
            status: leadToSave.status.toLowerCase(),
            source: leadToSave.source,
            notes: leadToSave.notes,
            cinc_lead_id: leadToSave.cinc_lead_id,
            // Add other mappable fields: location, type, interestType if they map to DB columns
            // assigned_to: leadToSave.assignedTo, // Handled by assignment modal
            last_contacted: new Date().toISOString(), // Update last contact on save
        };

        if (isNewLead) {
            // Create new lead
            const { data: newLeadData, error } = await supabase
                .from('leads')
                .insert(supabaseLeadData)
                .select() // Select all fields of the new lead
                .single();

            if (error) {
                console.error('Error creating lead in Supabase:', error);
                toast({
                    title: 'Creation Error',
                    description: `Failed to create lead: ${error.message}.`,
                    variant: 'destructive',
                });
                // Optionally, update locally as a fallback, but data will be out of sync
                // const updatedLeads = [...(leadsData?.leads || []), leadToSave]; // This leadToSave might not have the DB ID
                // setLeadsData({ leads: updatedLeads });
                // localStorage.setItem('relayLeads', JSON.stringify(updatedLeads));
                return; // Stop execution if create fails
            }
            toast({
                title: 'Lead Created',
                description: `${newLeadData.first_name} ${newLeadData.last_name} has been successfully created.`,
            });
        } else {
            // Update existing lead
            const { data: updatedLeadData, error } = await supabase
                .from('leads')
                .update(supabaseLeadData)
                .eq('id', leadToSave.id)
                .select()
                .single();
            
            if (error) {
                console.error('Error updating lead in Supabase:', error);
                toast({
                    title: 'Update Error',
                    description: `Failed to update lead: ${error.message}.`,
                    variant: 'destructive',
                });
                // Optionally, update locally as a fallback
                return; // Stop execution if update fails
            }
            toast({
                title: 'Lead Updated',
                description: `${updatedLeadData.first_name} ${updatedLeadData.last_name} has been successfully updated.`,
            });
        }
        
        // Refresh data from Supabase to get the latest state including any backend-generated fields
        // This also updates local state and localStorage via the useEffect hook watching `data`
        refresh(); 
        setSelectedLead(undefined); // Clear selected lead after save

    } catch (error) {
        console.error('Error saving lead:', error);
        toast({
            title: 'Save Error',
            description: 'An unexpected error occurred while saving the lead. Please check console.',
            variant: 'destructive',
        });
    }
  };
  
  const handleAssignLead = async (leadId: string, agentId: string, assignmentData: { priority: string; notes: string }) => {
    try {
      // ... keep existing code for local update if desired, but Supabase update + refresh is better
        
      const { error } = await supabase
        .from('leads')
        .update({
          assigned_to: agentId,
          last_contacted: new Date().toISOString()
          // You might want to add assignment notes to a separate table or a JSONB field in leads
        })
        .eq('id', leadId);
      
      if (error) {
        console.error('Error updating lead assignment in Supabase:', error);
        toast({
          title: 'Assignment Error',
          description: 'Failed to update lead assignment in database.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Lead Assigned',
          description: 'Lead has been successfully assigned.',
        });
        refresh(); // Refresh data to reflect changes
      }
      setSelectedLead(undefined); // Close assignment modal or clear selection
      setShowAssignmentModal(false);

    } catch (error) {
      console.error('Error assigning lead:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while assigning the lead.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadForm(true);
  };
  
  const handleOpenAssignmentModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowAssignmentModal(true);
  };
  
  const handleScheduleFollowUp = (lead: Lead) => {
    toast({
      title: "Follow-up scheduled",
      description: `A follow-up has been scheduled for ${lead.name}`,
    });
  };
  
  const exportData = async (format: string, options: ExportOptions) => {
    setExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const dataToExport = leadsData?.leads || [];
      // Actual export logic based on format (CSV, PDF) and options
      // For CSV: convert dataToExport to CSV string and trigger download
      // For Email: send dataToExport to a backend service that emails it
      console.log(`Exporting ${dataToExport.length} leads as ${format} with options:`, options);
      
      toast({
        title: format === 'email' ? 'Export Sent' : 'Export Complete',
        description: format === 'email'
          ? `Export has been sent to ${options.recipient}`
          : `Leads exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was a problem exporting your data.',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const renderLoading = () => (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            {/* Replace with actual component or remove if not needed */}
            <Button variant="outline" disabled>Loading Actions...</Button>
          </div>
        </div>
      </div>
      
      {/* Simplified loading state */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartSkeleton className="lg:col-span-2" />
          <ChartSkeleton />
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <TableSkeleton rows={6} cols={7} /> {/* Adjusted cols for new table structure */}
        </div>
      </div>
    </PageLayout>
  );

  if (isLoading && !leadsData) { // Show loading only if no data is present yet
    return renderLoading();
  }

  if (error && !leadsData) { // Show error only if no data could be fetched at all
    return (
      <PageLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
        </div>
        
        <ErrorContainer
          title="Failed to Load Leads"
          description="We couldn't retrieve your leads data. Please try again."
          error={error} // Pass the actual error object
          onRetry={handleManualRefresh} // Use manual refresh for retry
          suggestions={[
            "Check your internet connection.",
            "Try refreshing the page.",
            "If the problem persists, contact support.",
          ]}
        />
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleManualRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  const leads = leadsData?.leads || [];

  return (
    <PageLayout>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Leads Management</h1>
            <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              size="icon"
              title="Refresh data" 
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          
            <ExportMenu 
              data={leads} 
              filename="relay_leads_export"
              exportableCols={['name', 'email', 'phone_raw', 'phone_e164', 'cinc_lead_id', 'status', 'source', 'type', 'score', 'createdAt', 'lastContact', 'assignedTo']}
              supportedFormats={['csv', 'email']}
              onExport={exportData}
            />
            
            <Button className="gap-1" onClick={() => {
              setSelectedLead(undefined); 
              setShowLeadForm(true);
            }}>
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Lead</span>
            </Button>
            
            <Button variant="outline" size="icon" title="Import Leads (Coming Soon)" disabled>
              <UploadCloud className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <LeadMetrics leads={leads} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <LeadDistribution leads={leads} />
        
        <div className="bg-card p-4 rounded-lg border lg:col-span-1">
            <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
            <p>Total Leads: {leads.length}</p>
            <p>New Leads (Today): 0</p> {/* Removed JSX comment from this line */}
            {/* Placeholder for more quick stats */}
        </div>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'list' | 'board')}>
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="board">Board View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1" disabled>
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            
            <Button variant="outline" className="gap-1" disabled>
              <ListFilter className="h-4 w-4" />
              <span>Saved Filters</span>
            </Button>
          </div>
        </div>
        
        <div>
            <TabsContent value="list" className="mt-0" style={{ display: activeView === 'list' ? 'block' : 'none' }}>
              <LeadsList 
                leads={leads}
                onSelectLead={handleSelectLead}
                onAssignLead={handleOpenAssignmentModal}
                onScheduleFollowUp={handleScheduleFollowUp}
              />
            </TabsContent>
            
            <TabsContent value="board" className="mt-0" style={{ display: activeView === 'board' ? 'block' : 'none' }}>
              <LeadsBoard
                leads={leads}
                onSelectLead={handleSelectLead}
                // Pass other necessary props if LeadsBoard requires them
              />
            </TabsContent>
        </div>
      </div>
      
      {showLeadForm && (
        <LeadFormModal 
          isOpen={showLeadForm}
          onClose={() => {
            setShowLeadForm(false);
            setSelectedLead(undefined);
          }}
          onSave={handleLeadSave}
          lead={selectedLead}
        />
      )}
      
      {showAssignmentModal && selectedLead && (
        <LeadAssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedLead(undefined);
          }}
          lead={selectedLead}
          onAssign={handleAssignLead}
          // Add any other required props for LeadAssignmentModal
        />
      )}
    </PageLayout>
  );
};

export default Leads;
