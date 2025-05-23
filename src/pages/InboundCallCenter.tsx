
import React, { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  Phone,
  PhoneCall,
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface PhoneMapping {
  phone_e164: string;
  phone_raw: string;
  lead_name: string;
  property_interests: any;
  cinc_data: any;
  last_updated: string;
  leads: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    source: string;
    cinc_lead_id: string;
  };
}

interface ScheduledCallback {
  id: string;
  phone_number: string;
  callback_datetime: string;
  callback_reason: string;
  callback_type: string;
  callback_notes: string;
  status: string;
  attempt_count: number;
  last_attempt_at: string;
  leads: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const InboundCallCenter = () => {
  const [phoneMappings, setPhoneMappings] = useState<PhoneMapping[]>([]);
  const [scheduledCallbacks, setScheduledCallbacks] = useState<ScheduledCallback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch phone mappings (CINC leads ready for calls)
      const { data: mappings, error: mappingsError } = await supabase
        .from('phone_lead_mapping')
        .select(`
          *,
          leads:lead_id (
            id,
            first_name,
            last_name,
            email,
            status,
            source,
            cinc_lead_id
          )
        `)
        .order('last_updated', { ascending: false });

      if (mappingsError) throw mappingsError;

      // Fetch scheduled callbacks
      const { data: callbacks, error: callbacksError } = await supabase
        .from('scheduled_callbacks')
        .select(`
          *,
          leads:lead_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('callback_datetime', { ascending: true });

      if (callbacksError) throw callbacksError;

      setPhoneMappings(mappings || []);
      setScheduledCallbacks(callbacks || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-purple-100 text-purple-800';
      case 'nurturing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCallbackTypeColor = (type: string) => {
    switch (type) {
      case 'property_info': return 'bg-blue-100 text-blue-800';
      case 'financing': return 'bg-green-100 text-green-800';
      case 'showing_request': return 'bg-purple-100 text-purple-800';
      case 'offer_discussion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const testPhoneLookup = async (phoneNumber: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('phone-lookup', {
        body: { phone_number: phoneNumber }
      });

      if (error) throw error;

      alert(`Phone lookup test:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Phone lookup test failed:', error);
      alert(`Phone lookup failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inbound Call Center</h1>
            <p className="text-gray-600">Manage CINC leads and inbound call context</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="ready-leads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ready-leads">Ready Leads ({phoneMappings.length})</TabsTrigger>
            <TabsTrigger value="scheduled-callbacks">Scheduled Callbacks ({scheduledCallbacks.length})</TabsTrigger>
            <TabsTrigger value="call-history">Call History</TabsTrigger>
          </TabsList>

          <TabsContent value="ready-leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  CINC Leads Ready for Inbound Calls
                </CardTitle>
                <p className="text-sm text-gray-600">
                  These leads are synced and will have personalized context when they call
                </p>
              </CardHeader>
              <CardContent>
                {phoneMappings.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No leads synced yet</h3>
                    <p className="text-gray-500">CINC leads will appear here once webhook receives them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {phoneMappings.map((mapping) => (
                      <div key={mapping.phone_e164} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="font-mono text-sm">{mapping.phone_e164}</span>
                            </div>
                            <Badge className={getStatusColor(mapping.leads?.status || 'unknown')}>
                              {mapping.leads?.status || 'unknown'}
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => testPhoneLookup(mapping.phone_e164)}
                          >
                            Test Lookup
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{mapping.lead_name}</h4>
                            <p className="text-sm text-gray-600">{mapping.leads?.email}</p>
                            <p className="text-sm text-gray-500">Source: {mapping.leads?.source}</p>
                            {mapping.leads?.cinc_lead_id && (
                              <p className="text-sm text-gray-500">CINC ID: {mapping.leads.cinc_lead_id}</p>
                            )}
                          </div>
                          
                          <div>
                            {mapping.property_interests?.search_criteria && (
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-700">Property Interests:</p>
                                {mapping.property_interests.search_criteria.preferred_cities?.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {mapping.property_interests.search_criteria.preferred_cities.join(', ')}
                                    </span>
                                  </div>
                                )}
                                {(mapping.property_interests.search_criteria.min_price || mapping.property_interests.search_criteria.max_price) && (
                                  <p className="text-sm text-gray-600">
                                    Price: ${mapping.property_interests.search_criteria.min_price?.toLocaleString() || '0'} - ${mapping.property_interests.search_criteria.max_price?.toLocaleString() || 'No max'}
                                  </p>
                                )}
                              </div>
                            )}
                            {mapping.cinc_data?.buyer_timeline && (
                              <p className="text-sm text-gray-600">Timeline: {mapping.cinc_data.buyer_timeline}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-500">
                          Last updated: {formatDate(mapping.last_updated)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled-callbacks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Callbacks
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Callback requests captured from inbound conversations
                </p>
              </CardHeader>
              <CardContent>
                {scheduledCallbacks.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No callbacks scheduled</h3>
                    <p className="text-gray-500">Callback requests will appear here from inbound calls</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scheduledCallbacks.map((callback) => (
                      <div key={callback.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <PhoneCall className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {callback.leads?.first_name} {callback.leads?.last_name}
                              </span>
                            </div>
                            <Badge className={getCallbackTypeColor(callback.callback_type)}>
                              {callback.callback_type.replace('_', ' ')}
                            </Badge>
                            <Badge variant={callback.status === 'scheduled' ? 'secondary' : 'outline'}>
                              {callback.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {callback.attempt_count > 0 && (
                              <span className="text-sm text-gray-500">
                                {callback.attempt_count} attempts
                              </span>
                            )}
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(callback.callback_datetime)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            <strong>Phone:</strong> {callback.phone_number}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Reason:</strong> {callback.callback_reason}
                          </p>
                          {callback.callback_notes && (
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {callback.callback_notes}
                            </p>
                          )}
                          {callback.last_attempt_at && (
                            <p className="text-xs text-gray-500">
                              Last attempt: {formatDate(callback.last_attempt_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="call-history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Call History
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Recent inbound and outbound call activity
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Call history coming soon</h3>
                  <p className="text-gray-500">Integration with conversation tracking in progress</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default InboundCallCenter;
