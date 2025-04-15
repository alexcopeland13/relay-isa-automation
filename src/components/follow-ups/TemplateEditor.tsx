
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageTemplate } from '@/data/sampleFollowUpData';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Save, Eye } from 'lucide-react';

// Form schema for template creation/editing
const templateFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  channel: z.string(),
  subject: z.string().min(1, { message: 'Subject is required' }).optional(),
  content: z.string().min(10, { message: 'Content must be at least 10 characters' }),
  category: z.string(),
  tags: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateEditorProps {
  template?: MessageTemplate;
  onSave: (template: MessageTemplate) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const isEditMode = !!template;

  // Create placeholders for variables to be used in templates
  const placeholders = {
    '{leadName}': 'John Smith',
    '{agentName}': 'Sarah Johnson',
    '{companyName}': 'Relay Mortgage',
    '{propertyType}': 'Single Family Home',
    '{interestRate}': '4.5%',
    '{loanAmount}': '$320,000',
  };

  // Initialize form with template data if editing, or empty values if creating
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: template
      ? {
          title: template.title,
          description: template.description || '',
          channel: template.channel,
          subject: template.subject || '',
          content: template.content,
          category: template.category,
          tags: template.tags?.join(', ') || '',
        }
      : {
          title: '',
          description: '',
          channel: 'email',
          subject: '',
          content: '',
          category: 'follow-up',
          tags: '',
        },
  });

  const watchChannel = form.watch('channel');
  const watchContent = form.watch('content');
  const watchSubject = form.watch('subject');

  // Function to replace template variables with sample values
  const getPreviewContent = (content: string) => {
    let previewContent = content;
    
    // Replace placeholders with sample values
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      previewContent = previewContent.replace(new RegExp(placeholder, 'g'), value);
    });
    
    return previewContent;
  };

  const handleSubmit = async (values: TemplateFormValues) => {
    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Process form values
      const tags = values.tags
        ? values.tags.split(',').map(tag => tag.trim())
        : [];

      // Create template object
      const savedTemplate: MessageTemplate = {
        id: template?.id || `template-${Date.now()}`,
        title: values.title,
        description: values.description || '',
        channel: values.channel as 'email' | 'sms' | 'phone',
        subject: values.subject,
        content: values.content,
        category: values.category,
        tags: tags,
        createdAt: template?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: 'Current User', // In a real app, this would be the current user
        usage: template?.usage || 0,
      };

      // Get existing templates from localStorage or use empty array
      const existingTemplatesJSON = localStorage.getItem('relayTemplates');
      let existingTemplates: MessageTemplate[] = existingTemplatesJSON
        ? JSON.parse(existingTemplatesJSON)
        : [];

      if (isEditMode) {
        // Update existing template
        existingTemplates = existingTemplates.map(t =>
          t.id === savedTemplate.id ? savedTemplate : t
        );
      } else {
        // Add new template
        existingTemplates.push(savedTemplate);
      }

      // Save to localStorage
      localStorage.setItem('relayTemplates', JSON.stringify(existingTemplates));

      // Call the onSave callback
      onSave(savedTemplate);

      // Show success toast
      toast({
        title: isEditMode ? 'Template updated' : 'Template created',
        description: isEditMode
          ? `"${savedTemplate.title}" has been updated successfully`
          : `"${savedTemplate.title}" has been added to your templates`,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'There was a problem saving the template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{isEditMode ? 'Edit Template' : 'Create New Template'}</CardTitle>
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="edit" className="mt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Refinance Follow-up" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="channel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Channel</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select channel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="phone">Phone Script</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe when to use this template..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchChannel === 'email' && (
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Following up on our conversation about your mortgage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{watchChannel === 'phone' ? 'Call Script' : 'Message Content'}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Enter your ${
                            watchChannel === 'phone' ? 'call script' : 'message'
                          } content here...`}
                          className="min-h-[200px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground mt-2">
                        Use variables like {'{leadName}'}, {'{agentName}'}, or {'{propertyType}'} to personalize content
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="follow-up">Follow-up</SelectItem>
                            <SelectItem value="introduction">Introduction</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="thank-you">Thank You</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. refinance, high-value, urgent" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" type="button" onClick={onCancel}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Templates
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setActiveTab('preview')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isEditMode ? 'Update Template' : 'Save Template'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="space-y-6">
              <div className="border rounded-md p-6">
                {watchChannel === 'email' && (
                  <>
                    <div className="border-b pb-2 mb-4">
                      <div className="text-sm text-muted-foreground">From: Relay Mortgage</div>
                      <div className="text-sm text-muted-foreground">To: {placeholders['{leadName}']}</div>
                      <div className="text-sm font-medium mt-2">Subject: {getPreviewContent(watchSubject || '')}</div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      {getPreviewContent(watchContent).split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </>
                )}

                {watchChannel === 'sms' && (
                  <div className="max-w-xs mx-auto">
                    <div className="bg-primary/10 p-4 rounded-lg text-sm">
                      {getPreviewContent(watchContent)}
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-2">
                      SMS preview (160 characters per message)
                    </div>
                  </div>
                )}

                {watchChannel === 'phone' && (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="text-sm font-medium mb-2">Call Script Preview:</h3>
                      <div className="text-sm">
                        {getPreviewContent(watchContent).split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-2">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Note: This is a preview of the call script that agents will use when calling leads.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('edit')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Editor
                </Button>

                <Button onClick={form.handleSubmit(handleSubmit)} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Update Template' : 'Save Template'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
