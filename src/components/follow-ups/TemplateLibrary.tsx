
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Template } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Mail, 
  Phone, 
  MessageSquare, 
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Copy,
  Trash,
  BarChart4,
  Tag
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TemplateLibraryProps {
  templates: Template[];
}

export const TemplateLibrary = ({ templates }: TemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesChannel = channelFilter === 'all' || template.channel === channelFilter;
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    
    return matchesSearch && matchesChannel && matchesCategory;
  });

  const categories = Array.from(new Set(templates.map(template => template.category)));

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
            <CardTitle className="text-xl">Template Library</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
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
                
                <Tabs 
                  value={channelFilter} 
                  onValueChange={setChannelFilter}
                  className="hidden md:block"
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Call</TabsTrigger>
                    <TabsTrigger value="sms">SMS</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="hidden md:flex items-center gap-1 border rounded-md">
                  <Button 
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => setViewMode('grid')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </Button>
                  <Button 
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => setViewMode('list')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <div className="px-6 pb-3">
            <div className="p-4 border rounded-md bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={categoryFilter === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setCategoryFilter('all')}
                >
                  All
                </Badge>
                
                {categories.map(category => (
                  <Badge 
                    key={category}
                    variant={categoryFilter === category ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <CardContent>
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-10 border rounded-md bg-muted/30">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search parameters
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Showing {filteredTemplates.length} templates
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="border rounded-md hover:border-primary cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setPreviewOpen(true);
                      }}
                    >
                      <div className="p-4 border-b">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            {getChannelIcon(template.channel)}
                            <span className="font-medium ml-1">{template.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                        <div>Updated {format(parseISO(template.lastModified), 'MMM d, yyyy')}</div>
                        <div className="flex items-center gap-1">
                          <BarChart4 className="h-3 w-3" />
                          <span>{template.performanceMetrics.responseRate}% response</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium text-sm">Template</th>
                        <th className="text-left p-2 font-medium text-sm">Channel</th>
                        <th className="text-left p-2 font-medium text-sm">Category</th>
                        <th className="text-left p-2 font-medium text-sm">Response Rate</th>
                        <th className="text-left p-2 font-medium text-sm">Last Updated</th>
                        <th className="text-right p-2 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTemplates.map((template) => (
                        <tr 
                          key={template.id}
                          className="hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {template.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              {getChannelIcon(template.channel)}
                              <span className="ml-1 capitalize">{template.channel}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                <div 
                                  className="h-full bg-primary"
                                  style={{ 
                                    width: `${template.performanceMetrics.responseRate}%` 
                                  }}
                                />
                              </div>
                              <span className="ml-2 text-sm">{template.performanceMetrics.responseRate}%</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="text-sm">
                              {format(parseISO(template.lastModified), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTemplate(template);
                                  setPreviewOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          
          <Button className="mt-6 w-full">
            Create New Template
          </Button>
        </CardContent>
      </Card>
      
      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>{selectedTemplate.description}</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Template Details</h4>
                  <div className="border rounded-md p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channel:</span>
                      <div className="flex items-center">
                        {getChannelIcon(selectedTemplate.channel)}
                        <span className="ml-1 capitalize">{selectedTemplate.channel}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedTemplate.category}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subcategory:</span>
                      <span>{selectedTemplate.subcategory}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedTemplate.status}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{format(parseISO(selectedTemplate.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{format(parseISO(selectedTemplate.lastModified), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Performance Metrics</h4>
                  <div className="border rounded-md p-3 space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Usage Count:</span>
                        <span className="font-medium">{selectedTemplate.performanceMetrics.usageCount}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Response Rate:</span>
                        <span className="font-medium">{selectedTemplate.performanceMetrics.responseRate}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ 
                            width: `${selectedTemplate.performanceMetrics.responseRate}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Conversion Rate:</span>
                        <span className="font-medium">{selectedTemplate.performanceMetrics.conversionRate}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ 
                            width: `${selectedTemplate.performanceMetrics.conversionRate}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Time to Response:</span>
                      <span className="font-medium">{selectedTemplate.performanceMetrics.avgTimeToResponse}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    <h4 className="text-sm font-medium">Tags</h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium mb-1">Content Preview</h4>
                <div className="border rounded-md p-4">
                  {selectedTemplate.channel === 'email' ? (
                    <div className="space-y-2">
                      <div className="border-b pb-2 mb-2">
                        <div className="text-sm font-medium">Subject: Your Refinance Options with NexusISA</div>
                      </div>
                      
                      <div className="text-sm whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </div>
                    </div>
                  ) : selectedTemplate.channel === 'phone' ? (
                    <div className="space-y-2">
                      <div className="border rounded-md p-2 bg-muted/30 mb-2">
                        <div className="text-xs text-muted-foreground mb-1">Call Script</div>
                      </div>
                      
                      <div className="text-sm whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border rounded-md p-2 bg-muted/30 mb-2">
                        <div className="text-xs text-muted-foreground mb-1">SMS Message</div>
                      </div>
                      
                      <div className="text-sm whitespace-pre-wrap">
                        {selectedTemplate.content}
                      </div>
                      
                      <div className="text-xs text-right text-muted-foreground mt-2">
                        {selectedTemplate.content.length} characters
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Variables</h4>
                  <div className="border rounded-md p-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="destructive">
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
