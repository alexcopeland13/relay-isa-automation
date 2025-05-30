
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeadInfoPanelProps {
  leadInfo: {
    name: string;
    email: string;
    phone: string;
    source: string;
  };
  leadId?: string;
}

interface LeadData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  created_at?: string;
  notes?: string;
}

interface QualificationData {
  annual_income?: number;
  loan_amount?: number;
  property_type?: string;
  buying_timeline?: string;
  pre_approval_status?: string;
  estimated_credit_score?: string;
}

export const LeadInfoPanel = ({ leadInfo, leadId }: LeadInfoPanelProps) => {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [qualificationData, setQualificationData] = useState<QualificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeadData = async () => {
      if (!leadId) {
        setIsLoading(false);
        return;
      }

      try {
        // Load lead basic info
        const { data: lead, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (leadError) {
          console.error('Error loading lead:', leadError);
        } else {
          setLeadData(lead);
        }

        // Load qualification data
        const { data: qualification, error: qualError } = await supabase
          .from('qualification_data')
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (qualError) {
          console.error('Error loading qualification:', qualError);
        } else if (qualification && qualification.length > 0) {
          setQualificationData(qualification[0]);
        }
      } catch (error) {
        console.error('Error loading lead data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeadData();
  }, [leadId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'qualified':
        return 'bg-green-500';
      case 'new':
        return 'bg-blue-500';
      case 'contacted':
        return 'bg-yellow-500';
      case 'disqualified':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Basic Lead Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Lead Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-medium">{leadInfo.name}</p>
              {leadData?.status && (
                <Badge className={getStatusColor(leadData.status)} size="sm">
                  {leadData.status}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{leadInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span>{leadInfo.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{leadInfo.source}</span>
              </div>
              {leadData?.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Added {new Date(leadData.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Qualification Data */}
        {!isLoading && qualificationData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {qualificationData.annual_income && (
                <div>
                  <span className="font-medium">Annual Income:</span>
                  <p>{formatCurrency(qualificationData.annual_income)}</p>
                </div>
              )}
              
              {qualificationData.loan_amount && (
                <div>
                  <span className="font-medium">Loan Amount:</span>
                  <p>{formatCurrency(qualificationData.loan_amount)}</p>
                </div>
              )}
              
              {qualificationData.estimated_credit_score && (
                <div>
                  <span className="font-medium">Credit Score:</span>
                  <p>{qualificationData.estimated_credit_score}</p>
                </div>
              )}
              
              {qualificationData.pre_approval_status && (
                <div>
                  <span className="font-medium">Pre-approval:</span>
                  <Badge variant="outline" size="sm">
                    {qualificationData.pre_approval_status}
                  </Badge>
                </div>
              )}
              
              {qualificationData.property_type && (
                <div>
                  <span className="font-medium">Property Type:</span>
                  <p>{qualificationData.property_type}</p>
                </div>
              )}
              
              {qualificationData.buying_timeline && (
                <div>
                  <span className="font-medium">Timeline:</span>
                  <p>{qualificationData.buying_timeline}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {leadData?.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{leadData.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};
