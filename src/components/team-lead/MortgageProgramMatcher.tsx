
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, ArrowRight, CheckCircle2, Percent, DollarSign, Home } from 'lucide-react';

// Sample mortgage programs
const mortgagePrograms = [
  {
    id: 'prog1',
    name: 'First-Time Homebuyer Special',
    type: 'Conventional',
    rate: 4.25,
    apr: 4.5,
    term: '30-year fixed',
    downPayment: 3,
    requirements: ['First-time homebuyer', 'Min credit score: 640', 'Max DTI: 45%'],
    features: ['Low down payment', 'No PMI with 20% down', 'Rate lock available'],
    recommended: true,
    popular: true
  },
  {
    id: 'prog2',
    name: 'VA Home Loan',
    type: 'Government',
    rate: 4.0,
    apr: 4.25,
    term: '30-year fixed',
    downPayment: 0,
    requirements: ['Active or veteran military', 'Min credit score: 620', 'VA eligibility required'],
    features: ['No down payment required', 'No PMI', 'Competitive rates'],
    recommended: false,
    popular: true
  },
  {
    id: 'prog3',
    name: 'Jumbo Elite',
    type: 'Jumbo',
    rate: 4.75,
    apr: 4.9,
    term: '30-year fixed',
    downPayment: 10,
    requirements: ['Min credit score: 720', 'Max loan: $2.5M', 'Max DTI: 43%'],
    features: ['Higher loan limits', 'Flexible terms', 'Second home eligible'],
    recommended: false,
    popular: false
  },
  {
    id: 'prog4',
    name: 'FHA Standard',
    type: 'Government',
    rate: 4.5,
    apr: 4.75,
    term: '30-year fixed',
    downPayment: 3.5,
    requirements: ['Min credit score: 580', 'Max DTI: 50%', 'Primary residence only'],
    features: ['Low down payment', 'Flexible credit requirements', 'Assumable'],
    recommended: true,
    popular: true
  },
  {
    id: 'prog5',
    name: '15-Year Fixed Rate',
    type: 'Conventional',
    rate: 3.75,
    apr: 3.95,
    term: '15-year fixed',
    downPayment: 5,
    requirements: ['Min credit score: 680', 'Max DTI: 45%'],
    features: ['Lower interest rate', 'Build equity faster', 'Lower total interest'],
    recommended: false,
    popular: false
  }
];

// Sample pending leads that need program matching
const pendingLeads = [
  {
    id: 'mlead1',
    name: 'Amanda Johnson',
    email: 'aj@example.com',
    creditScore: 710,
    income: '$95,000/year',
    dti: '38%',
    loanAmount: '$425,000',
    propertyType: 'Single-family home',
    occupancy: 'Primary residence',
    hasRecommendation: true,
    recommendedProgram: 'prog1'
  },
  {
    id: 'mlead2',
    name: 'Marcus Williams',
    email: 'mwilliams@example.com',
    creditScore: 680,
    income: '$75,000/year',
    dti: '42%',
    loanAmount: '$320,000',
    propertyType: 'Condo',
    occupancy: 'Primary residence',
    hasRecommendation: true,
    recommendedProgram: 'prog4'
  },
  {
    id: 'mlead3',
    name: 'Daniel Lee',
    email: 'dlee@example.com',
    creditScore: 760,
    income: '$185,000/year',
    dti: '35%',
    loanAmount: '$950,000',
    propertyType: 'Luxury home',
    occupancy: 'Second home',
    hasRecommendation: true,
    recommendedProgram: 'prog3'
  }
];

