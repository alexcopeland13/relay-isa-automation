
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { Agent } from "@/types/agent";

interface AgentSpecializationsFormProps {
  agent?: Agent;
}

export function AgentSpecializationsForm({ agent }: AgentSpecializationsFormProps) {
  // Initialize with agent data if available, otherwise use empty arrays
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    agent?.specializations || []
  );
  const [areas, setAreas] = useState<string[]>(
    agent?.areas || []
  );
  const [clientTypes, setClientTypes] = useState<string[]>(
    agent?.clientTypes || []
  );
  const [languages, setLanguages] = useState<string[]>(
    agent?.languages || []
  );
  const [certifications, setCertifications] = useState<string[]>(
    agent?.certifications || []
  );

  const [newPropertyType, setNewPropertyType] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newClientType, setNewClientType] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const handleAddPropertyType = () => {
    if (newPropertyType.trim() && !propertyTypes.includes(newPropertyType)) {
      setPropertyTypes([...propertyTypes, newPropertyType]);
      setNewPropertyType("");
    }
  };

  const handleRemovePropertyType = (type: string) => {
    setPropertyTypes(propertyTypes.filter(t => t !== type));
  };

  const handleAddArea = () => {
    if (newArea.trim() && !areas.includes(newArea)) {
      setAreas([...areas, newArea]);
      setNewArea("");
    }
  };

  const handleRemoveArea = (area: string) => {
    setAreas(areas.filter(a => a !== area));
  };

  const handleAddClientType = () => {
    if (newClientType.trim() && !clientTypes.includes(newClientType)) {
      setClientTypes([...clientTypes, newClientType]);
      setNewClientType("");
    }
  };

  const handleRemoveClientType = (type: string) => {
    setClientTypes(clientTypes.filter(t => t !== type));
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage)) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification)) {
      setCertifications([...certifications, newCertification]);
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Specializations</CardTitle>
        <CardDescription>
          Define this agent's specializations and expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Property Types</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {propertyTypes.map((type, index) => (
                <Badge key={index} className="flex items-center gap-1">
                  {type}
                  <button 
                    type="button" 
                    onClick={() => handleRemovePropertyType(type)}
                    className="ml-1 text-muted rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {propertyTypes.length === 0 && (
                <span className="text-sm text-muted-foreground">No property types specified</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add property type..."
                value={newPropertyType}
                onChange={(e) => setNewPropertyType(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddPropertyType}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Geographic Areas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {areas.map((area, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {area}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveArea(area)}
                    className="ml-1 text-muted rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {areas.length === 0 && (
                <span className="text-sm text-muted-foreground">No areas specified</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add geographic area..."
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddArea}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Client Types</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {clientTypes.map((type, index) => (
                <Badge key={index} className="flex items-center gap-1">
                  {type}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveClientType(type)}
                    className="ml-1 text-muted rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {clientTypes.length === 0 && (
                <span className="text-sm text-muted-foreground">No client types specified</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add client type..."
                value={newClientType}
                onChange={(e) => setNewClientType(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddClientType}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {languages.map((lang, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {lang}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLanguage(lang)}
                    className="ml-1 text-muted rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {languages.length === 0 && (
                <span className="text-sm text-muted-foreground">No languages specified</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add language..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {certifications.map((cert, index) => (
                <Badge key={index} className="flex items-center gap-1">
                  {cert}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveCertification(cert)}
                    className="ml-1 text-muted rounded-full hover:bg-primary/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {certifications.length === 0 && (
                <span className="text-sm text-muted-foreground">No certifications specified</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add certification..."
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
              />
              <Button type="button" size="sm" onClick={handleAddCertification}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
