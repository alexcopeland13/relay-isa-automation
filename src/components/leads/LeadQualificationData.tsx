
import { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Home, 
  TrendingUp, 
  Landmark, 
  Calendar, 
  DollarSign, 
  CreditCard,
  Users,
  Percent,
  ClipboardCheck
} from "lucide-react";

interface QualificationData {
  id?: string;
  lead_id?: string;
  loan_type?: string;
  property_type?: string;
  property_use?: string;
  estimated_credit_score?: string;
  annual_income?: number;
  is_self_employed?: boolean;
  has_co_borrower?: boolean;
  down_payment_percentage?: number;
  loan_amount?: number;
  debt_to_income_ratio?: number;
  time_frame?: string;
  qualifying_notes?: string;
  created_at?: string;
}

interface LeadQualificationDataProps {
  qualificationData: QualificationData | QualificationData[];
}

export function LeadQualificationData({ qualificationData }: LeadQualificationDataProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle both single object and array of qualification data
  const qualData = Array.isArray(qualificationData) 
    ? (qualificationData.length > 0 ? qualificationData[0] : undefined)
    : qualificationData;
  
  // Early return if no qualification data
  if (!qualData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Qualification Data</CardTitle>
          <CardDescription>No qualification data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Format dollar amounts
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Determine loan eligibility status
  const getLoanEligibilityStatus = () => {
    // Simple logic for demonstration - can be made more sophisticated
    if (!qualData.annual_income || !qualData.estimated_credit_score) return 'Unknown';
    
    const creditScore = parseInt(qualData.estimated_credit_score.replace(/\D/g,''));
    const goodIncome = qualData.annual_income >= 75000;
    const goodCredit = creditScore >= 680;
    const lowDTI = qualData.debt_to_income_ratio && qualData.debt_to_income_ratio <= 43;
    const goodDownPayment = qualData.down_payment_percentage && qualData.down_payment_percentage >= 20;
    
    if (goodIncome && goodCredit && (lowDTI || goodDownPayment)) return 'Excellent';
    if ((goodIncome || goodCredit) && (lowDTI || goodDownPayment)) return 'Good';
    if (goodIncome || goodCredit) return 'Fair';
    return 'Needs Review';
  };

  // Get badge color based on eligibility status
  const getEligibilityBadgeColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Needs Review': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Qualification status
  const eligibilityStatus = getLoanEligibilityStatus();
  const eligibilityBadgeClass = getEligibilityBadgeColor(eligibilityStatus);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Qualification Profile</CardTitle>
            <CardDescription>
              Detailed mortgage qualification information
            </CardDescription>
          </div>
          <Badge variant="outline" className={eligibilityBadgeClass}>
            {eligibilityStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="overview">Loan Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Loan Type */}
              <div className="flex items-start space-x-3">
                <Landmark className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Loan Type</div>
                  <div className="text-sm">{qualData.loan_type || 'Not specified'}</div>
                </div>
              </div>
              
              {/* Property Type */}
              <div className="flex items-start space-x-3">
                <Home className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Property Type</div>
                  <div className="text-sm">{qualData.property_type || 'Not specified'}</div>
                </div>
              </div>
              
              {/* Property Use */}
              <div className="flex items-start space-x-3">
                <ClipboardCheck className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Property Use</div>
                  <div className="text-sm">{qualData.property_use || 'Not specified'}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {/* Loan Amount */}
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Loan Amount</div>
                  <div className="text-sm">{formatCurrency(qualData.loan_amount)}</div>
                </div>
              </div>
              
              {/* Down Payment */}
              <div className="flex items-start space-x-3">
                <Percent className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Down Payment</div>
                  <div className="text-sm">
                    {qualData.down_payment_percentage 
                      ? `${qualData.down_payment_percentage}%` 
                      : 'Not specified'}
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Timeline</div>
                  <div className="text-sm">{qualData.time_frame || 'Not specified'}</div>
                </div>
              </div>
            </div>
            
            {qualData.qualifying_notes && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm font-medium mb-1">Qualifying Notes</div>
                <div className="text-sm text-muted-foreground">
                  {qualData.qualifying_notes}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Annual Income */}
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Annual Income</div>
                  <div className="text-sm">{formatCurrency(qualData.annual_income)}</div>
                </div>
              </div>
              
              {/* Credit Score */}
              <div className="flex items-start space-x-3">
                <CreditCard className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Credit Score</div>
                  <div className="text-sm">{qualData.estimated_credit_score || 'Not provided'}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* DTI Ratio */}
              <div className="flex items-start space-x-3">
                <Percent className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Debt-to-Income Ratio</div>
                  <div className="text-sm">
                    {qualData.debt_to_income_ratio 
                      ? `${qualData.debt_to_income_ratio}%` 
                      : 'Not calculated'}
                  </div>
                </div>
              </div>
              
              {/* Employment & Co-borrowers */}
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <div className="text-sm font-medium">Borrower Details</div>
                  <div className="text-sm">
                    {qualData.is_self_employed ? 'Self-employed' : 'W-2 Employee'}
                    {qualData.has_co_borrower && ', Has co-borrower'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
