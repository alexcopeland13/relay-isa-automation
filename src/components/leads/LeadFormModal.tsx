import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lead } from '@/types/lead';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { parsePhoneNumberWithError, PhoneNumber, CountryCode } from 'libphonenumber-js/max'; // Using /max for all metadata

// Form schema for lead creation/editing
const leadFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone_raw: z.string().min(1, { message: 'Phone number is required' })
    .refine(value => {
      try {
        const phoneNumber = parsePhoneNumberWithError(value, 'US' as CountryCode); // Assume US for validation
        return phoneNumber.isValid();
      } catch (error) {
        return false;
      }
    }, { message: 'Please enter a valid phone number' }),
  status: z.string(),
  source: z.string(),
  type: z.string(),
  interestType: z.string(),
  location: z.string(),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void; // onSave expects the full Lead object with potentially new phone_e164
  lead?: Lead; // Optional - if provided, we're editing. If not, we're creating.
}

export function LeadFormModal({ isOpen, onClose, onSave, lead }: LeadFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!lead;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: lead
      ? {
          name: lead.name,
          email: lead.email,
          phone_raw: lead.phone_raw || lead.phone || '', // Use phone_raw, fallback to old phone
          status: lead.status,
          source: lead.source,
          type: lead.type,
          interestType: lead.interestType,
          location: lead.location,
          notes: lead.notes || '',
        }
      : {
          name: '',
          email: '',
          phone_raw: '',
          status: 'New',
          source: 'Manual Entry',
          type: 'Mortgage',
          interestType: 'Refinancing',
          location: '',
          notes: '',
        },
  });

  // Reset form when lead data changes (e.g., opening modal for a different lead)
  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name,
        email: lead.email,
        phone_raw: lead.phone_raw || lead.phone || '',
        status: lead.status,
        source: lead.source,
        type: lead.type,
        interestType: lead.interestType,
        location: lead.location,
        notes: lead.notes || '',
      });
    } else {
      form.reset({
        name: '',
        email: '',
        phone_raw: '',
        status: 'New',
        source: 'Manual Entry',
        type: 'Mortgage',
        interestType: 'Refinancing',
        location: '',
        notes: '',
      });
    }
  }, [lead, form.reset, form]);

  const handleSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);

    let phone_e164: string | undefined = undefined;
    if (values.phone_raw) {
      try {
        const phoneNumberInstance = parsePhoneNumberWithError(values.phone_raw, 'US' as CountryCode); // Assume US
        if (phoneNumberInstance && phoneNumberInstance.isValid()) {
          phone_e164 = phoneNumberInstance.format('E.164');
        }
      } catch (e) {
        console.warn("Could not parse phone number for E.164 format:", e);
        // Optionally, you could set a form error here if E.164 is strictly required
        // form.setError("phone_raw", { type: "manual", message: "Invalid phone number for international format." });
        // setIsSubmitting(false);
        // return;
      }
    }

    try {
      // Simulate API call delay - remove if onSave handles actual async ops
      // await new Promise(resolve => setTimeout(resolve, 1000));

      const leadToSave: Lead = {
        id: lead?.id || `lead-${Date.now()}`, // ID generation should be handled by backend/onSave
        name: values.name,
        email: values.email,
        phone: values.phone_raw, // Keep original phone for backward compatibility if needed or remove
        phone_raw: values.phone_raw,
        phone_e164: phone_e164,
        interestType: values.interestType,
        status: values.status as Lead['status'],
        type: values.type as Lead['type'],
        location: values.location,
        source: values.source,
        notes: values.notes,
        score: lead?.score || 50,
        lastContact: lead?.lastContact || new Date().toISOString(),
        createdAt: lead?.createdAt || new Date().toISOString(),
        assignedTo: lead?.assignedTo || 'unassigned',
        cinc_lead_id: lead?.cinc_lead_id, // Preserve existing cinc_lead_id if editing
        // Ensure all other Lead fields are present if they have defaults or come from `lead`
      };

      onSave(leadToSave); // onSave should handle the actual DB interaction

      toast({
        title: isEditMode ? 'Lead updated' : 'Lead created',
        description: isEditMode
          ? `${leadToSave.name}'s information has been updated`
          : `${leadToSave.name} has been added to your leads`,
      });

      onClose();
    } catch (error) {
      console.error("Error saving lead:", error);
      toast({
        title: 'Error',
        description: 'There was a problem saving the lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        form.reset(); // Reset form on close
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the lead information below.'
              : 'Fill out the form below to add a new lead to your database.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_raw" // Changed from "phone" to "phone_raw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Los Angeles, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Proposal">Proposal</SelectItem>
                        <SelectItem value="Converted">Converted</SelectItem>
                        <SelectItem value="Lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mortgage">Mortgage</SelectItem>
                        <SelectItem value="Realtor">Realtor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Refinancing, Home Purchase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CINC">CINC</SelectItem> {/* Added CINC */}
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Facebook Ad">Facebook Ad</SelectItem>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Direct">Direct</SelectItem>
                        <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                        {/* Add other sources as needed */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about this lead..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => {
                onClose();
                form.reset(); // Reset form on cancel
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{isEditMode ? 'Update Lead' : 'Create Lead'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
