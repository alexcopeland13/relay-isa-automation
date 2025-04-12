
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentMetrics } from "@/components/agents/AgentMetrics";
import { AgentAvailability } from "@/components/agents/AgentAvailability";
import { AgentLeadsList } from "@/components/agents/AgentLeadsList";
import { AgentActivityHistory } from "@/components/agents/AgentActivityHistory";
import {
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Edit,
  Calendar,
  MapPin,
  Star,
  Clock,
  ArrowLeft,
  Medal,
  Languages,
  Briefcase,
  HomeIcon,
} from "lucide-react";
import { sampleAgentsData } from "@/data/sampleAgentsData";

const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const agent = sampleAgentsData.find((a) => a.id === id);

  if (!agent) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/agents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/agents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Agent Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <div className="h-36 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-card bg-background overflow-hidden">
                  {agent.photoUrl ? (
                    <img
                      src={agent.photoUrl}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium text-2xl">
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <Badge
                  variant={agent.status === "Active" ? "default" : "secondary"}
                  className={`absolute top-3 right-3 ${agent.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}`}
                >
                  {agent.status}
                </Badge>
              </div>

              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold">{agent.name}</h2>
                <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Building className="h-4 w-4" />
                  {agent.agency}
                </p>

                <div className="flex justify-center mt-4 gap-3">
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border-t mt-6 pt-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">Success Rate</p>
                      <p className="font-medium flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {agent.successRate}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">Experience</p>
                      <p className="font-medium flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {agent.yearsOfExperience} years
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">Response Time</p>
                      <p className="font-medium">{agent.avgResponseTime} hrs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">Listings</p>
                      <p className="font-medium">{agent.activeListings}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-6">
              <Button asChild>
                <Link to={`/agents/edit/${agent.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{agent.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{agent.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{agent.agency}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>License #{agent.licenseNumber}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <HomeIcon className="h-4 w-4 text-muted-foreground" />
                    Property Types
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.specializations.map((spec, i) => (
                      <Badge key={i} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Geographic Areas
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.areas.map((area, i) => (
                      <Badge key={i} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Client Types
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.clientTypes.map((type, i) => (
                      <Badge key={i} variant="secondary">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.languages.map((lang, i) => (
                      <Badge key={i} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Medal className="h-4 w-4 text-muted-foreground" />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {agent.certifications.map((cert, i) => (
                      <Badge key={i} variant="secondary">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {agent.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {agent.bio}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="metrics">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="metrics">Performance</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="leads">Assigned Leads</TabsTrigger>
              <TabsTrigger value="activity">Activity History</TabsTrigger>
            </TabsList>
            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Track this agent's performance and success metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentMetrics agent={agent} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Schedule</CardTitle>
                  <CardDescription>
                    Manage when this agent is available for appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentAvailability agent={agent} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="leads">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Leads</CardTitle>
                  <CardDescription>
                    View and manage leads currently assigned to this agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentLeadsList agent={agent} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                  <CardDescription>
                    Recent activity and interactions with leads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AgentActivityHistory agent={agent} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentDetail;
