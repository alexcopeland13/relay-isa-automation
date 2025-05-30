
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, Clock, Users, TrendingUp } from 'lucide-react';
import { useActiveCalls } from '@/hooks/use-active-calls';

export const ActiveCallsOverview = () => {
  const { activeCalls, isLoading } = useActiveCalls();

  if (isLoading) {
    return null;
  }

  const totalActiveCalls = activeCalls.length;
  const averageDuration = activeCalls.length > 0 ? 
    activeCalls.reduce((acc, call) => {
      const start = new Date(call.started_at);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
      return acc + diffMinutes;
    }, 0) / activeCalls.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {totalActiveCalls}
            {totalActiveCalls > 0 && (
              <Badge className="bg-green-500 text-white animate-pulse text-xs">
                LIVE
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalActiveCalls === 0 ? 'No active conversations' : 'conversations in progress'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(averageDuration)}m
          </div>
          <p className="text-xs text-muted-foreground">
            average call length
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalActiveCalls}</div>
          <p className="text-xs text-muted-foreground">
            leads currently engaged
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {totalActiveCalls > 0 ? 'Active' : 'Quiet'}
          </div>
          <p className="text-xs text-muted-foreground">
            current status
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
