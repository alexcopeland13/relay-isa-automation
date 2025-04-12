
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AgentSpecializationsForm } from "@/components/agents/AgentSpecializationsForm";
import { AgentAvailabilityForm } from "@/components/agents/AgentAvailabilityForm";
import { ArrowLeft, Save, X, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sampleAgentsData } from "@/data/sampleAgentsData";

const AgentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const agent = sampleAgentsData.find((a) => a.id === id);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(agent?.name || "");
  const [email, setEmail] = useState(agent?.email || "");
  const [phone, setPhone] = useState(agent?.phone || "");
  const [agency, setAgency] = useState(agent?.agency || "");
  const [license, setLicense] = useState(agent?.licenseNumber || "");
  const [experience, setExperience] = useState(agent?.yearsOfExperience.toString() || "0");
  const [bio, setBio] = useState(agent?.bio || "");
  const [status, setStatus] = useState(agent?.status === "Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would update the agent in the database
    toast({
      title: "Agent updated",
      description: "The agent profile has been successfully updated.",
    });
    navigate(`/agents/${id}`);
  };

  const handleDelete = () => {
    // In a real app, we would delete the agent from the database
    toast({
      title: "Agent deleted",
      description: "The agent has been removed from the database.",
      variant: "destructive",
    });
    navigate("/agents");
  };

  if (!agent) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The agent you're trying to edit doesn't exist or has been removed.
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/agents/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit Agent Profile</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash className="mr-2 h-4 w-4" />
          Delete Agent
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="specializations">Specializations</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Profile</CardTitle>
                  <CardDescription>
                    Update basic information for {agent.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch id="status" checked={status} onCheckedChange={setStatus} />
                      <Label htmlFor="status">Active Status</Label>
                    </div>
                    <Badge 
                      variant={status ? "default" : "secondary"}
                      className={`${status ? "bg-green-500 hover:bg-green-600" : ""}`}
                    >
                      {status ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agency">Agency/Brokerage</Label>
                        <Input 
                          id="agency" 
                          value={agency} 
                          onChange={(e) => setAgency(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="license">License Number</Label>
                        <Input 
                          id="license" 
                          value={license} 
                          onChange={(e) => setLicense(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input 
                          id="experience" 
                          type="number" 
                          min="0" 
                          value={experience} 
                          onChange={(e) => setExperience(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio/Description</Label>
                      <Textarea 
                        id="bio" 
                        rows={5}
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photo">Profile Photo</Label>
                      <div className="flex items-center gap-4">
                        {agent.photoUrl ? (
                          <div className="w-16 h-16 rounded-full overflow-hidden">
                            <img 
                              src={agent.photoUrl} 
                              alt={agent.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-lg">
                            {agent.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <Input id="photo" type="file" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specializations">
              <AgentSpecializationsForm agent={agent} />
            </TabsContent>

            <TabsContent value="availability">
              <AgentAvailabilityForm agent={agent} />
            </TabsContent>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link to={`/agents/${id}`}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Tabs>
      </form>
    </PageLayout>
  );
};

export default AgentEdit;
