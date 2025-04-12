import { useState } from 'react';
import { 
  Home,
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Edit,
  Save,
  X,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ExtractedInfo } from '@/data/sampleConversation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyInterestsSection } from './PropertyInterestsSection';
import { LocationPreferencesSection } from './LocationPreferencesSection';
import { TransactionTypeSection } from './TransactionTypeSection';
import { MotivationFactorsSection } from './MotivationFactorsSection';
import { MatchingWeightsSection } from './MatchingWeightsSection';

interface InformationPanelProps {
  extractedInfo: ExtractedInfo;
}

export const InformationPanel = ({ extractedInfo }: InformationPanelProps) => {
  const [activeTab, setActiveTab] = useState<'raw' | 'categorized'>('raw');
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState(extractedInfo);
  const [editHistory, setEditHistory] = useState<Array<{timestamp: Date, field: string, value: any}>>([]);
  
  const handleSaveChanges = () => {
    // Here would be logic to save changes to the backend
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditedInfo(extractedInfo);
    setIsEditing(false);
  };
  
  const handleEdit = (section: string, key: string, value: any) => {
    setEditHistory([
      ...editHistory,
      {
        timestamp: new Date(),
        field: `${section}.${key}`,
        value: editedInfo[section as keyof typeof editedInfo][key as keyof typeof editedInfo[keyof typeof editedInfo]]
      }
    ]);
    
    setEditedInfo({
      ...editedInfo,
      [section]: {
        ...editedInfo[section as keyof typeof editedInfo],
        [key]: value
      }
    });
  };
  
  return (
    <div className="h-full border-l border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'raw' | 'categorized')} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="raw" className="flex-1">Raw Extracted Data</TabsTrigger>
            <TabsTrigger value="categorized" className="flex-1">Lead Categories</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">
          {activeTab === 'raw' ? 'Extracted Information' : 'Lead Categorization'}
        </h2>
        
        {activeTab === 'categorized' && (
          <>
            {isEditing ? (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveChanges}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-muted-foreground"
                  onClick={() => {
                    // Show revision history - this would be a modal in a real implementation
                    console.log('Edit history:', editHistory);
                  }}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      <ScrollArea className="h-[calc(600px-113px)]">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="raw" className="m-0">
            <div className="p-4">
              <Accordion type="multiple" defaultValue={["property", "refinance", "timeline", "financial", "qualification"]}>
                <AccordionItem value="property">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      <Home className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Property Information</span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5">
                        {Math.round(editedInfo.propertyInfo.confidence * 100)}%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Current Mortgage</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.propertyInfo.currentMortgage} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              propertyInfo: {
                                ...editedInfo.propertyInfo,
                                currentMortgage: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.propertyInfo.currentMortgage}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Current Term</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.propertyInfo.currentTerm} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              propertyInfo: {
                                ...editedInfo.propertyInfo,
                                currentTerm: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.propertyInfo.currentTerm}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Estimated Value</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.propertyInfo.estimatedValue} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              propertyInfo: {
                                ...editedInfo.propertyInfo,
                                estimatedValue: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.propertyInfo.estimatedValue}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Location</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.propertyInfo.location} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              propertyInfo: {
                                ...editedInfo.propertyInfo,
                                location: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.propertyInfo.location}</div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="refinance">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                      <span>Refinance Goals</span>
                      <span className="ml-2 text-xs bg-green-100 text-green-800 rounded px-1.5 py-0.5">
                        {Math.round(editedInfo.refinanceGoals.confidence * 100)}%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Lower Rate</label>
                        <Switch 
                          checked={editedInfo.refinanceGoals.lowerRate} 
                          onCheckedChange={isEditing ? (checked) => setEditedInfo({
                            ...editedInfo,
                            refinanceGoals: {
                              ...editedInfo.refinanceGoals,
                              lowerRate: checked
                            }
                          }) : undefined}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Cash Out</label>
                        <Switch 
                          checked={editedInfo.refinanceGoals.cashOut} 
                          onCheckedChange={isEditing ? (checked) => setEditedInfo({
                            ...editedInfo,
                            refinanceGoals: {
                              ...editedInfo.refinanceGoals,
                              cashOut: checked
                            }
                          }) : undefined}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Shorten Term</label>
                        <Switch 
                          checked={editedInfo.refinanceGoals.shortenTerm} 
                          onCheckedChange={isEditing ? (checked) => setEditedInfo({
                            ...editedInfo,
                            refinanceGoals: {
                              ...editedInfo.refinanceGoals,
                              shortenTerm: checked
                            }
                          }) : undefined}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="timeline">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                      <span>Timeline</span>
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 rounded px-1.5 py-0.5">
                        {Math.round(editedInfo.timeline.confidence * 100)}%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Urgency</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.timeline.urgency} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              timeline: {
                                ...editedInfo.timeline,
                                urgency: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.timeline.urgency}</div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Looking to Decide</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.timeline.lookingToDecide} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              timeline: {
                                ...editedInfo.timeline,
                                lookingToDecide: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.timeline.lookingToDecide}</div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="financial">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      <DollarSign className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Financial Information</span>
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5">
                        {Math.round(editedInfo.financialInfo.confidence * 100)}%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Estimated Credit</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.financialInfo.estimatedCredit} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              financialInfo: {
                                ...editedInfo.financialInfo,
                                estimatedCredit: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.financialInfo.estimatedCredit}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Has Other Debts</label>
                        <Switch 
                          checked={editedInfo.financialInfo.hasOtherDebts} 
                          onCheckedChange={isEditing ? (checked) => setEditedInfo({
                            ...editedInfo,
                            financialInfo: {
                              ...editedInfo.financialInfo,
                              hasOtherDebts: checked
                            }
                          }) : undefined}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="qualification">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center text-left">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span>Qualification</span>
                      <span className="ml-2 text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">
                        {Math.round(editedInfo.qualification.confidenceScore * 100)}%
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Status</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.qualification.status} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              qualification: {
                                ...editedInfo.qualification,
                                status: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm font-medium">
                            <span className={`inline-block px-2 py-1 rounded ${
                              editedInfo.qualification.status === 'Qualified' ? 'bg-blue-100 text-blue-800' :
                              editedInfo.qualification.status === 'Highly Qualified' ? 'bg-green-100 text-green-800' :
                              editedInfo.qualification.status === 'Not Qualified' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {editedInfo.qualification.status}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Reasoning</label>
                        {isEditing ? (
                          <Input 
                            value={editedInfo.qualification.reasoning} 
                            onChange={(e) => setEditedInfo({
                              ...editedInfo,
                              qualification: {
                                ...editedInfo.qualification,
                                reasoning: e.target.value
                              }
                            })}
                            className="h-8"
                          />
                        ) : (
                          <div className="text-sm">{editedInfo.qualification.reasoning}</div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {(editedInfo.propertyInfo.confidence < 0.85 || 
                editedInfo.refinanceGoals.confidence < 0.85 || 
                editedInfo.timeline.confidence < 0.85 || 
                editedInfo.financialInfo.confidence < 0.85) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Low confidence in some extracted information</p>
                    <p className="mt-1">Please review and verify the highlighted sections above.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="categorized" className="m-0">
            <div className="p-4 space-y-6">
              <PropertyInterestsSection 
                propertyInterests={editedInfo.propertyInterests} 
                isEditing={isEditing}
                onEdit={(key, value) => handleEdit('propertyInterests', key, value)} 
              />
              
              <div className="border-t border-border pt-4 mt-4">
                <LocationPreferencesSection 
                  locationPreferences={editedInfo.locationPreferences} 
                  isEditing={isEditing}
                  onEdit={(key, value) => handleEdit('locationPreferences', key, value)}
                />
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <TransactionTypeSection 
                  transactionType={editedInfo.transactionType} 
                  isEditing={isEditing}
                  onEdit={(key, value) => handleEdit('transactionType', key, value)}
                />
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <MotivationFactorsSection 
                  motivationFactors={editedInfo.motivationFactors} 
                  isEditing={isEditing}
                  onEdit={(key, value) => handleEdit('motivationFactors', key, value)}
                />
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <MatchingWeightsSection 
                  matchingWeights={editedInfo.matchingWeights}
                  isEditing={isEditing}
                  onEdit={(key, value) => handleEdit('matchingWeights', key, value)}
                />
              </div>
              
              {isEditing && (
                <div className="border-t border-border pt-4 mt-4">
                  <Button className="w-full" onClick={handleSaveChanges}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify All Categorizations
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
