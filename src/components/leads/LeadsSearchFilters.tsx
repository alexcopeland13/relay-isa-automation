
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, User, X, Save } from 'lucide-react';
import { Lead } from '@/types/lead';

interface LeadSearchFiltersProps {
  searchQuery: string;
  filterStatus: string;
  filterSource: string;
  filterType: string;
  onSearchChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
  onFilterSourceChange: (value: string) => void;
  onFilterTypeChange: (value: string) => void;
  availableSources: string[];
  availableStatuses: Lead['status'][];
  availableTypes: Lead['type'][];
}

export const LeadsSearchFilters = ({
  searchQuery,
  filterStatus,
  filterSource,
  filterType,
  onSearchChange,
  onFilterStatusChange,
  onFilterSourceChange,
  onFilterTypeChange,
  availableSources,
  availableStatuses,
  availableTypes,
}: LeadSearchFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL search parameter on component mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchQuery) {
      onSearchChange(urlSearch);
    }
  }, [searchParams, searchQuery, onSearchChange]);

  const clearAllFilters = () => {
    onSearchChange('');
    onFilterStatusChange('all');
    onFilterSourceChange('all');
    onFilterTypeChange('all');
    setSearchParams({});
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    filterStatus !== 'all' || 
    filterSource !== 'all' || 
    filterType !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Input
            placeholder="Search leads by name, email, or phone..."
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
              <SelectItem value="Mortgage">Mortgage</SelectItem>
              <SelectItem value="Realtor">Realtor</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" title="More filters">
            <Filter className="h-4 w-4" />
          </Button>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="gap-1">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}

          <Button variant="outline" size="sm" className="gap-1" title="Save current filters">
            <Save className="h-3 w-3" />
            Save
          </Button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchQuery && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Search: "{searchQuery}"
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Status: {filterStatus}
            </span>
          )}
          {filterSource !== 'all' && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Source: {filterSource}
            </span>
          )}
          {filterType !== 'all' && (
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              Type: {filterType}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
