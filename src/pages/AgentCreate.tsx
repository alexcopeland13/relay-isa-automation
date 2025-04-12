
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { AgentSpecializationsForm } from "@/components/agents/AgentSpecializationsForm";
import { AgentAvailabilityForm } from "@/components/agents/AgentAvailabilityForm";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AgentCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save the agent to the database here
    toast({
      title: "Agent created",
      description: "The agent profile has been successfully created.",
    });
    navigate("/agents");
  };

  return (
    <PageLayout>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/agents">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add New Agent</h1>
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
                    Enter the basic information for this agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Enter agent's full name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="agent@example.com" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" placeholder="(555) 123-4567" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agency">Agency/Brokerage</Label>
                        <Input id="agency" placeholder="Enter agency name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="license">License Number</Label>
                        <Input id="license" placeholder="Enter license number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input id="experience" type="number" min="0" placeholder="5" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio/Description</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Enter a brief description about the agent..."
                        rows={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photo">Profile Photo</Label>
                      <Input id="photo" type="file" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specializations">
              <AgentSpecializationsForm />
            </TabsContent>

            <TabsContent value="availability">
              <AgentAvailabilityForm />
            </TabsContent>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link to="/agents">
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Agent
            </Button>
          </div>
        </Tabs>
      </form>
    </PageLayout>
  );
};

export default AgentCreate;
