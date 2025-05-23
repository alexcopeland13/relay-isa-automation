
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FilterOptions, SortOption } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';

interface ShowingFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const ShowingFilters: React.FC<ShowingFiltersProps> = ({
  filters,
  onFiltersChange,
  sortOption,
  onSortChange
}) => {
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterOptions];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Sort
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sort Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={sortOption.field}
              onValueChange={(value) => 
                onSortChange({ ...sortOption, field: value as SortOption['field'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payout_amount">Payout Amount</SelectItem>
                <SelectItem value="showing_date">Showing Date</SelectItem>
                <SelectItem value="created_at">Posted Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={sortOption.direction}
              onValueChange={(value) => 
                onSortChange({ ...sortOption, direction: value as 'asc' | 'desc' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">High to Low</SelectItem>
                <SelectItem value="asc">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payout Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Payout Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Min ($)</Label>
              <Input
                type="number"
                placeholder="28"
                value={filters.payoutRange?.min || ''}
                onChange={(e) => 
                  updateFilter('payoutRange', {
                    ...filters.payoutRange,
                    min: Number(e.target.value) || 0
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Max ($)</Label>
              <Input
                type="number"
                placeholder="367"
                value={filters.payoutRange?.max || ''}
                onChange={(e) => 
                  updateFilter('payoutRange', {
                    ...filters.payoutRange,
                    max: Number(e.target.value) || 999
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Urgency Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Urgency Level</Label>
          <div className="flex flex-wrap gap-2">
            {['normal', 'urgent', 'emergency'].map((level) => {
              const isSelected = filters.urgencyLevel?.includes(level);
              return (
                <Badge
                  key={level}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = filters.urgencyLevel || [];
                    const updated = isSelected
                      ? current.filter(l => l !== level)
                      : [...current, level];
                    updateFilter('urgencyLevel', updated);
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Showing Date Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">From</Label>
              <Input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => 
                  updateFilter('dateRange', {
                    ...filters.dateRange,
                    start: e.target.value
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">To</Label>
              <Input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => 
                  updateFilter('dateRange', {
                    ...filters.dateRange,
                    end: e.target.value
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Options</Label>
          <div className="flex items-center space-x-2">
            <Badge
              variant={filters.hideClaimed ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => updateFilter('hideClaimed', !filters.hideClaimed)}
            >
              Hide Claimed Showings
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
