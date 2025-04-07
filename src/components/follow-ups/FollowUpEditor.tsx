
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FollowUp, Template, sampleTemplates } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Mail, 
  Phone, 
  MessageSquare,
  AlertTriangle,
  User,
  X 
} from 'lucide-react';

interface FollowUpEditorProps {
  followUp: FollowUp;
  onSave: (updatedFollowUp: FollowUp) => void;
  onCancel: () => void;
}

export const FollowUpEditor = ({ followUp, onSave, onCancel }: FollowUpEditorProps) => {
  const [updatedFollowUp, setUpdatedFollowUp] = useState<FollowUp>({ ...followUp });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    sampleTemplates.find(t => t.id === followUp.suggestedTemplate) || null
  );
  
  const handleInputChange = (field: keyof FollowUp, value: any) => {
    setUpdatedFollowUp({ ...updatedFollowUp, [field]: value });
  };
  
  const handleTemplateChange = (templateId: string) => {
    const template = sampleTemplates.find(t => t.id === templateId);
    
    if (template) {
      setSelectedTemplate(template);
      handleInputChange('suggestedTemplate', templateId);
      handleInputChange('suggestedContent', template.content);
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Preserve the time from the existing date
      const existingDate = parseISO(updatedFollowUp.scheduledFor);
      const newDate = new Date(date);
      
      newDate.setHours(existingDate.getHours());
      newDate.setMinutes(existingDate.getMinutes());
      
      handleInputChange('scheduledFor', newDate.toISOString());
    }
  };
  
  const handleTimeChange = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Preserve the date but update the time
    const existingDate = parseISO(updatedFollowUp.scheduledFor);
    const newDate = new Date(existingDate);
    
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    
    handleInputChange('scheduledFor', newDate.toISOString());
  };
  
  const getTemplatesByChannel = () => {
    return sampleTemplates.filter(template => template.channel === updatedFollowUp.channel);
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-t-4 border-t-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Edit Follow-up</CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onCancel}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lead Information */}
          <div className="space-y-4 col-span-1">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Lead Information</h3>
              
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{updatedFollowUp.leadInfo.name}</h4>
                    <p className="text-sm text-muted-foreground">{updatedFollowUp.leadInfo.interestType}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 flex items-center rounded-full px-2 py-1">
                    <span className="text-xs font-medium">{updatedFollowUp.leadInfo.qualificationScore}</span>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 mr-1" />
                    <span>{updatedFollowUp.leadInfo.email}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    <span>{updatedFollowUp.leadInfo.phone}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      {updatedFollowUp.aiReasoning}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Settings</h3>
              
              <div className="border rounded-md p-4 space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="channel">Channel</Label>
                  <Select 
                    value={updatedFollowUp.channel}
                    onValueChange={(value) => handleInputChange('channel', value)}
                  >
                    <SelectTrigger id="channel">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Email</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          <span>Phone</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sms">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                          <span>SMS</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="date">Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(parseISO(updatedFollowUp.scheduledFor), 'MMMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={parseISO(updatedFollowUp.scheduledFor)}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="time">Scheduled Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      className="pl-9"
                      value={format(parseISO(updatedFollowUp.scheduledFor), 'HH:mm')}
                      onChange={(e) => handleTimeChange(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={updatedFollowUp.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">
                        <div className="text-red-500 font-medium">High</div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="text-amber-500 font-medium">Medium</div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="text-blue-500 font-medium">Low</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="assignee">Assigned To</Label>
                  <Select 
                    value={updatedFollowUp.assignedTo === 'unassigned' ? 'unassigned' : updatedFollowUp.assignedTo}
                    onValueChange={(value) => handleInputChange('assignedTo', value)}
                  >
                    <SelectTrigger id="assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Unassigned</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="john.smith@nexusisa.com">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <span>John Smith</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="jane.doe@nexusisa.com">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-green-500" />
                          <span>Jane Doe</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial.team@nexusisa.com">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-purple-500" />
                          <span>Commercial Team</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Editor */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                <div className="flex items-center">
                  {getChannelIcon(updatedFollowUp.channel)}
                  <span className="ml-1">
                    {updatedFollowUp.channel === 'email' ? 'Email Content' : 
                     updatedFollowUp.channel === 'phone' ? 'Call Script' : 
                     'SMS Content'}
                  </span>
                </div>
              </h3>
              
              <div>
                <Select 
                  value={updatedFollowUp.suggestedTemplate}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTemplatesByChannel().map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedTemplate && (
              <div className="text-xs text-muted-foreground mb-1">
                <span className="font-medium">Template:</span> {selectedTemplate.name}
                <span className="mx-2">•</span>
                <span>{selectedTemplate.description}</span>
              </div>
            )}
            
            <div>
              {updatedFollowUp.channel === 'email' ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="subject">Subject Line</Label>
                    <Input 
                      id="subject" 
                      placeholder="Enter email subject..."
                      value={updatedFollowUp.suggestedTemplate === 'refinance_options_email' ? 
                        "Your Refinance Options with NexusISA" : 
                        "Follow-up from NexusISA"
                      }
                      onChange={(e) => {}}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email-body">Email Body</Label>
                    <Textarea 
                      id="email-body" 
                      placeholder="Enter email content..."
                      className="min-h-[400px] font-mono text-sm"
                      value={updatedFollowUp.suggestedContent}
                      onChange={(e) => handleInputChange('suggestedContent', e.target.value)}
                    />
                  </div>
                </div>
              ) : updatedFollowUp.channel === 'phone' ? (
                <div>
                  <Label htmlFor="call-script">Call Script</Label>
                  <Textarea 
                    id="call-script" 
                    placeholder="Enter call script..."
                    className="min-h-[450px]"
                    value={updatedFollowUp.suggestedContent}
                    onChange={(e) => handleInputChange('suggestedContent', e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="sms-content">SMS Content</Label>
                  <Textarea 
                    id="sms-content" 
                    placeholder="Enter SMS content..."
                    className="min-h-[150px]"
                    maxLength={160}
                    value={updatedFollowUp.suggestedContent}
                    onChange={(e) => handleInputChange('suggestedContent', e.target.value)}
                  />
                  <div className="mt-1 text-xs text-right text-muted-foreground">
                    {updatedFollowUp.suggestedContent.length}/160 characters
                  </div>
                </div>
              )}
            </div>
            
            <div className="border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">Available Personalization Variables</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate && selectedTemplate.variables.map((variable) => (
                  <Button 
                    key={variable} 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      const newContent = updatedFollowUp.suggestedContent + ` {{${variable}}}`;
                      handleInputChange('suggestedContent', newContent);
                    }}
                  >
                    {variable}
                  </Button>
                ))}
                
                {(!selectedTemplate || selectedTemplate.variables.length === 0) && (
                  <span className="text-sm text-muted-foreground">
                    No variables available for this template
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(updatedFollowUp)}
        >
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};
