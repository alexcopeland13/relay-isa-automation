
import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

export function AgentFilter() {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  
  const areas = [
    "Downtown", "Westside", "Eastside", "Northern Suburbs", 
    "Southern District", "Riverside", "Lakefront", "Midtown"
  ];
  
  const specializations = [
    "Luxury Homes", "First-Time Buyers", "Investment Properties", 
    "Commercial", "Multi-Family", "Condos", "New Construction", 
    "Foreclosures", "Vacation Homes"
  ];

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
    } else {
      setSelectedAreas([...selectedAreas, area]);
    }
  };

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setSelectedSpecializations([]);
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Geographic Areas</h3>
              {selectedAreas.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedAreas([])}
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <Badge 
                  key={area}
                  variant={selectedAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArea(area)}
                >
                  {area}
                  {selectedAreas.includes(area) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Specializations</h3>
              {selectedSpecializations.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedSpecializations([])}
                  className="h-7 px-2 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <Badge 
                  key={spec}
                  variant={selectedSpecializations.includes(spec) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSpecialization(spec)}
                >
                  {spec}
                  {selectedSpecializations.includes(spec) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Additional Filters</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="active" />
                <Label htmlFor="active">Active agents only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="availability" />
                <Label htmlFor="availability">Available this week</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="languages" />
                <Label htmlFor="languages">Speaks multiple languages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="experience" />
                <Label htmlFor="experience">5+ years experience</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={clearFilters}>Clear All</Button>
          <Button>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
