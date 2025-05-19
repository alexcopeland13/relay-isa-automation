
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, User } from 'lucide-react';
import { Lead } from '@/types/lead'; // Import Lead type

interface LeadSearchFiltersProps {
  searchQuery: string;
  filterStatus: string;
  filterSource: string;
  filterType: string;
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onFilterSourceChange: (value: string) => void;
  onFilterTypeChange: (value: string) => void;
  availableSources: string[]; // Added prop
  availableStatuses: Lead['status'][]; // Added prop
  availableTypes: Lead['type'][]; // Added prop
}

export const LeadSearchFilters = ({
  searchQuery,
  filterStatus,
  filterSource,
  filterType,
  onSearchChange,
  onFilterStatusChange,
  onFilterSourceChange,
  onFilterTypeChange,
  availableSources, // Destructure new prop
  availableStatuses, // Destructure new prop
  availableTypes, // Destructure new prop
}: LeadSearchFiltersProps) => {
  // Currently, availableSources, availableStatuses, availableTypes are not used to dynamically populate SelectItems.
  // This could be a future enhancement. For now, the props are defined to satisfy the parent component.
  return (
    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Input
          placeholder="Search leads by name, email, or phone..." // Updated placeholder
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {/* Dynamically populate statuses if needed in future:
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
            For now, keeping hardcoded values as per original design.
            */}
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Proposal">Proposal</SelectItem>
            <SelectItem value="Converted">Converted</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterSource} onValueChange={onFilterSourceChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {/* Dynamically populate sources if needed:
            {availableSources.map(source => (
              <SelectItem key={source} value={source}>{source}</SelectItem>
            ))}
            For now, keeping hardcoded values. Add CINC if it becomes a common source.
            */}
            <SelectItem value="CINC">CINC</SelectItem>
            <SelectItem value="Manual Entry">Manual Entry</SelectItem>
            <SelectItem value="Website">Website</SelectItem>
            <SelectItem value="Facebook Ad">Facebook Ad</SelectItem>
            <SelectItem value="Referral">Referral</SelectItem>
            <SelectItem value="Google Ads">Google Ads</SelectItem>
            <SelectItem value="Direct">Direct</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={onFilterTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Lead Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {/* Dynamically populate types if needed:
            {availableTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
            */}
            <SelectItem value="Mortgage">Mortgage</SelectItem>
            <SelectItem value="Realtor">Realtor</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="icon" title="More filters">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
