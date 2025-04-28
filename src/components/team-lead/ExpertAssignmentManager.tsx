import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Users, User, Briefcase, MapPin, ArrowRight, Check } from 'lucide-react';

// Sample data for experts
const expertsData = [
  {
    id: 'exp1',
    name: 'Jennifer Thompson',
    avatar: '',
    role: 'Senior Property Expert',
    specializations: ['Luxury Properties', 'Commercial'],
    availability: 'High',
    activeLeads: 3,
    location: 'San Francisco, CA',
    performance: {
      conversionRate: '78%',
      responseTime: '45 min',
      customerSatisfaction: '4.9/5'
    }
  },
  {
    id: 'exp2',
    name: 'Michael Rodriguez',
    avatar: '',
    role: 'Mortgage Specialist',
    specializations: ['First-Time Homebuyers', 'Refinancing'],
    availability: 'Medium',
    activeLeads: 5,
    location: 'New York, NY',
    performance: {
      conversionRate: '82%',
      responseTime: '30 min',
      customerSatisfaction: '4.8/5'
    }
  },
  {
    id: 'exp3',
    name: 'Sarah Johnson',
    avatar: '',
    role: 'Commercial Property Expert',
    specializations: ['Office Spaces', 'Retail Properties'],
    availability: 'Low',
    activeLeads: 7,
    location: 'Chicago, IL',
    performance: {
      conversionRate: '75%',
      responseTime: '60 min',
      customerSatisfaction: '4.6/5'
    }
  },
  {
    id: 'exp4',
    name: 'David Chen',
    avatar: '',
    role: 'Residential Expert',
    specializations: ['Suburban Properties', 'Condos'],
    availability: 'High',
    activeLeads: 2,
    location: 'Austin, TX',
    performance: {
      conversionRate: '80%',
      responseTime: '35 min',
      customerSatisfaction: '4.7/5'
    }
  }
];

// Sample data for pending assignments
const pendingAssignmentsData = [
  {
    id: 'lead1',
    name: 'James Wilson',
    type: 'Residential Buyer',
    location: 'San Francisco Bay Area',
    budget: '$750,000 - $950,000',
    preferences: ['3BR', '2BA', 'Single Family', 'Garage'],
    urgency: 'High',
    aiMatchedExpert: 'exp1',
    status: 'Pending'
  },
  {
    id: 'lead2',
    name: 'Emily Davis',
    type: 'Commercial Investor',
    location: 'Downtown Chicago',
    budget: '$2M - $5M',
    preferences: ['Office Space', '5,000+ sqft', 'Modern Building'],
    urgency: 'Medium',
    aiMatchedExpert: 'exp3',
    status: 'Pending'
  },
  {
    id: 'lead3',
    name: 'Robert Lee',
    type: 'First-Time Homebuyer',
    location: 'Austin Suburbs',
    budget: '$350,000 - $450,000',
    preferences: ['2BR', '2BA', 'Condo', 'Pool'],
    urgency: 'Medium',
    aiMatchedExpert: 'exp4',
    status: 'Pending'
  }
];

