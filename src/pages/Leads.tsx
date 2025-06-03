import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { LeadsList } from '@/components/leads/LeadsList';
import { Lead } from '@/types/lead'; 
import { LeadsBoard } from '@/components/leads/LeadsBoard';
import { LeadFormModal } from '@/components/leads/LeadFormModal';
import { LeadAssignmentModal } from '@/components/leads/LeadAssignmentModal';
import { LeadsHeader } from '@/components/leads/LeadsHeader';
import { LeadsStatsPanel } from '@/components/leads/LeadsStatsPanel';
import { LeadsViewTabs } from '@/components/leads/LeadsViewTabs';
import { RetellCallHistory } from '@/components/leads/RetellCallHistory';
import { useLeadsData } from '@/hooks/use-leads-data';
import { useToast } from '@/hooks/use-toast';
import { ErrorContainer } from '@/components/ui/error-container';
import { ExportOptions } from '@/components/ui/export-menu';
import { 
  TableSkeleton, 
  StatCardSkeleton, 
  ChartSkeleton 
} from '@/components/ui/loading-skeleton';
import { RefreshCw, Phone } from 'lucide-react';

const Leads = () => {
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  
  const { 
    leads, 
    isLoading, 
    error, 
    fetchLeads,
    createLead,
    updateLead,
    deleteLead 
  } = useLeadsData();

  const handleLeadSave = async (leadToSave: Lead) => { 
    try {
      const isNewLead = !leadToSave.id || !leads.find(l => l.id === leadToSave.id);
      
      if (isNewLead) {
        await createLead(leadToSave);
      } else {
        await updateLead(leadToSave.id, leadToSave);
      }
      
      setSelectedLead(undefined);
      setShowLeadForm(false);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: 'Save Error',
        description: 'Failed to save lead. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleAssignLead = async (leadId: string, agentId: string, assignmentData: { priority: string; notes: string }) => {
    try {
      await updateLead(leadId, { assignedTo: agentId });
      setSelectedLead(undefined); 
      setShowAssignmentModal(false);
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast({
        title: 'Assignment Error',
        description: 'Failed to assign lead. Please try again.',
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
  
  const handleNewLeadClick = () => {
    setSelectedLead(undefined);
    setShowLeadForm(true);
  };
  
  const exportData = async (format: string, options: ExportOptions) => {
    setExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log(`Exporting ${leads.length} leads as ${format} with options:`, options);
      
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

  if (isLoading) {
    return (
      <PageLayout>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-2xl font-bold">Leads Management</h1>
              <p className="text-muted-foreground mt-1">Loading your leads...</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <TableSkeleton rows={6} cols={7} />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground mt-1">View, filter, and manage all your leads in one place</p>
        </div>
        
        <ErrorContainer
          title="Failed to Load Leads"
          description="We couldn't retrieve your leads data. Please try again."
          error={new Error(error)}
          onRetry={fetchLeads}
          suggestions={[
            "Check your internet connection.",
            "Verify database connectivity.",
            "Try refreshing the page.",
            "If the problem persists, contact support.",
          ]}
        />
        
        <div className="flex justify-end mt-4">
          <Button onClick={fetchLeads} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <LeadsHeader
        isLoading={isLoading}
        onManualRefresh={fetchLeads}
        leads={leads}
        onExportData={exportData}
        onNewLeadClick={handleNewLeadClick}
      />
      
      <LeadsStatsPanel leads={leads} />
      
      <div className="flex justify-between items-center mb-4">
        <LeadsViewTabs
          leads={leads}
          activeView={activeView}
          onActiveViewChange={setActiveView}
          onSelectLead={handleSelectLead}
          onOpenAssignmentModal={handleOpenAssignmentModal}
          onScheduleFollowUp={handleScheduleFollowUp}
        />
        
        <Button
          variant="outline"
          onClick={() => setShowCallHistory(!showCallHistory)}
          className="gap-2"
        >
          <Phone className="h-4 w-4" />
          {showCallHistory ? 'Hide' : 'Show'} Call History
        </Button>
      </div>

      {showCallHistory && (
        <div className="mb-6">
          <RetellCallHistory />
        </div>
      )}
      
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
