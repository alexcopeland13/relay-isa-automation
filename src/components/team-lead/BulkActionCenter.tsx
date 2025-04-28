
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Filter, Calendar, 
  SendIcon, Clock, FileText, 
  CheckCircle2, ArrowRight, Download,
  Mail, Phone, MessageSquare, File
} from 'lucide-react';

// Sample leads for bulk actions
const leadsData = [
  {
    id: 'lead1',
    name: 'Jessica Anderson',
    email: 'jessicaa@example.com',
    phone: '(555) 234-5678',
    status: 'Qualified',
    lastContact: '2023-07-15',
    stage: 'Documentation',
    documentStatus: 'Pending',
    nextAction: 'Send welcome packet',
    assignedTo: 'Michael Rodriguez'
  },
  {
    id: 'lead2',
    name: 'Thomas Garcia',
    email: 'tgarcia@example.com',
    phone: '(555) 876-5432',
    status: 'Qualified',
    lastContact: '2023-07-14',
    stage: 'Application',
    documentStatus: 'Incomplete',
    nextAction: 'Request bank statements',
    assignedTo: 'Sarah Johnson'
  },
  {
    id: 'lead3',
    name: 'Laura Martinez',
    email: 'lmartinez@example.com',
    phone: '(555) 345-6789',
    status: 'Qualified',
    lastContact: '2023-07-16',
    stage: 'Pre-approved',
    documentStatus: 'Complete',
    nextAction: 'Schedule property viewing',
    assignedTo: 'David Chen'
  },
  {
    id: 'lead4',
    name: 'John Wilson',
    email: 'jwilson@example.com',
    phone: '(555) 456-7890',
    status: 'Qualified',
    lastContact: '2023-07-13',
    stage: 'Documentation',
    documentStatus: 'Pending',
    nextAction: 'Send disclosure forms',
    assignedTo: 'Jennifer Thompson'
  },
  {
    id: 'lead5',
    name: 'Kimberly Davis',
    email: 'kdavis@example.com',
    phone: '(555) 567-8901',
    status: 'Qualified',
    lastContact: '2023-07-12',
    stage: 'Application',
    documentStatus: 'Not Started',
    nextAction: 'Initial consultation',
    assignedTo: 'Michael Rodriguez'
  }
];

// Sample documents for bulk sending
const documentTemplates = [
  {
    id: 'doc1',
    name: 'Welcome Packet',
    description: 'Introduction materials for new clients',
    type: 'PDF',
    lastUpdated: '2023-06-20'
  },
  {
    id: 'doc2',
    name: 'Disclosure Forms',
    description: 'Required legal disclosures',
    type: 'PDF',
    lastUpdated: '2023-07-01'
  },
  {
    id: 'doc3',
    name: 'Pre-Approval Letter',
    description: 'Official pre-approval for qualified leads',
    type: 'PDF',
    lastUpdated: '2023-07-10'
  },
  {
    id: 'doc4',
    name: 'Documentation Checklist',
    description: 'List of required documents for mortgage application',
    type: 'PDF',
    lastUpdated: '2023-06-15'
  },
  {
    id: 'doc5',
    name: 'Rate Options',
    description: 'Current rate options and comparison sheet',
    type: 'Excel',
    lastUpdated: '2023-07-18'
  }
];

// Sample follow-up templates
const followUpTemplates = [
  {
    id: 'fu1',
    name: 'Documentation Reminder',
    description: 'Reminder to submit required documents',
    channel: 'Email',
    lastUsed: '2023-07-15'
  },
  {
    id: 'fu2',
    name: 'Weekly Check-in',
    description: 'Regular check-in call with lead',
    channel: 'Phone',
    lastUsed: '2023-07-16'
  },
  {
    id: 'fu3',
    name: 'Application Status Update',
    description: 'Update on application progress',
    channel: 'Email',
    lastUsed: '2023-07-10'
  },
  {
    id: 'fu4',
    name: 'Appointment Confirmation',
    description: 'Confirm upcoming appointment',
    channel: 'SMS',
    lastUsed: '2023-07-14'
  },
  {
    id: 'fu5',
    name: 'Next Steps Overview',
    description: 'Outline next steps in the process',
    channel: 'Email',
    lastUsed: '2023-07-12'
  }
];

