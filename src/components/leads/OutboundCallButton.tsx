
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';
import { retellAPI, formatPhoneForRetell } from '@/lib/retell-api';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/lead';

interface OutboundCallButtonProps {
  lead: Lead;
  agentId?: string;
}

export function OutboundCallButton({ lead, agentId = 'your-default-agent-id' }: OutboundCallButtonProps) {
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const { toast } = useToast();

  const handleOutboundCall = async () => {
    if (!lead.phone) {
      toast({
        title: "No Phone Number",
        description: "This lead doesn't have a phone number on file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsInitiatingCall(true);
      
      const formattedPhone = formatPhoneForRetell(lead.phone);
      
      const callRequest = {
        agent_id: agentId,
        customer_number: formattedPhone,
        customer_name: lead.name,
        metadata: {
          lead_id: lead.id,
          lead_source: lead.source,
          lead_status: lead.status
        },
        retell_llm_dynamic_variables: {
          customer_name: lead.name,
          customer_email: lead.email,
          lead_source: lead.source
        }
      };

      console.log('🔄 Initiating outbound call:', callRequest);
      
      const call = await retellAPI.createPhoneCall(callRequest);
      
      toast({
        title: "Call Initiated",
        description: `Outbound call to ${lead.name} has been started. Call ID: ${call.call_id}`,
      });

      // You could optionally redirect to a call monitoring view or update UI state
      console.log('✅ Call initiated successfully:', call);

    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      toast({
        title: "Call Failed",
        description: "Failed to initiate outbound call. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitiatingCall(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOutboundCall}
      disabled={isInitiatingCall || !lead.phone}
      className="gap-2"
    >
      {isInitiatingCall ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Calling...
        </>
      ) : (
        <>
          <Phone className="h-4 w-4" />
          Call
        </>
      )}
    </Button>
  );
}
