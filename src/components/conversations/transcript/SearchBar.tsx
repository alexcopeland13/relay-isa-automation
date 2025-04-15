
import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: number[];
  currentSearchIndex: number;
  onPrevResult: () => void;
  onNextResult: () => void;
  onClose: () => void;
}

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  currentSearchIndex,
  onPrevResult,
  onNextResult,
  onClose
}: SearchBarProps) => {
  return (
    <div className="border-b border-border p-4 flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search in transcript..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm"
          disabled={searchResults.length === 0}
          onClick={onPrevResult}
        >
          <ChevronUp size={16} />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          disabled={searchResults.length === 0}
          onClick={onNextResult}
        >
          <ChevronDown size={16} />
        </Button>
        <span className="text-sm text-muted-foreground">
          {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : 'No results'}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X size={16} />
      </Button>
    </div>
  );
};
