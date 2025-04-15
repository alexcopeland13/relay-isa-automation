
import React from 'react';
import { Check, Circle, CircleX, Edit, User, Bot, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CategoryItem as CategoryItemType } from '@/data/sampleConversation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CategoryItemProps {
  item: CategoryItemType;
  onVerify?: (item: CategoryItemType) => void;
  onEdit?: (item: CategoryItemType) => void;
  className?: string;
}

// For direct usage with string categories
interface SimpleCategoryProps {
  category: string;
  className?: string;
}

export const CategoryItemDisplay = ({ item, onVerify, onEdit, className }: CategoryItemProps) => {
  const getConfidenceIcon = () => {
    if (item.confidence > 0.85) {
      return <Check className="h-3 w-3 text-green-600" />;
    } else if (item.confidence > 0.70) {
      return <Circle className="h-3 w-3 text-yellow-600" />;
    } else {
      return <CircleX className="h-3 w-3 text-red-600" />;
    }
  };

  const getSourceIcon = () => {
    switch (item.source) {
      case 'User':
        return <User className="h-3 w-3" />;
      case 'Agent':
        return <UserCheck className="h-3 w-3" />;
      case 'AI':
      default:
        return <Bot className="h-3 w-3" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={item.verified ? "default" : "outline"} 
            className={`flex items-center gap-1.5 px-2 py-1 ${className}`}
          >
            {item.value}
            <span className="flex items-center gap-0.5 text-xs opacity-70">
              {getConfidenceIcon()}
              {getSourceIcon()}
            </span>
            {(onVerify || onEdit) && (
              <div className="ml-1 flex gap-1">
                {onVerify && !item.verified && (
                  <button 
                    onClick={() => onVerify(item)} 
                    className="text-xs p-0.5 hover:bg-secondary rounded-sm"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
                {onEdit && (
                  <button 
                    onClick={() => onEdit(item)} 
                    className="text-xs p-0.5 hover:bg-secondary rounded-sm"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p>Confidence: {Math.round(item.confidence * 100)}%</p>
            <p>Source: {item.source}</p>
            <p>Status: {item.verified ? 'Verified' : 'Unverified'}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Simple category display for string-based categories
export const CategoryItem = ({ category, className }: SimpleCategoryProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-1 ${className}`}
    >
      {category}
    </Badge>
  );
};
