import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, DollarSign, Home, AlertTriangle, Phone, User, CheckCircle } from 'lucide-react';

interface EnhancedQualificationData {
  // Existing fields
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
  
  // Enhanced fields
  pre_approval_status?: string;
  current_lender?: string;
  knows_about_overlays?: boolean;
  overlay_education_completed?: boolean;
  ready_to_buy_timeline?: string;
  lead_temperature?: string;
  credit_concerns?: boolean;
  debt_concerns?: boolean;
  down_payment_concerns?: boolean;
  job_change_concerns?: boolean;
  interest_rate_concerns?: boolean;
  objection_details?: any;
  has_specific_property?: boolean;
  property_address?: string;
  property_price?: number;
  multiple_properties_interested?: boolean;
  property_mls_number?: string;
  wants_credit_review?: boolean;
  wants_down_payment_assistance?: boolean;
  va_eligible?: boolean;
  first_time_buyer?: boolean;
  preferred_contact_method?: string;
  best_time_to_call?: string;
}

interface EnhancedLeadQualificationDataProps {
  data: EnhancedQualificationData;
}

export const EnhancedLeadQualificationData = ({ data }: EnhancedLeadQualificationDataProps) => {
  const getTemperatureBadge = (temperature?: string) => {
    const colors = {
      hot: 'bg-red-500 text-white',
      warm: 'bg-orange-500 text-white',
      cool: 'bg-blue-500 text-white',
      cold: 'bg-gray-500 text-white'
    };
    return colors[temperature as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getPreApprovalBadge = (status?: string) => {
    const colors = {
      pre_approved: 'bg-green-500 text-white',
      not_pre_approved: 'bg-red-500 text-white',
      cash_buyer: 'bg-purple-500 text-white'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const concerns = [
    { key: 'credit_concerns', label: 'Credit', value: data.credit_concerns },
    { key: 'debt_concerns', label: 'Debt', value: data.debt_concerns },
    { key: 'down_payment_concerns', label: 'Down Payment', value: data.down_payment_concerns },
    { key: 'job_change_concerns', label: 'Job Change', value: data.job_change_concerns },
    { key: 'interest_rate_concerns', label: 'Interest Rate', value: data.interest_rate_concerns }
  ].filter(concern => concern.value);

  return (
    <div className="space-y-4">
      {/* Pre-Approval & Timeline Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pre-Approval Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {data.pre_approval_status && (
              <Badge className={getPreApprovalBadge(data.pre_approval_status)}>
                {data.pre_approval_status.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
            {data.lead_temperature && (
              <Badge className={getTemperatureBadge(data.lead_temperature)}>
                {data.lead_temperature.toUpperCase()} LEAD
              </Badge>
            )}
            {data.first_time_buyer && (
              <Badge variant="outline">First-Time Buyer</Badge>
            )}
            {data.va_eligible && (
              <Badge variant="outline">VA Eligible</Badge>
            )}
          </div>
          
          {data.current_lender && (
            <div>
              <span className="text-sm font-medium">Current Lender:</span>
              <p className="text-sm text-muted-foreground">{data.current_lender}</p>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {data.knows_about_overlays !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Knows Overlays:</span>
                <Badge variant={data.knows_about_overlays ? 'default' : 'outline'}>
                  {data.knows_about_overlays ? 'Yes' : 'No'}
                </Badge>
              </div>
            )}
            {data.overlay_education_completed !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Education Complete:</span>
                <Badge variant={data.overlay_education_completed ? 'default' : 'outline'}>
                  {data.overlay_education_completed ? 'Yes' : 'No'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Urgency */}
      {data.ready_to_buy_timeline && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline & Urgency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.ready_to_buy_timeline.replace('_', '-').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Concerns & Objections */}
      {concerns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Concerns Identified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {concerns.map((concern) => (
                <Badge key={concern.key} variant="destructive">
                  {concern.label}
                </Badge>
              ))}
            </div>
            {data.objection_details && (
              <div className="mt-3">
                <span className="text-sm font-medium">Details:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof data.objection_details === 'string' 
                    ? data.objection_details 
                    : JSON.stringify(data.objection_details)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Interests */}
      {(data.has_specific_property || data.multiple_properties_interested) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Interests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              {data.has_specific_property && (
                <Badge variant="outline">Has Specific Property</Badge>
              )}
              {data.multiple_properties_interested && (
                <Badge variant="outline">Multiple Properties</Badge>
              )}
            </div>
            
            {data.property_address && (
              <div>
                <span className="text-sm font-medium">Property Address:</span>
                <p className="text-sm text-muted-foreground">{data.property_address}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              {data.property_price && (
                <div>
                  <span className="text-sm font-medium">Price:</span>
                  <p className="text-sm text-muted-foreground">
                    ${data.property_price.toLocaleString()}
                  </p>
                </div>
              )}
              {data.property_mls_number && (
                <div>
                  <span className="text-sm font-medium">MLS #:</span>
                  <p className="text-sm text-muted-foreground">{data.property_mls_number}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions Needed */}
      {(data.wants_credit_review || data.wants_down_payment_assistance) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Requested Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {data.wants_credit_review && (
                <Badge variant="secondary">Credit Review</Badge>
              )}
              {data.wants_down_payment_assistance && (
                <Badge variant="secondary">Down Payment Assistance</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication Preferences */}
      {(data.preferred_contact_method || data.best_time_to_call) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.preferred_contact_method && (
              <div>
                <span className="text-sm font-medium">Preferred Method:</span>
                <Badge variant="outline" className="ml-2">
                  {data.preferred_contact_method.toUpperCase()}
                </Badge>
              </div>
            )}
            {data.best_time_to_call && (
              <div>
                <span className="text-sm font-medium">Best Time:</span>
                <span className="text-sm text-muted-foreground ml-2">
                  {data.best_time_to_call}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Existing Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {data.annual_income && (
              <div>
                <span className="text-sm font-medium">Annual Income:</span>
                <p className="text-sm text-muted-foreground">
                  ${data.annual_income.toLocaleString()}
                </p>
              </div>
            )}
            {data.loan_amount && (
              <div>
                <span className="text-sm font-medium">Loan Amount:</span>
                <p className="text-sm text-muted-foreground">
                  ${data.loan_amount.toLocaleString()}
                </p>
              </div>
            )}
            {data.down_payment_percentage && (
              <div>
                <span className="text-sm font-medium">Down Payment:</span>
                <p className="text-sm text-muted-foreground">
                  {data.down_payment_percentage}%
                </p>
              </div>
            )}
            {data.estimated_credit_score && (
              <div>
                <span className="text-sm font-medium">Credit Score:</span>
                <p className="text-sm text-muted-foreground">
                  {data.estimated_credit_score}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {data.is_self_employed && (
              <Badge variant="outline">Self-Employed</Badge>
            )}
            {data.has_co_borrower && (
              <Badge variant="outline">Has Co-Borrower</Badge>
            )}
            {data.loan_type && (
              <Badge variant="outline">{data.loan_type}</Badge>
            )}
            {data.property_type && (
              <Badge variant="outline">{data.property_type}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