export const MortgageProgramMatcher = () => {
  const [programs, setPrograms] = useState(mortgagePrograms);
  const [leads, setLeads] = useState(pendingLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const { toast } = useToast();

  // Slider values for filtering
  const [rateRange, setRateRange] = useState([3.5, 5.0]);
  const [downPaymentRange, setDownPaymentRange] = useState([0, 20]);

  const handleAssignProgram = (leadId: string, programId: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, recommendedProgram: programId } : lead
    ));
    
    toast({
      title: "Program assigned",
      description: "The mortgage program has been assigned to the lead.",
    });
  };

  const filteredPrograms = programs.filter(program => {
    if (searchTerm && !program.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
      
    if (filterType !== 'all' && program.type !== filterType)
      return false;
      
    if (program.rate < rateRange[0] || program.rate > rateRange[1])
      return false;
      
    if (program.downPayment < downPaymentRange[0] || program.downPayment > downPaymentRange[1])
      return false;
      
    return true;
  });

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getProgramById = (id: string) => {
    return programs.find(program => program.id === id);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Program Matcher</CardTitle>
          <CardDescription>
            Match leads with the most suitable mortgage programs based on their financial profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs or leads..."
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="leads" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="leads">
                Lead Matching
              </TabsTrigger>
              <TabsTrigger value="programs">
                Program Library
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="leads" className="space-y-4">
              {filteredLeads.map(lead => {
                const recommendedProgram = getProgramById(lead.recommendedProgram);
                
                return (
                  <Card key={lead.id} className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 md:border-r">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{lead.name}</h3>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Credit Score:</span>
                            <span className="ml-2 font-medium">{lead.creditScore}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Income:</span>
                            <span className="ml-2 font-medium">{lead.income}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">DTI:</span>
                            <span className="ml-2 font-medium">{lead.dti}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Loan Amount:</span>
                            <span className="ml-2 font-medium">{lead.loanAmount}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Property:</span>
                            <span className="ml-2 font-medium">{lead.propertyType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Occupancy:</span>
                            <span className="ml-2 font-medium">{lead.occupancy}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/10">
                        <h4 className="font-medium text-sm mb-2">AI Recommended Program</h4>
                        {recommendedProgram && (
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{recommendedProgram.name}</h3>
                              <Badge variant={recommendedProgram.popular ? "default" : "outline"}>
                                {recommendedProgram.type}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                              <div className="p-2 bg-muted/20 rounded-md">
                                <div className="flex items-center justify-center text-primary">
                                  <Percent className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{recommendedProgram.rate}%</span>
                                </div>
                                <p className="text-xs text-center text-muted-foreground mt-1">Rate</p>
                              </div>
                              <div className="p-2 bg-muted/20 rounded-md">
                                <div className="flex items-center justify-center text-primary">
                                  <Percent className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{recommendedProgram.apr}%</span>
                                </div>
                                <p className="text-xs text-center text-muted-foreground mt-1">APR</p>
                              </div>
                              <div className="p-2 bg-muted/20 rounded-md">
                                <div className="flex items-center justify-center text-primary">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  <span className="font-medium">{recommendedProgram.downPayment}%</span>
                                </div>
                                <p className="text-xs text-center text-muted-foreground mt-1">Down</p>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-1">Key Requirements:</p>
                              <div className="flex flex-wrap gap-1">
                                {recommendedProgram.requirements.map((req, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Term:</span>
                              <span className="ml-2">{recommendedProgram.term}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Program Actions</h4>
                          <div className="space-y-2">
                            <Button 
                              variant="default" 
                              className="w-full"
                              onClick={() => {
                                toast({
                                  title: "Program approved",
                                  description: "The recommendation has been approved and saved.",
                                });
                              }}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve Recommendation
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => setSelectedLead(lead.id)}
                            >
                              Change Program
                            </Button>
                            <Button variant="ghost" className="w-full text-muted-foreground">
                              Review All Options
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-muted-foreground text-sm">
                          <p>AI Match Confidence: 87%</p>
                          <div className="w-full h-2 bg-muted mt-1 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '87%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
            
            <TabsContent value="programs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Program Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="programType" className="mb-2 block">Program Type</Label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger id="programType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Programs</SelectItem>
                          <SelectItem value="Conventional">Conventional</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                          <SelectItem value="Jumbo">Jumbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Interest Rate (%)</Label>
                        <span className="text-sm">{rateRange[0]}% - {rateRange[1]}%</span>
                      </div>
                      <Slider
                        defaultValue={[3.5, 5.0]}
                        max={7}
                        min={2}
                        step={0.1}
                        value={rateRange}
                        onValueChange={setRateRange}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Down Payment (%)</Label>
                        <span className="text-sm">{downPaymentRange[0]}% - {downPaymentRange[1]}%</span>
                      </div>
                      <Slider
                        defaultValue={[0, 20]}
                        max={30}
                        min={0}
                        step={1}
                        value={downPaymentRange}
                        onValueChange={setDownPaymentRange}
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-x-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setRateRange([3.5, 5.0]);
                      setDownPaymentRange([0, 20]);
                      setFilterType('all');
                    }}>
                      Reset Filters
                    </Button>
                    
                    <Button variant="default" size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrograms.map((program) => (
                  <Card key={program.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                        <Badge variant={program.popular ? "default" : "outline"}>
                          {program.type}
                        </Badge>
                      </div>
                      <CardDescription>{program.term}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-muted/20 rounded-md">
                          <div className="flex items-center justify-center text-primary">
                            <Percent className="h-4 w-4 mr-1" />
                            <span className="font-medium">{program.rate}%</span>
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-1">Rate</p>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-md">
                          <div className="flex items-center justify-center text-primary">
                            <Percent className="h-4 w-4 mr-1" />
                            <span className="font-medium">{program.apr}%</span>
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-1">APR</p>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-md">
                          <div className="flex items-center justify-center text-primary">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-medium">{program.downPayment}%</span>
                          </div>
                          <p className="text-xs text-center text-muted-foreground mt-1">Down</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-1">Requirements</h4>
                        <div className="flex flex-wrap gap-1">
                          {program.requirements.map((req, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Features</h4>
                        <div className="flex flex-wrap gap-1">
                          {program.features.map((feature, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <Label htmlFor={`recommended-${program.id}`} className="text-sm mr-2">
                            Recommended
                          </Label>
                          <Switch 
                            id={`recommended-${program.id}`}
                            checked={program.recommended}
                            onCheckedChange={(checked) => {
                              setPrograms(programs.map(p => 
                                p.id === program.id ? {...p, recommended: checked} : p
                              ));
                            }}
                          />
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
