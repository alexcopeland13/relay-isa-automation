
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Loader2 } from 'lucide-react';

export function TestVAPIClient() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Lead info
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    source: 'VAPI Voice Agent',
    notes: 'This lead is interested in mortgage refinancing options.',
    
    // Qualification data
    loanType: 'Refinance',
    propertyType: 'Single Family',
    propertyUse: 'Primary Residence',
    creditScore: '700-749',
    annualIncome: 95000,
    downPaymentPercentage: 20,
    loanAmount: 350000,
    timeFrame: '3-6 months',
    
    // Conversation data
    transcript: 'Agent: Thank you for calling Relay. How can I help you today?\n\nCaller: Hi, I\'m interested in refinancing my mortgage.\n\nAgent: Great! I\'d be happy to help with that. Could you tell me about your current mortgage situation?\n\nCaller: Sure, I have a 30-year fixed at 4.5% and I\'ve heard rates are lower now.\n\nAgent: You\'re right about that. Rates have dropped. What\'s your approximate credit score range?\n\nCaller: I think it\'s around 740 or so.\n\nAgent: That\'s excellent. And what\'s the approximate value of your home?\n\nCaller: It\'s probably around $450,000 now.\n\nAgent: And your current mortgage balance?\n\nCaller: About $350,000.\n\nAgent: Thanks for that information. Based on what you\'ve told me, you might be a good candidate for refinancing.'
  });

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      // Format the data for the API call
      const payload = {
        leadInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          source: formData.source,
          notes: formData.notes
        },
        qualificationData: {
          loanType: formData.loanType,
          propertyType: formData.propertyType,
          propertyUse: formData.propertyUse,
          creditScore: formData.creditScore,
          annualIncome: formData.annualIncome,
          downPaymentPercentage: formData.downPaymentPercentage,
          loanAmount: formData.loanAmount,
          timeFrame: formData.timeFrame
        },
        conversationData: {
          agentId: 'vapi-test-agent',
          direction: 'inbound',
          duration: 240, // 4 minutes
          transcript: formData.transcript,
          sentimentScore: 0.75
        }
      };

      // Send the data to our Edge Function
      const response = await fetch(
        'https://qvarmbhdradfpkegtpgw.supabase.co/functions/v1/insert-lead',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit lead data');
      }

      // Show success
      setSubmitSuccess(true);
      toast({
        title: "Lead data submitted",
        description: `Successfully inserted lead data with ID: ${result.leadId}`,
      });
      
      // Close dialog after 3 seconds on success
      setTimeout(() => {
        setOpen(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting lead data:', error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Test VAPI Integration</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test VAPI Lead Submission</DialogTitle>
          <DialogDescription>
            This form simulates a VAPI AI voice agent sending lead data to Relay.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">Lead Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="source">Lead Source</Label>
              <Input 
                id="source" 
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">Qualification Data</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="loanType">Loan Type</Label>
                <Select 
                  value={formData.loanType}
                  onValueChange={(value) => handleChange('loanType', value)}
                >
                  <SelectTrigger id="loanType">
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase">Purchase</SelectItem>
                    <SelectItem value="Refinance">Refinance</SelectItem>
                    <SelectItem value="HELOC">HELOC</SelectItem>
                    <SelectItem value="VA Loan">VA Loan</SelectItem>
                    <SelectItem value="FHA Loan">FHA Loan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select 
                  value={formData.propertyType}
                  onValueChange={(value) => handleChange('propertyType', value)}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single Family">Single Family</SelectItem>
                    <SelectItem value="Condo">Condo</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="propertyUse">Property Use</Label>
                <Select 
                  value={formData.propertyUse}
                  onValueChange={(value) => handleChange('propertyUse', value)}
                >
                  <SelectTrigger id="propertyUse">
                    <SelectValue placeholder="Select property use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primary Residence">Primary Residence</SelectItem>
                    <SelectItem value="Secondary Home">Secondary Home</SelectItem>
                    <SelectItem value="Investment Property">Investment Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="creditScore">Credit Score Range</Label>
                <Select 
                  value={formData.creditScore}
                  onValueChange={(value) => handleChange('creditScore', value)}
                >
                  <SelectTrigger id="creditScore">
                    <SelectValue placeholder="Select credit score range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="800+">800+</SelectItem>
                    <SelectItem value="750-799">750-799</SelectItem>
                    <SelectItem value="700-749">700-749</SelectItem>
                    <SelectItem value="650-699">650-699</SelectItem>
                    <SelectItem value="600-649">600-649</SelectItem>
                    <SelectItem value="Below 600">Below 600</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="annualIncome">Annual Income</Label>
                <Input 
                  id="annualIncome" 
                  type="number"
                  value={formData.annualIncome}
                  onChange={(e) => handleChange('annualIncome', parseInt(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="downPaymentPercentage">Down Payment %</Label>
                <Input 
                  id="downPaymentPercentage" 
                  type="number"
                  value={formData.downPaymentPercentage}
                  onChange={(e) => handleChange('downPaymentPercentage', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="loanAmount">Loan Amount</Label>
                <Input 
                  id="loanAmount" 
                  type="number"
                  value={formData.loanAmount}
                  onChange={(e) => handleChange('loanAmount', parseInt(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timeFrame">Time Frame</Label>
                <Select 
                  value={formData.timeFrame}
                  onValueChange={(value) => handleChange('timeFrame', value)}
                >
                  <SelectTrigger id="timeFrame">
                    <SelectValue placeholder="Select time frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediately">Immediately</SelectItem>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="Just exploring">Just exploring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold">Voice Conversation</h3>
            <div className="grid gap-2">
              <Label htmlFor="transcript">Conversation Transcript</Label>
              <Textarea 
                id="transcript" 
                rows={6} 
                value={formData.transcript}
                onChange={(e) => handleChange('transcript', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {submitSuccess ? (
            <div className="flex items-center space-x-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span>Lead data submitted successfully!</span>
            </div>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Lead Data'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
