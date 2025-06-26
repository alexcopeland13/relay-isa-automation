
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Database, Workflow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  feature: string;
  enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export const SystemConfigPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .order('feature');
      
      if (error) throw error;
      return data as SystemConfig[];
    }
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ feature, enabled }: { feature: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('system_config')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('feature', feature);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast({
        title: "Configuration Updated",
        description: "System configuration has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('v2')) return <Database className="h-4 w-4" />;
    if (feature.includes('makecom')) return <Workflow className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  const getFeatureCategory = (feature: string) => {
    if (feature.includes('v2')) return 'V2 System';
    if (feature.includes('makecom') || feature.includes('ingestion') || feature.includes('processing')) return 'Workflows';
    return 'General';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedConfigs = configs?.reduce((acc, config) => {
    const category = getFeatureCategory(config.feature);
    if (!acc[category]) acc[category] = [];
    acc[category].push(config);
    return acc;
  }, {} as Record<string, SystemConfig[]>) || {};

  return (
    <div className="space-y-6">
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Use these feature flags to control which systems are active. The V2 system runs in parallel with the existing system.
        </AlertDescription>
      </Alert>

      {Object.entries(groupedConfigs).map(([category, categoryConfigs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryConfigs.map((config) => (
                <div
                  key={config.feature}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getFeatureIcon(config.feature)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{config.feature.replace(/_/g, ' ').toUpperCase()}</h3>
                        <Badge variant={config.enabled ? "default" : "secondary"}>
                          {config.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => 
                      updateConfigMutation.mutate({ feature: config.feature, enabled })
                    }
                    disabled={updateConfigMutation.isPending}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
