import React from 'react';
import { 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle,
  Check
} from 'lucide-react';
import { CategoryItemDisplay } from './CategoryItem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CategoryItem } from '@/types/conversation';

interface TransactionTypeSectionProps {
  transactionType: {
    role: CategoryItem;
    transactionTimeline: CategoryItem;
    financingStatus: CategoryItem;
    firstTimeBuyer: CategoryItem;
    confidence: number;
  };
  isEditing: boolean;
  onEdit: (key: string, value: any) => void;
}

export const TransactionTypeSection = ({ 
  transactionType, 
  isEditing, 
  onEdit 
}: TransactionTypeSectionProps) => {
  const roleOptions = ['Buyer', 'Seller', 'Investor', 'Both'];
  const timelineOptions = ['Immediate', '1-3 months', '3-6 months', '6+ months'];
  const financingOptions = ['Pre-approved', 'Pre-qualified', 'Needs Financing', 'Cash Buyer'];
  const firstTimeBuyerOptions = ['Yes', 'No', 'Unknown'];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-600 font-medium">
        <User className="h-4 w-4" />
        <h3>Transaction Type</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {Math.round(transactionType.confidence * 100)}% confidence
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center mb-1">
            <User className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Role</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Select 
                value={transactionType.role.value} 
                onValueChange={(value) => onEdit('role', {
                  ...transactionType.role,
                  value,
                  confidence: 1.0,
                  source: 'Agent',
                  verified: true
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-1">
              <CategoryItemDisplay item={transactionType.role} />
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Transaction Timeline</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Select 
                value={transactionType.transactionTimeline.value} 
                onValueChange={(value) => onEdit('transactionTimeline', {
                  ...transactionType.transactionTimeline,
                  value,
                  confidence: 1.0,
                  source: 'Agent',
                  verified: true
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-1">
              <CategoryItemDisplay item={transactionType.transactionTimeline} />
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <CreditCard className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">Financing Status</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Select 
                value={transactionType.financingStatus.value} 
                onValueChange={(value) => onEdit('financingStatus', {
                  ...transactionType.financingStatus,
                  value,
                  confidence: 1.0,
                  source: 'Agent',
                  verified: true
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select financing status" />
                </SelectTrigger>
                <SelectContent>
                  {financingOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-1">
              <CategoryItemDisplay item={transactionType.financingStatus} />
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center mb-1">
            <CheckCircle className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">First-Time Buyer</span>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Select 
                value={transactionType.firstTimeBuyer.value} 
                onValueChange={(value) => onEdit('firstTimeBuyer', {
                  ...transactionType.firstTimeBuyer,
                  value,
                  confidence: 1.0,
                  source: 'Agent',
                  verified: true
                })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {firstTimeBuyerOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="mt-1">
              <CategoryItemDisplay item={transactionType.firstTimeBuyer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
