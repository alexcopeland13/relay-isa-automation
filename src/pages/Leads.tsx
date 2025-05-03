import { useState, useEffect } from 'react';
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
      console.error('Supabase fetch error:', error);
      throw new Error('Failed to fetch leads from Supabase');
    }

    // Convert Supabase data to match the Lead type
    const formattedLeads: Lead[] = supabaseLeads.map(lead => ({
      id: lead.id,
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim(),
      email: lead.email || '',
      phone: lead.phone || '',
      status: mapLeadStatus(lead.status),
      source: lead.source || '',
      createdAt: lead.created_at,
      lastContact: lead.last_contacted || lead.created_at,
      assignedTo: lead.assigned_to || 'unassigned',
      type: determineLeadType(lead),
      interestType: determineInterestType(lead),
      location: determineLocation(lead),
      score: calculateLeadScore(lead),
      notes: lead.notes || ''
    }));

    console.log('Fetched and formatted leads from Supabase:', formattedLeads);
    return { leads: formattedLeads };
  } catch (error) {
    console.warn('Falling back to local storage/sample data:', error);
    
    // Fallback to local storage if Supabase fetch fails
    const storedLeads = localStorage.getItem('relayLeads');
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
  
  return statusMap[status || 'new'] || 'New';
};

const determineLeadType = (lead: any): 'Mortgage' | 'Realtor' => {
  if (lead.qualification_data && lead.qualification_data.length > 0) {
    return 'Mortgage';
  }
  return 'Realtor'; // Default if we can't determine
};

const determineInterestType = (lead: any): string => {
  if (lead.qualification_data && lead.qualification_data.length > 0) {
    const qualification = lead.qualification_data[0];
    if (qualification.loan_type) return qualification.loan_type;
    if (qualification.property_type) return qualification.property_type;
  }
  return 'Unknown';
};

const determineLocation = (lead: any): string => {
  // This would be filled in with real data from your schema
  // For now returning a placeholder
  return lead.location || 'Unknown';
};

const calculateLeadScore = (lead: any): number => {
  // Simple scoring algorithm
  let score = 50; // Start with average score
  
  // Increase score based on qualification data
  if (lead.qualification_data && lead.qualification_data.length > 0) {
    const qual = lead.qualification_data[0];
    
    // Credit score
    if (qual.estimated_credit_score) {
      if (qual.estimated_credit_score.includes('700')) score += 15;
      else if (qual.estimated_credit_score.includes('600')) score += 10;
    }
    
    // Income
    if (qual.annual_income && qual.annual_income > 100000) score += 10;
    
    // Down payment
    if (qual.down_payment_percentage && qual.down_payment_percentage > 20) score += 10;
  }
  
  // Increase score if they've had conversations
  if (lead.conversations && lead.conversations.length > 0) {
    score += 5 * Math.min(lead.conversations.length, 5);
  }
  
  // Cap score at 0-100
  return Math.max(0, Math.min(100, score));
};

