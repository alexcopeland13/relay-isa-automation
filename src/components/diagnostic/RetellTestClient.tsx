
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Phone } from 'lucide-react';

interface RetellTestClientProps {
  onLeadCreated?: (leadId: string) => void;
}

export function RetellTestClient({ onLeadCreated }: RetellTestClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [callerName, setCallerName] = useState('Test Caller');
  const [callerPhone, setCallerPhone] = useState('555-123-4567');
  const [callerEmail, setCallerEmail] = useState('testcaller@example.com');
  const [transcript, setTranscript] = useState('Hi, I\'m interested in learning about mortgage options.');

  // Send a test webhook to the Retell webhook endpoint
  const sendTestWebhook = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const testData = {
        conversation: {
          id: `retell-test-${Date.now()}`
        },
        caller: {
          name: callerName,
          phone: callerPhone,
          email: callerEmail
        },
        transcription: transcript,
        call_metadata: {
          call_id: `retell-test-${Date.now()}`,
          duration: 120,
          recording_url: null
        },
        extracted_information: {
          first_name: callerName.split(' ')[0],
          last_name: callerName.split(' ').slice(1).join(' '),
          email: callerEmail,
          phone: callerPhone,
          sentiment_score: 0.75,
          qualification_data: {
            loan_type: "Conventional",
            property_type: "Single Family",
            property_use: "Primary Residence",
            estimated_credit_score: "700-750",
            annual_income: 95000,
            is_self_employed: false,
            has_co_borrower: false,
            down_payment_percentage: 20,
            loan_amount: 350000,
            debt_to_income_ratio: 0.28,
            time_frame: "3-6 months",
            notes: "Generated from Retell test client"
          }
        }
      };
      
      // Call the retell-webhook edge function directly for testing
      const { data, error } = await supabase.functions.invoke('retell-webhook', {
        body: testData
      });
      
      if (error) {
        throw new Error(`Webhook error: ${error.message}`);
      }
      
      console.log("Retell test webhook response:", data);
      setSuccess(`Successfully created lead from Retell test. Lead ID: ${data.leadId}`);
      
      if (onLeadCreated && data.leadId) {
        onLeadCreated(data.leadId);
      }
    } catch (err) {
      console.error("Retell test webhook error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <span>Retell Test Client</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="callerName" className="block text-sm font-medium mb-1">Caller Name</label>
              <Input 
                id="callerName" 
                value={callerName} 
                onChange={(e) => setCallerName(e.target.value)} 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label htmlFor="callerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
              <Input 
                id="callerPhone" 
                value={callerPhone} 
                onChange={(e) => setCallerPhone(e.target.value)} 
                placeholder="555-123-4567" 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="callerEmail" className="block text-sm font-medium mb-1">Email</label>
            <Input 
              id="callerEmail" 
              value={callerEmail} 
              onChange={(e) => setCallerEmail(e.target.value)} 
              placeholder="caller@example.com" 
              type="email" 
            />
          </div>
          
          <div>
            <label htmlFor="transcript" className="block text-sm font-medium mb-1">Conversation Transcript</label>
            <Textarea 
              id="transcript" 
              value={transcript} 
              onChange={(e) => setTranscript(e.target.value)} 
              placeholder="Enter sample conversation transcript..." 
              rows={4}
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={sendTestWebhook} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && <Phone className="mr-2 h-4 w-4" />}
            Test Retell Integration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
