
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Search, CheckCircle, XCircle, MapPin, User } from 'lucide-react';

export const PhoneLookupTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPhoneLookup = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLookupResult(null);

      const { data, error: lookupError } = await supabase.functions.invoke('phone-lookup', {
        body: { phone_number: phoneNumber }
      });

      if (lookupError) {
        throw new Error(lookupError.message);
      }

      setLookupResult(data);
    } catch (err: any) {
      setError(err.message || 'Phone lookup failed');
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  };

  const testNumbers = [
    '+15551234567',
    '+15559876543',
    '+15555555555'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Lookup Test
        </CardTitle>
        <p className="text-sm text-gray-600">
          Test what context Retell would have when a specific phone number calls
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (E.164 format)</Label>
          <div className="flex gap-2">
            <Input
              id="phone"
              placeholder="+15551234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testPhoneLookup} disabled={loading}>
              {loading ? (
                <Search className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Test
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quick Test Numbers</Label>
          <div className="flex flex-wrap gap-2">
            {testNumbers.map((number) => (
              <Button
                key={number}
                variant="outline"
                size="sm"
                onClick={() => setPhoneNumber(number)}
              >
                {number}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {lookupResult && (
          <div className="space-y-4">
            {lookupResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">Lead context found!</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Lead Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Name:</span> {lookupResult.lead_context.lead_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {lookupResult.lead_context.email}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge variant="secondary">{lookupResult.lead_context.status}</Badge>
                      </div>
                      <div>
                        <span className="font-medium">Source:</span> {lookupResult.lead_context.source}
                      </div>
                      {lookupResult.lead_context.cinc_lead_id && (
                        <div>
                          <span className="font-medium">CINC ID:</span> {lookupResult.lead_context.cinc_lead_id}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Property Interests
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {lookupResult.lead_context.greeting_context.preferred_cities?.length > 0 ? (
                        <div>
                          <span className="font-medium">Preferred Cities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lookupResult.lead_context.greeting_context.preferred_cities.map((city: string, index: number) => (
                              <Badge key={index} variant="outline">{city}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No preferred cities specified</p>
                      )}
                      
                      {(lookupResult.lead_context.greeting_context.price_range.min || lookupResult.lead_context.greeting_context.price_range.max) && (
                        <div>
                          <span className="font-medium">Price Range:</span>
                          <p className="text-sm">
                            ${lookupResult.lead_context.greeting_context.price_range.min?.toLocaleString() || '0'} - 
                            ${lookupResult.lead_context.greeting_context.price_range.max?.toLocaleString() || 'No max'}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium">Timeline:</span> {lookupResult.lead_context.greeting_context.buyer_timeline}
                      </div>
                      
                      <div>
                        <span className="font-medium">Has Favorites:</span>{' '}
                        {lookupResult.lead_context.greeting_context.has_favorited_properties ? 'Yes' : 'No'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Suggested Greeting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        "Hi {lookupResult.lead_context.first_name}! I see you've been looking at homes
                        {lookupResult.lead_context.greeting_context.preferred_cities?.length > 0 && 
                          ` in ${lookupResult.lead_context.greeting_context.preferred_cities[0]}`
                        }. How can I help you today?"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <XCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-700">
                  No lead found for this phone number. Call would be treated as new lead.
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
