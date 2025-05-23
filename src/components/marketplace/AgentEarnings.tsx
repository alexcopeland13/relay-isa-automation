import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Payout, ShowingRequest } from './types';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

export const AgentEarnings = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [showings, setShowings] = useState<ShowingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchEarningsData();
    }
  }, [user]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const transformPayoutData = (rawPayout: any): Payout => ({
    ...rawPayout,
    amount: parseFloat(rawPayout.amount),
    status: rawPayout.status as 'pending' | 'processing' | 'completed' | 'failed'
  });

  const transformShowingData = (rawShowing: any): ShowingRequest => ({
    ...rawShowing,
    payout_amount: parseFloat(rawShowing.payout_amount),
    location_lat: rawShowing.location_lat ? parseFloat(rawShowing.location_lat) : undefined,
    location_lng: rawShowing.location_lng ? parseFloat(rawShowing.location_lng) : undefined,
    duration: parseInt(rawShowing.duration),
    client_type: rawShowing.client_type as 'individual' | 'couple' | 'family',
    status: rawShowing.status as 'available' | 'claimed' | 'completed' | 'cancelled',
    urgency_level: rawShowing.urgency_level as 'normal' | 'urgent' | 'emergency'
  });

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      
      // Fetch payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payouts')
        .select('*')
        .eq('agent_id', user.id);

      if (payoutsError) throw payoutsError;

      // Fetch completed showings
      const { data: showingsData, error: showingsError } = await supabase
        .from('showings')
        .select('*')
        .eq('showing_agent_id', user.id);

      if (showingsError) throw showingsError;

      const transformedPayouts = (payoutsData || []).map(transformPayoutData);
      const transformedShowings = (showingsData || []).map(transformShowingData);

      setPayouts(transformedPayouts);
      setShowings(transformedShowings);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = () => {
    const now = new Date();
    const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedShowings = showings.filter(s => s.status === 'completed');
    
    const thisWeekEarnings = completedShowings
      .filter(s => new Date(s.updated_at) >= thisWeekStart)
      .reduce((sum, s) => sum + s.payout_amount, 0);

    const thisMonthEarnings = completedShowings
      .filter(s => new Date(s.updated_at) >= thisMonthStart)
      .reduce((sum, s) => sum + s.payout_amount, 0);

    const totalEarnings = completedShowings
      .reduce((sum, s) => sum + s.payout_amount, 0);

    const averageEarning = completedShowings.length > 0 
      ? totalEarnings / completedShowings.length 
      : 0;

    return {
      thisWeek: thisWeekEarnings,
      thisMonth: thisMonthEarnings,
      total: totalEarnings,
      average: averageEarning,
      completedCount: completedShowings.length,
      claimedCount: showings.filter(s => s.status === 'claimed').length
    };
  };

  const earnings = calculateEarnings();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${earnings.thisWeek.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">${earnings.thisMonth.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">${earnings.average.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Avg per Showing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{earnings.completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Showings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Showings</CardTitle>
        </CardHeader>
        <CardContent>
          {showings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No showings yet</h3>
              <p className="text-gray-500">Claim your first showing to start earning!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {showings
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 10)
                .map((showing) => (
                  <div key={showing.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{showing.property_address}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(showing.showing_date).toLocaleDateString()} at{' '}
                        {new Date(`2000-01-01 ${showing.showing_time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                      <p className="text-sm text-gray-500">Client: {showing.client_name}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xl font-bold text-green-600">
                        ${showing.payout_amount}
                      </p>
                      <Badge 
                        variant={
                          showing.status === 'completed' ? 'default' : 
                          showing.status === 'claimed' ? 'secondary' : 'outline'
                        }
                      >
                        {showing.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts yet</h3>
              <p className="text-gray-500">Complete showings to receive payments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((payout) => (
                  <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Showing Payment</p>
                      <p className="text-sm text-gray-500">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xl font-bold">${payout.amount}</p>
                      <Badge 
                        variant={
                          payout.status === 'completed' ? 'default' : 
                          payout.status === 'processing' ? 'secondary' : 
                          payout.status === 'failed' ? 'destructive' : 'outline'
                        }
                      >
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
