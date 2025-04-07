
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const emailFormSchema = z.object({
  smtpServer: z.string().min(1, { message: "SMTP server is required" }),
  smtpPort: z.string().min(1, { message: "SMTP port is required" }),
  smtpUsername: z.string().min(1, { message: "SMTP username is required" }),
  smtpPassword: z.string().min(1, { message: "SMTP password is required" }),
  fromName: z.string().min(1, { message: "From name is required" }),
  fromEmail: z.string().email({ message: "Please enter a valid email address" }),
  emailSignature: z.string(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
  handleBounces: z.boolean().default(true),
});

const smsFormSchema = z.object({
  smsProvider: z.string().min(1, { message: "SMS provider is required" }),
  apiKey: z.string().min(1, { message: "API key is required" }),
  phoneNumber: z.string().min(1, { message: "Phone number is required" }),
  optInMessage: z.string(),
  optOutMessage: z.string(),
  maxSmsLength: z.string(),
  enableAutoSplit: z.boolean().default(true),
  includeCompanyName: z.boolean().default(true),
});

export const CommunicationSettings = () => {
  const { toast } = useToast();
  
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      smtpServer: "smtp.example.com",
      smtpPort: "587",
      smtpUsername: "no-reply@emmloans.com",
      smtpPassword: "••••••••••••",
      fromName: "EMM Loans",
      fromEmail: "no-reply@emmloans.com",
      emailSignature: "EMM Loans Team\nPhone: (555) 123-4567\nwww.emmloans.com",
      trackOpens: true,
      trackClicks: true,
      handleBounces: true,
    },
  });

  const smsForm = useForm<z.infer<typeof smsFormSchema>>({
    resolver: zodResolver(smsFormSchema),
    defaultValues: {
      smsProvider: "Twilio",
      apiKey: "••••••••••••••••••••••••••••••",
      phoneNumber: "+15551234567",
      optInMessage: "Reply YES to receive messages from EMM Loans. Msg & data rates may apply.",
      optOutMessage: "Reply STOP to unsubscribe from EMM Loans messages.",
      maxSmsLength: "160",
      enableAutoSplit: true,
      includeCompanyName: true,
    },
  });

  function onEmailSubmit(values: z.infer<typeof emailFormSchema>) {
    toast({
      title: "Email settings updated",
      description: "Your email communication settings have been saved.",
    });
    console.log(values);
  }

  function onSmsSubmit(values: z.infer<typeof smsFormSchema>) {
    toast({
      title: "SMS settings updated",
      description: "Your SMS communication settings have been saved.",
    });
    console.log(values);
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="voice">Voice Call</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure SMTP settings for sending emails.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SMTP Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="smtpServer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Server</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input placeholder="587" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="smtpUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="smtpPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="fromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name that will appear in the "From" field of emails.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="noreply@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address that will appear in the "From" field.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={emailForm.control}
                      name="emailSignature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Signature</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Your signature here..."
                              className="h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This signature will be appended to all outgoing emails.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tracking & Management</h3>
                    <FormField
                      control={emailForm.control}
                      name="trackOpens"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Track Opens</FormLabel>
                            <FormDescription>
                              Track when recipients open your emails.
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
                      control={emailForm.control}
                      name="trackClicks"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Track Clicks</FormLabel>
                            <FormDescription>
                              Track when recipients click links in your emails.
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
                      control={emailForm.control}
                      name="handleBounces"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Handle Bounces</FormLabel>
                            <FormDescription>
                              Automatically process bounced emails and update contact records.
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
                  
                  <Button type="submit">Save Email Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>Configure SMS provider settings for text messaging.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...smsForm}>
                <form onSubmit={smsForm.handleSubmit(onSmsSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SMS Provider Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={smsForm.control}
                        name="smsProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMS Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Twilio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={smsForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={smsForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+15551234567" {...field} />
                            </FormControl>
                            <FormDescription>
                              Phone number that will appear as the sender.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={smsForm.control}
                        name="maxSmsLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max SMS Length</FormLabel>
                            <FormControl>
                              <Input placeholder="160" {...field} />
                            </FormControl>
                            <FormDescription>
                              Maximum characters per SMS message.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Opt-in/Opt-out Management</h3>
                    <FormField
                      control={smsForm.control}
                      name="optInMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opt-in Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Reply YES to receive messages..."
                              className="h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Message sent when a user is subscribed to SMS notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={smsForm.control}
                      name="optOutMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opt-out Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Reply STOP to unsubscribe..."
                              className="h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Message sent when a user unsubscribes from SMS notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SMS Options</h3>
                    <FormField
                      control={smsForm.control}
                      name="enableAutoSplit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-split Long Messages</FormLabel>
                            <FormDescription>
                              Automatically split long messages into multiple SMS messages.
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
                      control={smsForm.control}
                      name="includeCompanyName"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Include Company Name</FormLabel>
                            <FormDescription>
                              Automatically include company name at the beginning of each message.
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
                  
                  <Button type="submit">Save SMS Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Call Configuration</CardTitle>
              <CardDescription>Configure settings for voice communications.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                <p>Voice call configuration will be implemented in the next phase.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
