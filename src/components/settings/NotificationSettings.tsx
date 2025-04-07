
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  newLeadNotifications: z.boolean().default(true),
  leadStatusChangeNotifications: z.boolean().default(true),
  followUpReminders: z.boolean().default(true),
  systemAlerts: z.boolean().default(true),
  newMessageNotifications: z.boolean().default(true),
  taskAssignmentNotifications: z.boolean().default(true),
  errorAlerts: z.boolean().default(true),
  lowPerformanceAlerts: z.boolean().default(true),
  integrationFailureAlerts: z.boolean().default(true),
  maintenanceNotifications: z.boolean().default(true),
  notificationChannel: z.string({
    required_error: "Please select a notification channel.",
  }),
  emailFrequency: z.string({
    required_error: "Please select an email frequency.",
  }),
});

export const NotificationSettings = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newLeadNotifications: true,
      leadStatusChangeNotifications: true,
      followUpReminders: true,
      systemAlerts: true,
      newMessageNotifications: true,
      taskAssignmentNotifications: true,
      errorAlerts: true,
      lowPerformanceAlerts: true,
      integrationFailureAlerts: true,
      maintenanceNotifications: true,
      notificationChannel: "email",
      emailFrequency: "immediate",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
    console.log(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how you receive notifications and alerts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notificationChannel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Notification Channel</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="app">In-App Only</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="all">All Channels</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how you want to receive most notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emailFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Digest Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select email frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="hourly">Hourly Digest</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How often you want to receive email notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Lead Notifications</h3>
              <FormField
                control={form.control}
                name="newLeadNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">New Lead Alerts</FormLabel>
                      <FormDescription>
                        Receive notifications when new leads are created.
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
                control={form.control}
                name="leadStatusChangeNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Change Alerts</FormLabel>
                      <FormDescription>
                        Receive notifications when lead status changes.
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
              <h3 className="text-lg font-medium">Activity Notifications</h3>
              <FormField
                control={form.control}
                name="followUpReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Follow-up Reminders</FormLabel>
                      <FormDescription>
                        Receive reminders about scheduled follow-ups.
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
                control={form.control}
                name="newMessageNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">New Message Alerts</FormLabel>
                      <FormDescription>
                        Receive notifications about new messages and conversations.
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
                control={form.control}
                name="taskAssignmentNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Task Assignments</FormLabel>
                      <FormDescription>
                        Receive notifications when tasks are assigned to you.
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
              <h3 className="text-lg font-medium">System Notifications</h3>
              <FormField
                control={form.control}
                name="errorAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Error Alerts</FormLabel>
                      <FormDescription>
                        Receive notifications about system errors.
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
                control={form.control}
                name="lowPerformanceAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Performance Threshold Alerts</FormLabel>
                      <FormDescription>
                        Receive alerts when performance metrics fall below thresholds.
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
                control={form.control}
                name="integrationFailureAlerts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Integration Failure Alerts</FormLabel>
                      <FormDescription>
                        Receive alerts when integrations fail.
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
                control={form.control}
                name="maintenanceNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Maintenance Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications about scheduled maintenance.
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
            
            <Button type="submit">Save Notification Settings</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
