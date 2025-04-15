
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TemplateEditor } from './TemplateEditor';
import { MessageTemplate } from '@/data/sampleFollowUpData';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Mail,
  MessageSquare,
  Phone,
  MoreHorizontal,
  PlusCircle,
  FileEdit,
  Copy,
  Trash,
  Filter,
} from 'lucide-react';

interface TemplateLibraryProps {
  templates: MessageTemplate[];
}

export function TemplateLibrary({ templates: initialTemplates }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | undefined>(undefined);
  const { toast } = useToast();

  // Initialize templates in localStorage if not already present
  useState(() => {
    if (!localStorage.getItem('relayTemplates')) {
      localStorage.setItem('relayTemplates', JSON.stringify(initialTemplates));
    } else {
      // Load templates from localStorage
      const storedTemplates = localStorage.getItem('relayTemplates');
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    }
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const handleSaveTemplate = (savedTemplate: MessageTemplate) => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(
        templates.map((template) => (template.id === savedTemplate.id ? savedTemplate : template))
      );
    } else {
      // Add new template
      setTemplates([...templates, savedTemplate]);
    }
    
    setIsCreatingTemplate(false);
    setEditingTemplate(undefined);
  };

  const handleDeleteTemplate = (templateId: string) => {
    // Update templates in state
    const updatedTemplates = templates.filter((template) => template.id !== templateId);
    setTemplates(updatedTemplates);
    
    // Update templates in localStorage
    localStorage.setItem('relayTemplates', JSON.stringify(updatedTemplates));
    
    // Show success toast
    toast({
      title: 'Template deleted',
      description: 'The template has been removed from your library',
    });
  };

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const duplicatedTemplate: MessageTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      title: `${template.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: 0,
    };
    
    // Add duplicated template to state
    const updatedTemplates = [...templates, duplicatedTemplate];
    setTemplates(updatedTemplates);
    
    // Update templates in localStorage
    localStorage.setItem('relayTemplates', JSON.stringify(updatedTemplates));
    
    // Show success toast
    toast({
      title: 'Template duplicated',
      description: `A copy of "${template.title}" has been created`,
    });
  };

  // Filter templates based on active category and search query
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.tags && template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesCategory && matchesSearch;
  });

  // If in create/edit mode, show the template editor
  if (isCreatingTemplate || editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => {
          setIsCreatingTemplate(false);
          setEditingTemplate(undefined);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>

          <Button onClick={() => setIsCreatingTemplate(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up</TabsTrigger>
          <TabsTrigger value="introduction">Introduction</TabsTrigger>
          <TabsTrigger value="reminder">Reminder</TabsTrigger>
          <TabsTrigger value="thank-you">Thank You</TabsTrigger>
          <TabsTrigger value="offer">Offer</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-medium text-lg mb-1">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  No templates match your current filter criteria.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {template.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTemplate(template)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Edit Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getChannelIcon(template.channel)}
                        <span className="capitalize">{template.channel}</span>
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground flex items-center justify-between">
                      <div>Used {template.usage} times</div>
                      <div className="text-xs">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          navigator.clipboard.writeText(template.content);
                          toast({
                            title: 'Template copied',
                            description: 'Template content copied to clipboard',
                          });
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingTemplate(template)}
                      >
                        <FileEdit className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
