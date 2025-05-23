
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateShowingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateShowingModal: React.FC<CreateShowingModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    property_address: '',
    mls_number: '',
    showing_date: '',
    showing_time: '',
    duration: 30,
    payout_amount: 50,
    client_name: '',
    client_phone: '',
    client_type: 'individual' as 'individual' | 'couple' | 'family',
    special_instructions: '',
    preferred_agent_email: '',
    urgency_level: 'normal' as 'normal' | 'urgent' | 'emergency'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('showings').insert({
        ...formData,
        requesting_agent_id: user.id,
        status: 'available'
      });

      if (error) throw error;

      toast({
        title: "Showing Request Posted!",
        description: "Your showing request has been posted to the marketplace.",
      });

      onSuccess();
      setFormData({
        property_address: '',
        mls_number: '',
        showing_date: '',
        showing_time: '',
        duration: 30,
        payout_amount: 50,
        client_name: '',
        client_phone: '',
        client_type: 'individual',
        special_instructions: '',
        preferred_agent_email: '',
        urgency_level: 'normal'
      });
    } catch (error) {
      console.error('Error creating showing:', error);
      toast({
        title: "Error",
        description: "Failed to create showing request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Showing Request</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Property Information</h3>
            
            <div>
              <Label htmlFor="property_address">Property Address *</Label>
              <Input
                id="property_address"
                value={formData.property_address}
                onChange={(e) => updateField('property_address', e.target.value)}
                placeholder="123 Main St, City, State 12345"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="mls_number">MLS Number</Label>
              <Input
                id="mls_number"
                value={formData.mls_number}
                onChange={(e) => updateField('mls_number', e.target.value)}
                placeholder="MLS123456"
              />
            </div>
          </div>

          {/* Showing Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Showing Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="showing_date">Date *</Label>
                <Input
                  id="showing_date"
                  type="date"
                  value={formData.showing_date}
                  onChange={(e) => updateField('showing_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="showing_time">Time *</Label>
                <Input
                  id="showing_time"
                  type="time"
                  value={formData.showing_time}
                  onChange={(e) => updateField('showing_time', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => updateField('duration', Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="urgency_level">Urgency Level</Label>
                <Select
                  value={formData.urgency_level}
                  onValueChange={(value) => updateField('urgency_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent (within 24h)</SelectItem>
                    <SelectItem value="emergency">Emergency (ASAP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Client Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => updateField('client_name', e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="client_phone">Client Phone *</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => updateField('client_phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="client_type">Client Type</Label>
              <Select
                value={formData.client_type}
                onValueChange={(value) => updateField('client_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="couple">Couple</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment and Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment & Preferences</h3>
            
            <div>
              <Label htmlFor="payout_amount">Payout Amount ($28 - $367) *</Label>
              <Input
                id="payout_amount"
                type="number"
                min="28"
                max="367"
                value={formData.payout_amount}
                onChange={(e) => updateField('payout_amount', Number(e.target.value))}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Suggested: $50-100 for standard showings, $100+ for urgent requests
              </p>
            </div>
            
            <div>
              <Label htmlFor="preferred_agent_email">Preferred Agent Email (Optional)</Label>
              <Input
                id="preferred_agent_email"
                type="email"
                value={formData.preferred_agent_email}
                onChange={(e) => updateField('preferred_agent_email', e.target.value)}
                placeholder="agent@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                value={formData.special_instructions}
                onChange={(e) => updateField('special_instructions', e.target.value)}
                placeholder="Any special requirements, access codes, or important notes for the showing agent..."
                rows={3}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Showing Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
