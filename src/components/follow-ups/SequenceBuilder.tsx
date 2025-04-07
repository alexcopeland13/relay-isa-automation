
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Sequence } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail, 
  Phone, 
  MessageSquare, 
  Filter,
  ChevronDown,
  ChevronUp,
  BarChart4,
  ArrowRight,
  Copy,
  Edit,
  Trash,
  Plus,
  Tag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SequenceBuilderProps {
  sequences: Sequence[];
}

export const SequenceBuilder = ({ sequences }: SequenceBuilderProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Inactive</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Draft</Badge>;
      default:
        return null;
    }
  };

  const filteredSequences = sequences.filter(sequence => {
    const matchesSearch = 
      sequence.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sequence.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || sequence.leadType.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesType;
  });

  const leadTypes = Array.from(new Set(sequences.map(sequence => sequence.leadType)));

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
            <CardTitle className="text-xl">Sequence Builder</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sequences..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Filters
                  {showFilters ? 
                    <ChevronUp className="h-3 w-3 ml-1" /> : 
                    <ChevronDown className="h-3 w-3 ml-1" />
                  }
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <div className="px-6 pb-3">
            <div className="p-4 border rounded-md bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Lead Types</h4>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={typeFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setTypeFilter('all')}
                >
                  All
                </Badge>
                
                {leadTypes.map(type => (
                  <Badge 
                    key={type}
                    variant={typeFilter === type ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setTypeFilter(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <CardContent>
          {filteredSequences.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-10 border rounded-md bg-muted/30">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-medium">No sequences found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search parameters
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredSequences.length} sequences
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredSequences.map((sequence) => (
                  <Collapsible key={sequence.id} className="border rounded-md">
                    <div className="p-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{sequence.name}</h3>
                          {getStatusBadge(sequence.status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {sequence.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {sequence.leadType}
                          </Badge>
                          {sequence.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="text-right text-sm flex flex-col items-end">
                          <div className="text-muted-foreground mb-1">
                            {sequence.steps.length} steps
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <BarChart4 className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-green-600">{sequence.performanceMetrics.conversionRate}%</span>
                              <span className="text-xs text-muted-foreground">conv.</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedSequence(sequence);
                              setPreviewOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <CollapsibleTrigger className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted">
                          <ChevronDown className="h-4 w-4" />
                        </CollapsibleTrigger>
                      </div>
                    </div>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-2 border-t">
                        <div className="flex flex-col gap-3">
                          {sequence.steps.map((step, index) => (
                            <div 
                              key={step.id}
                              className="flex items-start relative"
                            >
                              <div className="mr-4 flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                {index < sequence.steps.length - 1 && (
                                  <div className="w-px h-full bg-border absolute top-6 bottom-0 left-3" />
                                )}
                              </div>
                              
                              <div className="flex-1 border rounded-md p-3">
                                <div className="flex justify-between mb-2">
                                  <div className="flex items-center">
                                    {getChannelIcon(step.channel)}
                                    <span className="ml-1 capitalize font-medium">{step.channel}</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Delay: {step.delay}
                                  </div>
                                </div>
                                
                                {step.conditions.length > 0 && (
                                  <div className="text-xs bg-muted/30 border rounded p-2 mb-2">
                                    <div className="font-medium mb-1">Conditions:</div>
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                      {step.conditions.map((condition, i) => (
                                        <li key={i}>
                                          {condition.type === 'no_response' && 
                                            `Execute if no response to step ${condition.value.replace('step-', '')}`}
                                          {condition.type === 'no_application' && 
                                            'Execute if no application submitted'}
                                          {condition.type === 'contacted' && 
                                            `Execute if successfully contacted in step ${condition.value.replace('step-', '')}`}
                                          {condition.type === 'not_contacted' && 
                                            `Execute if failed to contact in step ${condition.value.replace('step-', '')}`}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-sm">
                                    Template: <span className="text-muted-foreground">{step.templateId.replace('template-', 'T')}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex items-center pl-4 mt-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add Step
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </>
          )}
          
          <Button className="mt-6 w-full">
            Create New Sequence
          </Button>
        </CardContent>
      </Card>
      
      {/* Sequence Preview Dialog */}
      {selectedSequence && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedSequence.name}</DialogTitle>
              <DialogDescription>{selectedSequence.description}</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-4">
              <div className="space-y-4 md:col-span-1">
                <div>
                  <h4 className="text-sm font-medium mb-1">Sequence Details</h4>
                  <div className="border rounded-md p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lead Type:</span>
                      <Badge variant="outline">{selectedSequence.leadType}</Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedSequence.status)}
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Steps:</span>
                      <span>{selectedSequence.steps.length}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{format(parseISO(selectedSequence.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{format(parseISO(selectedSequence.lastModified), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Performance Metrics</h4>
                  <div className="border rounded-md p-3 space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Completion Rate:</span>
                        <span className="font-medium">{selectedSequence.performanceMetrics.completionRate}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ 
                            width: `${selectedSequence.performanceMetrics.completionRate}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Conversion Rate:</span>
                        <span className="font-medium">{selectedSequence.performanceMetrics.conversionRate}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ 
                            width: `${selectedSequence.performanceMetrics.conversionRate}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Leads In Sequence:</span>
                      <span className="font-medium">{selectedSequence.performanceMetrics.avgLeadsInSequence}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    <h4 className="text-sm font-medium">Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSequence.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-3">
                <h4 className="text-sm font-medium mb-3">Sequence Flow</h4>
                <div className="border rounded-md p-4">
                  <div className="flex flex-col gap-6">
                    {selectedSequence.steps.map((step, index) => (
                      <div 
                        key={step.id}
                        className="flex items-start relative"
                      >
                        <div className="mr-4 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          {index < selectedSequence.steps.length - 1 && (
                            <div className="h-14 flex flex-col items-center justify-center">
                              <div className="w-px h-full bg-border" />
                              <ArrowRight className="h-4 w-4 text-muted-foreground absolute top-14" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 border rounded-md">
                          <div className="p-3 border-b flex justify-between">
                            <div className="flex items-center">
                              {getChannelIcon(step.channel)}
                              <span className="ml-1 capitalize font-medium">{step.channel}</span>
                            </div>
                            
                            <div className="flex gap-2 items-center">
                              <Badge 
                                variant="outline" 
                                className="bg-muted/50 text-xs"
                              >
                                {step.delay}
                              </Badge>
                              
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-3 text-sm">
                            <div className="mb-3">
                              <div className="font-medium mb-1">Template:</div>
                              <div className="text-muted-foreground">
                                {step.templateId === 'template-001' ? 'Refinance Options Email' :
                                 step.templateId === 'template-002' ? 'First-Time Homebuyer - Initial Contact' :
                                 step.templateId === 'template-003' ? 'Investment Property Call Script' :
                                 step.templateId === 'template-004' ? 'Rate Alert SMS' :
                                 step.templateId === 'template-005' ? 'Document Request Email' :
                                 step.templateId}
                              </div>
                            </div>
                            
                            {step.conditions.length > 0 && (
                              <div className="mb-3">
                                <div className="font-medium mb-1">Conditions:</div>
                                <div className="bg-muted/30 border rounded p-2 text-muted-foreground">
                                  <ul className="list-disc list-inside space-y-1">
                                    {step.conditions.map((condition, i) => (
                                      <li key={i}>
                                        {condition.type === 'no_response' && 
                                          `Execute if no response to step ${condition.value.replace('step-', '')}`}
                                        {condition.type === 'no_application' && 
                                          'Execute if no application submitted'}
                                        {condition.type === 'contacted' && 
                                          `Execute if successfully contacted in step ${condition.value.replace('step-', '')}`}
                                        {condition.type === 'not_contacted' && 
                                          `Execute if failed to contact in step ${condition.value.replace('step-', '')}`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex items-center pl-8 mt-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Step
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="destructive">
                      <Trash className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
