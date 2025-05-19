
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExportMenu, ExportOptions } from '@/components/ui/export-menu';
import { Lead } from '@/types/lead';
import { RefreshCw, UserPlus, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadsHeaderProps {
  isLoading: boolean;
  onManualRefresh: () => void;
  leads: Lead[];
  onExportData: (format: string, options: ExportOptions) => Promise<void>;
  onNewLeadClick: () => void;
  className?: string;
}

export const LeadsHeader = ({
  isLoading,
  onManualRefresh,
  leads,
  onExportData,
  onNewLeadClick,
  className,
}: LeadsHeaderProps) => {
  return (
    <div className={cn("mb-6", className)}>
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
            onClick={onManualRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <ExportMenu
            data={leads}
            filename="relay_leads_export"
            exportableCols={['name', 'email', 'phone_raw', 'phone_e164', 'cinc_lead_id', 'status', 'source', 'type', 'score', 'createdAt', 'lastContact', 'assignedTo']}
            supportedFormats={['csv', 'email']}
            onExport={onExportData}
          />

          <Button className="gap-1" onClick={onNewLeadClick}>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Lead</span>
          </Button>

          <Button variant="outline" size="icon" title="Import Leads (Coming Soon)" disabled>
            <UploadCloud className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