export const ExpertAssignmentManager = () => {
  const [experts, setExperts] = useState(expertsData);
  const [pendingAssignments, setPendingAssignments] = useState(pendingAssignmentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const handleApproveAssignment = (leadId: string, expertId: string) => {
    setPendingAssignments(pendingAssignments.map(assignment => 
      assignment.id === leadId ? { ...assignment, status: 'Approved' } : assignment
    ));
    
    toast({
      title: "Assignment approved",
      description: "The lead has been assigned to the expert successfully.",
    });
    
    // In a real application, we would also update the expert's active leads count
  };
  
  const handleReassign = (leadId: string, newExpertId: string) => {
    setPendingAssignments(pendingAssignments.map(assignment => 
      assignment.id === leadId ? { ...assignment, aiMatchedExpert: newExpertId } : assignment
    ));
    
    toast({
      title: "Expert reassigned",
      description: "You've changed the assigned expert for this lead.",
    });
  };

  const filteredExperts = experts.filter(expert => 
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    expert.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAssignments = pendingAssignments.filter(assignment => 
    assignment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'High':
        return <Badge className="bg-green-100 text-green-800">High Availability</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Availability</Badge>;
      case 'Low':
        return <Badge className="bg-red-100 text-red-800">Low Availability</Badge>;
      default:
        return <Badge variant="outline">{availability}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return <Badge className="bg-red-100 text-red-800">High Urgency</Badge>;
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Urgency</Badge>;
      case 'Low':
        return <Badge className="bg-green-100 text-green-800">Low Urgency</Badge>;
      default:
        return <Badge variant="outline">{urgency}</Badge>;
    }
  };

  const getExpertById = (id: string) => {
    return experts.find(expert => expert.id === id) || null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Expert Assignment Manager</CardTitle>
          <CardDescription>
            Review AI-recommended expert assignments and manage property expert workloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search experts or leads..."
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter Options
            </Button>
          </div>
          
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">
                Pending Assignments
              </TabsTrigger>
              <TabsTrigger value="experts">
                Expert Roster
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-4">
              {filteredAssignments.map(assignment => {
                const matchedExpert = getExpertById(assignment.aiMatchedExpert);
                
                return (
                  <Card key={assignment.id} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 md:border-r">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{assignment.name}</h3>
                            <p className="text-sm text-muted-foreground">{assignment.type}</p>
                          </div>
                          {getUrgencyBadge(assignment.urgency)}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{assignment.location}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Budget:</span> {assignment.budget}
                          </div>
                          <div>
                            <span className="text-sm font-medium">Preferences:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {assignment.preferences.map((pref, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {pref}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/10">
                        <h4 className="font-medium text-sm mb-2">AI Recommended Expert</h4>
                        {matchedExpert && (
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={matchedExpert.avatar} alt={matchedExpert.name} />
                              <AvatarFallback>{matchedExpert.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{matchedExpert.name}</div>
                              <div className="text-sm text-muted-foreground">{matchedExpert.role}</div>
                            </div>
                          </div>
                        )}
                        
                        {matchedExpert && (
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {matchedExpert.specializations.map((spec, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Current leads: </span>
                                <span className="font-medium">{matchedExpert.activeLeads}</span>
                              </div>
                              {getAvailabilityBadge(matchedExpert.availability)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Assignment Actions</h4>
                          <div className="space-y-2">
                            <Button 
                              variant="default" 
                              className="w-full"
                              onClick={() => handleApproveAssignment(assignment.id, assignment.aiMatchedExpert)}
                            >
                              Approve Assignment
                            </Button>
                            <Button variant="outline" className="w-full">
                              Change Expert
                            </Button>
                            <Button variant="ghost" className="w-full text-muted-foreground">
                              Review Details
                            </Button>
                          </div>
                        </div>
                        
                        {assignment.status === 'Approved' && (
                          <div className="mt-4 p-2 bg-green-50 text-green-700 text-sm rounded-md">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 mr-2" />
                              Approved and assigned
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              
              {filteredAssignments.length === 0 && (
                <div className="text-center p-8 border rounded-md">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No pending assignments</h3>
                  <p className="mt-1 text-muted-foreground">
                    All leads have been assigned to property experts.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="experts" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExperts.map((expert) => (
                  <Card key={expert.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={expert.avatar} alt={expert.name} />
                            <AvatarFallback>{expert.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{expert.name}</CardTitle>
                            <CardDescription>{expert.role}</CardDescription>
                          </div>
                        </div>
                        {getAvailabilityBadge(expert.availability)}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Specializations</p>
                          <div className="flex flex-wrap gap-1">
                            {expert.specializations.map((spec, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Location</p>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="text-sm">{expert.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-1">Performance</p>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="font-medium">{expert.performance.conversionRate}</p>
                            <p className="text-xs text-muted-foreground">Conversion</p>
                          </div>
                          <div>
                            <p className="font-medium">{expert.performance.responseTime}</p>
                            <p className="text-xs text-muted-foreground">Avg. Response</p>
                          </div>
                          <div>
                            <p className="font-medium">{expert.performance.customerSatisfaction}</p>
                            <p className="text-xs text-muted-foreground">Satisfaction</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {expert.activeLeads} active leads
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {filteredExperts.length === 0 && (
                <div className="text-center p-8 border rounded-md">
                  <User className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No experts found</h3>
                  <p className="mt-1 text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
