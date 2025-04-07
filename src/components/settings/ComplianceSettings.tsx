
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const tcpaFormSchema = z.object({
  enforceDnc: z.boolean().default(true),
  enforceCallingHours: z.boolean().default(true),
  callingHoursStart: z.string(),
  callingHoursEnd: z.string(),
  maxContactsPerDay: z.string(),
  requireExplicitConsent: z.boolean().default(true),
  storeConsentRecords: z.boolean().default(true),
});

const dataProtectionFormSchema = z.object({
  dataSharingEnabled: z.boolean().default(false),
  dataRetentionPeriod: z.string(),
  automaticDeletion: z.boolean().default(true),
  logDataAccess: z.boolean().default(true),
  enableDataExport: z.boolean().default(true),
  maskSensitiveData: z.boolean().default(true),
  piiFields: z.string(),
});

export const ComplianceSettings = () => {
  const { toast } = useToast();
  
  const tcpaForm = useForm<z.infer<typeof tcpaFormSchema>>({
    resolver: zodResolver(tcpaFormSchema),
    defaultValues: {
      enforceDnc: true,
      enforceCallingHours: true,
      callingHoursStart: "09:00",
      callingHoursEnd: "20:00",
      maxContactsPerDay: "3",
      requireExplicitConsent: true,
      storeConsentRecords: true,
    },
  });

  const dataProtectionForm = useForm<z.infer<typeof dataProtectionFormSchema>>({
    resolver: zodResolver(dataProtectionFormSchema),
    defaultValues: {
      dataSharingEnabled: false,
      dataRetentionPeriod: "365",
      automaticDeletion: true,
      logDataAccess: true,
      enableDataExport: true,
      maskSensitiveData: true,
      piiFields: "ssn,credit_card,dob",
    },
  });

  function onTcpaSubmit(values: z.infer<typeof tcpaFormSchema>) {
    toast({
      title: "TCPA settings updated",
      description: "Your TCPA compliance settings have been saved.",
    });
    console.log(values);
  }

  function onDataProtectionSubmit(values: z.infer<typeof dataProtectionFormSchema>) {
    toast({
      title: "Data protection settings updated",
      description: "Your data protection settings have been saved.",
    });
    console.log(values);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tcpa" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="tcpa">TCPA Compliance</TabsTrigger>
          <TabsTrigger value="data-protection">Data Protection</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tcpa">
          <Card>
            <CardHeader>
              <CardTitle>TCPA Compliance Settings</CardTitle>
              <CardDescription>Configure Telephone Consumer Protection Act compliance settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...tcpaForm}>
                <form onSubmit={tcpaForm.handleSubmit(onTcpaSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <FormField
                      control={tcpaForm.control}
                      name="enforceDnc"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enforce Do-Not-Call</FormLabel>
                            <FormDescription>
                              Automatically prevent calling numbers on the DNC list.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={tcpaForm.control}
                      name="enforceCallingHours"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enforce Calling Hours</FormLabel>
                            <FormDescription>
                              Restrict outbound calls to permitted calling hours.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                      <FormField
                        control={tcpaForm.control}
                        name="callingHoursStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={tcpaForm.control}
                        name="callingHoursEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Contact Frequency</h3>
                    <FormField
                      control={tcpaForm.control}
                      name="maxContactsPerDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Contacts Per Day</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Maximum number of times a lead can be contacted in a single day.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Consent Management</h3>
                    <FormField
                      control={tcpaForm.control}
                      name="requireExplicitConsent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Explicit Consent</FormLabel>
                            <FormDescription>
                              Require explicit consent before contacting leads.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={tcpaForm.control}
                      name="storeConsentRecords"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Store Consent Records</FormLabel>
                            <FormDescription>
                              Maintain records of consent for compliance purposes.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save TCPA Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data-protection">
          <Card>
            <CardHeader>
              <CardTitle>Data Protection Settings</CardTitle>
              <CardDescription>Configure how personal data is handled and protected.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...dataProtectionForm}>
                <form onSubmit={dataProtectionForm.handleSubmit(onDataProtectionSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Sharing & Retention</h3>
                    <FormField
                      control={dataProtectionForm.control}
                      name="dataSharingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Data Sharing</FormLabel>
                            <FormDescription>
                              Allow data to be shared with integrated third-party services.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dataProtectionForm.control}
                      name="dataRetentionPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Retention Period (days)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>
                            Number of days to retain lead data after last activity.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dataProtectionForm.control}
                      name="automaticDeletion"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Automatic Data Deletion</FormLabel>
                            <FormDescription>
                              Automatically delete data after the retention period.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Privacy & Security</h3>
                    <FormField
                      control={dataProtectionForm.control}
                      name="logDataAccess"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Log Data Access</FormLabel>
                            <FormDescription>
                              Maintain logs of all data access for auditing purposes.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dataProtectionForm.control}
                      name="enableDataExport"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Data Export</FormLabel>
                            <FormDescription>
                              Allow export of lead data for portability requests.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dataProtectionForm.control}
                      name="maskSensitiveData"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Mask Sensitive Data</FormLabel>
                            <FormDescription>
                              Automatically mask PII in displays and exports.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={dataProtectionForm.control}
                      name="piiFields"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PII Fields to Mask</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ssn,credit_card,dob" {...field} />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of fields to be masked.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Data Protection Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>View and export compliance and data access logs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <p>Audit logs will be implemented in the next phase.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
