
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Users, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

type QueuedLead = {
  id: string;
  name: string;
  submittedAt: string;
  mortgageAmount: string;
  qualificationStatus: 'pending' | 'in_review';
  propertyType: string;
};

const sampleQueuedLeads: QueuedLead[] = [
  {
    id: "ql-001",
    name: "Alice Johnson",
    submittedAt: "2024-04-26T10:30:00Z",
    mortgageAmount: "$450,000",
    qualificationStatus: "pending",
    propertyType: "Single Family Home"
  },
  {
    id: "ql-002",
    name: "Mark Wilson",
    submittedAt: "2024-04-26T09:15:00Z",
    mortgageAmount: "$380,000",
    qualificationStatus: "in_review",
    propertyType: "Townhouse"
  },
  {
    id: "ql-003",
    name: "Sarah Davis",
    submittedAt: "2024-04-26T08:45:00Z",
    mortgageAmount: "$525,000",
    qualificationStatus: "pending",
    propertyType: "Condominium"
  }
];

export const QualificationQueue = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Qualification Queue</CardTitle>
        <Link to="/leads?status=pending_review" className="text-sm text-emmblue hover:underline flex items-center">
          View all <ArrowUpRight className="ml-1" size={14} />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sampleQueuedLeads.map((lead) => (
            <div key={lead.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <Link 
                    to={`/leads/${lead.id}`}
                    className="font-medium hover:text-emmblue hover:underline"
                  >
                    {lead.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={
                      lead.qualificationStatus === 'in_review' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {lead.qualificationStatus === 'in_review' ? 'In Review' : 'Pending Review'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{lead.mortgageAmount}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/leads/${lead.id}`}>Review</Link>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileCheck className="h-4 w-4" />
                  <span>{lead.propertyType}</span>
                </div>
                <span>Submitted {new Date(lead.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
