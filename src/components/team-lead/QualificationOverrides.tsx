
import { useState } from 'react';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, MoreHorizontal, Check, X, 
  AlertTriangle, CheckCircle2, ArrowUpDown,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const leadsData = [
  { 
    id: 1, 
    name: 'Michael Brown', 
    email: 'michael.b@example.com',
    aiDecision: 'Qualified', 
    qualificationScore: 78,
    income: '$85,000',
    debt: '$1,200/mo',
    creditScore: '720',
    timestamp: '2023-07-18T15:30:00',
    overrideStatus: null
  },
  { 
    id: 2, 
    name: 'Sarah Martinez', 
    email: 'smartinez@example.com',
    aiDecision: 'Needs Review', 
    qualificationScore: 65,
    income: '$65,000',
    debt: '$1,800/mo',
    creditScore: '680',
    timestamp: '2023-07-18T14:15:00',
    overrideStatus: null
  },
  { 
    id: 3, 
    name: 'David Wilson', 
    email: 'dwilson@example.com',
    aiDecision: 'Not Qualified', 
    qualificationScore: 42,
    income: '$55,000',
    debt: '$2,200/mo',
    creditScore: '620',
    timestamp: '2023-07-18T11:45:00',
    overrideStatus: 'Approved'
  },
  { 
    id: 4, 
    name: 'Jennifer Adams', 
    email: 'jadams@example.com',
    aiDecision: 'Qualified', 
    qualificationScore: 88,
    income: '$110,000',
    debt: '$900/mo',
    creditScore: '750',
    timestamp: '2023-07-17T16:20:00',
    overrideStatus: 'Rejected'
  },
  { 
    id: 5, 
    name: 'Robert Chen', 
    email: 'rchen@example.com',
    aiDecision: 'Qualified', 
    qualificationScore: 72,
    income: '$78,000',
    debt: '$1,500/mo',
    creditScore: '700',
    timestamp: '2023-07-17T10:30:00',
    overrideStatus: null
  }
];

export const QualificationOverrides = () => {
  const [leads, setLeads] = useState(leadsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const handleOverride = (id: number, status: 'Approved' | 'Rejected' | null) => {
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, overrideStatus: status } : lead
    ));
    
    toast({
      title: `Lead ${status === 'Approved' ? 'approved' : 'rejected'}`,
      description: `You have ${status === 'Approved' ? 'approved' : 'rejected'} the qualification for this lead.`,
    });
  };

  const filteredLeads = leads.filter(lead => {
    if (!lead.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !lead.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    if (filter === 'approved' && lead.overrideStatus !== 'Approved') return false;
    if (filter === 'rejected' && lead.overrideStatus !== 'Rejected') return false;
    if (filter === 'pending' && lead.overrideStatus !== null) return false;
    
    return true;
  });

  const getStatusBadge = (decision: string) => {
    switch (decision) {
      case 'Qualified':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{decision}</Badge>;
      case 'Not Qualified':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{decision}</Badge>;
      case 'Needs Review':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{decision}</Badge>;
      default:
        return <Badge variant="outline">{decision}</Badge>;
    }
  };

  const getOverrideStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Manually Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Manually Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Qualification Decision Overrides</CardTitle>
          <CardDescription>
            Review and override AI qualification decisions for leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leads</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Manually Approved</SelectItem>
                <SelectItem value="rejected">Manually Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Lead</TableHead>
                  <TableHead>AI Decision</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Key Metrics</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Override Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No matching leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.aiDecision)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-10 h-2 rounded-full ${lead.qualificationScore >= 70 ? 'bg-green-500' : lead.qualificationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          />
                          <span>{lead.qualificationScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Income: {lead.income}</div>
                          <div>Debt: {lead.debt}</div>
                          <div>Credit: {lead.creditScore}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(lead.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getOverrideStatusBadge(lead.overrideStatus)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleOverride(lead.id, 'Approved')}
                              className="flex items-center"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              <span>Approve Qualification</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOverride(lead.id, 'Rejected')}
                              className="flex items-center"
                            >
                              <X className="mr-2 h-4 w-4 text-red-500" />
                              <span>Reject Qualification</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOverride(lead.id, null)}
                              className="flex items-center"
                            >
                              <ArrowUpDown className="mr-2 h-4 w-4" />
                              <span>Reset to AI Decision</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