export const BulkActionCenter = () => {
  const [leads, setLeads] = useState(leadsData);
  const [documents, setDocuments] = useState(documentTemplates);
  const [followUps, setFollowUps] = useState(followUpTemplates);
  
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Handle select all leads
  const handleSelectAllLeads = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };
  
  // Handle select individual lead
  const handleSelectLead = (checked: boolean, leadId: string) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };
  
  // Handle select document
  const handleSelectDocument = (checked: boolean, docId: string) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, docId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== docId));
    }
  };
  
  const handleSendDocuments = () => {
    if (selectedLeads.length === 0 || selectedDocuments.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select both leads and documents to send.",
        variant: "destructive"
      });
      return;
    }
    
    const leadCount = selectedLeads.length;
    const docCount = selectedDocuments.length;
    
    toast({
      title: "Documents sent successfully",
      description: `Sent ${docCount} document${docCount > 1 ? 's' : ''} to ${leadCount} lead${leadCount > 1 ? 's' : ''}.`,
    });
    
    // Reset selections
    setSelectedDocuments([]);
  };
  
  const handleCreateFollowUp = () => {
    if (selectedLeads.length === 0 || !selectedTemplate) {
      toast({
        title: "Selection required",
        description: "Please select both leads and a follow-up template.",
        variant: "destructive"
      });
      return;
    }
    
    const leadCount = selectedLeads.length;
    const template = followUps.find(t => t.id === selectedTemplate);
    
    toast({
      title: "Follow-ups scheduled",
      description: `Created ${template?.name} follow-up for ${leadCount} lead${leadCount > 1 ? 's' : ''}.`,
    });
    
    // Reset template selection
    setSelectedTemplate(null);
  };
  
  const filteredLeads = leads.filter(lead => {
    if (searchTerm && !lead.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !lead.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'Excel':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'Word':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'SMS':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'Phone':
        return <Phone className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Complete':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>;
      case 'Incomplete':
        return <Badge className="bg-orange-100 text-orange-800">{status}</Badge>;
      case 'Not Started':
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Action Center</CardTitle>
          <CardDescription>
            Efficiently manage document sending and follow-ups for multiple leads at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="documents" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="documents">
                <FileText className="mr-2 h-4 w-4" />
                Document Sending
              </TabsTrigger>
              <TabsTrigger value="followups">
                <Calendar className="mr-2 h-4 w-4" />
                Follow-Up Creation
              </TabsTrigger>
            </TabsList>
            
            {/* Document Sending Tab */}
            <TabsContent value="documents">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Select Leads</CardTitle>
                      <Badge variant="outline">
                        {selectedLeads.length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox 
                                checked={selectedLeads.length === leads.length}
                                onCheckedChange={handleSelectAllLeads}
                              />
                            </TableHead>
                            <TableHead>Lead</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Documents</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeads.map(lead => (
                            <TableRow key={lead.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedLeads.includes(lead.id)}
                                  onCheckedChange={(checked) => handleSelectLead(!!checked, lead.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{lead.name}</div>
                                  <div className="text-sm text-muted-foreground">{lead.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{lead.stage}</TableCell>
                              <TableCell>{getStatusBadge(lead.documentStatus)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Document Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Select Documents</CardTitle>
                      <Badge variant="outline">
                        {selectedDocuments.length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documents.map(doc => (
                        <div 
                          key={doc.id} 
                          className={`p-3 border rounded-lg flex items-start ${selectedDocuments.includes(doc.id) ? 'bg-primary/5 border-primary/20' : ''}`}
                        >
                          <Checkbox 
                            id={`doc-${doc.id}`}
                            checked={selectedDocuments.includes(doc.id)}
                            onCheckedChange={(checked) => handleSelectDocument(!!checked, doc.id)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center">
                              {getDocumentIcon(doc.type)}
                              <Label 
                                htmlFor={`doc-${doc.id}`} 
                                className="font-medium ml-2 cursor-pointer"
                              >
                                {doc.name}
                              </Label>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {doc.description}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Badge variant="outline" className="text-xs">
                                {doc.type}
                              </Badge>
                              <span className="ml-2">
                                Updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Preview
                      </Button>
                      
                      <Button 
                        onClick={handleSendDocuments}
                        disabled={selectedLeads.length === 0 || selectedDocuments.length === 0}
                      >
                        <SendIcon className="mr-2 h-4 w-4" />
                        Send Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Follow-Up Creation Tab */}
            <TabsContent value="followups">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Select Leads</CardTitle>
                      <Badge variant="outline">
                        {selectedLeads.length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        className="pl-8" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox 
                                checked={selectedLeads.length === leads.length}
                                onCheckedChange={handleSelectAllLeads}
                              />
                            </TableHead>
                            <TableHead>Lead</TableHead>
                            <TableHead>Last Contact</TableHead>
                            <TableHead>Next Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLeads.map(lead => (
                            <TableRow key={lead.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedLeads.includes(lead.id)}
                                  onCheckedChange={(checked) => handleSelectLead(!!checked, lead.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{lead.name}</div>
                                  <div className="text-sm text-muted-foreground">{lead.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center text-sm">
                                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {new Date(lead.lastContact).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{lead.nextAction}</div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Follow-Up Template Selection */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Select Follow-Up Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {followUps.map(template => (
                        <div 
                          key={template.id}
                          className={`p-3 border rounded-lg flex items-start ${selectedTemplate === template.id ? 'bg-primary/5 border-primary/20' : ''}`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="h-5 w-5 mr-3 rounded-full border flex items-center justify-center">
                            {selectedTemplate === template.id && (
                              <div className="h-3 w-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              {getChannelIcon(template.channel)}
                              <span className="font-medium ml-2">
                                {template.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Badge variant="outline" className="text-xs">
                                {template.channel}
                              </Badge>
                              <span className="ml-2">
                                Last used: {new Date(template.lastUsed).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="ml-2">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex items-center">
                      <div className="flex-1">
                        <Label htmlFor="schedule-date" className="mb-1 block">Schedule Date</Label>
                        <Input id="schedule-date" type="date" />
                      </div>
                      <div className="flex-1 ml-4">
                        <Label htmlFor="schedule-time" className="mb-1 block">Time</Label>
                        <Input id="schedule-time" type="time" />
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        View Calendar
                      </Button>
                      
                      <Button 
                        onClick={handleCreateFollowUp}
                        disabled={selectedLeads.length === 0 || !selectedTemplate}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Schedule Follow-Ups
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