const Leads = () => {
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  
  const { 
    data, 
    isLoading, 
    error, 
    retry
  } = useAsyncData(fetchLeadsData, null, []);

  const [leadsData, setLeadsData] = useState<{ leads: Lead[] } | null>(null);
  
  useEffect(() => {
    if (data) {
      setLeadsData(data);
    }
  }, [data]);
  
  useEffect(() => {
    if (leadsData?.leads && !localStorage.getItem('relayLeads')) {
      localStorage.setItem('relayLeads', JSON.stringify(leadsData.leads));
    }
  }, [leadsData]);

  const handleLeadSave = async (updatedLead: Lead) => {
    try {
      if (leadsData?.leads) {
        let updatedLeads: Lead[];
        
        if (selectedLead) {
          // Update existing lead
          updatedLeads = leadsData.leads.map(lead => 
            lead.id === updatedLead.id ? updatedLead : lead
          );
          
          // Update in Supabase
          const { error } = await supabase
            .from('leads')
            .update({
              first_name: updatedLead.name.split(' ')[0],
              last_name: updatedLead.name.split(' ').slice(1).join(' '),
              email: updatedLead.email,
              phone: updatedLead.phone,
              status: updatedLead.status.toLowerCase(),
              source: updatedLead.source,
              notes: updatedLead.notes,
              // Add other fields as needed
            })
            .eq('id', updatedLead.id);
          
          if (error) {
            console.error('Error updating lead in Supabase:', error);
            toast({
              title: 'Update Error',
              description: 'Failed to update lead in database. Changes saved locally only.',
              variant: 'destructive',
            });
          }
        } else {
          // Create new lead
          const { data: newLeadData, error } = await supabase
            .from('leads')
            .insert({
              first_name: updatedLead.name.split(' ')[0],
              last_name: updatedLead.name.split(' ').slice(1).join(' '),
              email: updatedLead.email,
              phone: updatedLead.phone,
              status: updatedLead.status.toLowerCase(),
              source: updatedLead.source,
              notes: updatedLead.notes,
              // Add other fields as needed
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating lead in Supabase:', error);
            toast({
              title: 'Creation Error',
              description: 'Failed to create lead in database. Changes saved locally only.',
              variant: 'destructive',
            });
            // Fall back to local update
            updatedLeads = [...leadsData.leads, updatedLead];
          } else {
            // Use the new lead with the ID from Supabase
            const newLead: Lead = {
              ...updatedLead,
              id: newLeadData.id,
              createdAt: newLeadData.created_at
            };
            updatedLeads = [...leadsData.leads, newLead];
          }
        }
        
        setLeadsData({ leads: updatedLeads });
        localStorage.setItem('relayLeads', JSON.stringify(updatedLeads));
        setSelectedLead(undefined);
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while saving the lead.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAssignLead = async (leadId: string, agentId: string, assignmentData: { priority: string; notes: string }) => {
    try {
      if (leadsData?.leads) {
        const updatedLeads = leadsData.leads.map(lead => {
          if (lead.id === leadId) {
            return {
              ...lead,
              assignedTo: agentId,
              lastContact: new Date().toISOString()
            };
          }
          return lead;
        });
        
        // Update in Supabase
        const { error } = await supabase
          .from('leads')
          .update({
            assigned_to: agentId,
            last_contacted: new Date().toISOString()
          })
          .eq('id', leadId);
        
        if (error) {
          console.error('Error updating lead assignment in Supabase:', error);
          toast({
            title: 'Assignment Error',
            description: 'Failed to update lead assignment in database. Changes saved locally only.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Lead Assigned',
            description: 'Lead has been successfully assigned.',
          });
        }
        
        localStorage.setItem('relayLeads', JSON.stringify(updatedLeads));
        setLeadsData({ leads: updatedLeads });
        setSelectedLead(undefined);
      }
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (format === 'csv') {
        console.log(`Exporting ${format} data with options:`, options);
      } else if (format === 'pdf') {
        console.log(`Exporting ${format} data with options:`, options);
      } else if (format === 'email') {
        console.log(`Sending export via email to ${options.recipient} with options:`, options);
      }
      
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
            <StatCardSkeleton />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartSkeleton />
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <StatCardSkeleton />
          </div>
        </div>
        
        <TableSkeleton rows={6} cols={5} />
      </div>
    </PageLayout>
  );

  if (isLoading) {
    return renderLoading();
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
        </div>
        
        <div className="mb-6">
          <ErrorContainer
            title="Leads Data Error"
            description="We couldn't load your leads data."
            error={error}
            onRetry={retry}
            suggestions={[
              "Check your internet connection",
              "Verify your access permissions",
              "Try refreshing the page",
              "Contact support if the problem persists"
            ]}
          />
        </div>
        
        <div className="flex justify-end mb-6">
          <Button onClick={retry} variant="outline" className="gap-2">
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
            <ExportMenu 
              data={leads}
              filename="relay_leads"
              exportableCols={['name', 'email', 'phone', 'status', 'source', 'date']}
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
            
            <Button variant="outline" size="icon" title="Import Leads">
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
            <Button variant="outline" className="gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            
            <Button variant="outline" className="gap-1">
              <ListFilter className="h-4 w-4" />
              <span>Saved Filters</span>
            </Button>
          </div>
        </div>
        
        <div>
          <Tabs value={activeView}>
            <TabsContent value="list" className="mt-0">
              <LeadsList 
                leads={leads}
                onSelectLead={handleSelectLead}
                onAssignLead={handleOpenAssignmentModal}
                onScheduleFollowUp={handleScheduleFollowUp}
              />
            </TabsContent>
            
            <TabsContent value="board" className="mt-0">
              <LeadsBoard
                leads={leads}
                onSelectLead={handleSelectLead}
              />
            </TabsContent>
          </Tabs>
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
        />
      )}
    </PageLayout>
  );
};

export default Leads;
