
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ShowingRequest, FilterOptions, SortOption } from './types';
import { ShowingCard } from './ShowingCard';
import { ShowingFilters } from './ShowingFilters';
import { CreateShowingModal } from './CreateShowingModal';
import { AgentEarnings } from './AgentEarnings';
import { 
  MapPin, 
  Plus, 
  Search,
  Filter,
  Clock,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export const ShowingMarketplace = () => {
  const [showings, setShowings] = useState<ShowingRequest[]>([]);
  const [filteredShowings, setFilteredShowings] = useState<ShowingRequest[]>([]);
  const [view, setView] = useState<'available' | 'my-requests' | 'earnings'>('available');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'created_at', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getCurrentUser();
    fetchShowings();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('showings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'showings'
        },
        (payload) => {
          console.log('Showings updated:', payload);
          fetchShowings();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Showing Available!",
              description: `${payload.new.property_address} - $${payload.new.payout_amount}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [showings, filters, sortOption, searchTerm, view]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchShowings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('showings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShowings(data || []);
    } catch (error) {
      console.error('Error fetching showings:', error);
      toast({
        title: "Error",
        description: "Failed to load showings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...showings];

    // Apply view filter
    if (view === 'available') {
      filtered = filtered.filter(showing => showing.status === 'available');
    } else if (view === 'my-requests') {
      filtered = filtered.filter(showing => 
        showing.requesting_agent_id === user?.id || showing.showing_agent_id === user?.id
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(showing =>
        showing.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showing.mls_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showing.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.payoutRange) {
      filtered = filtered.filter(showing =>
        showing.payout_amount >= filters.payoutRange!.min &&
        showing.payout_amount <= filters.payoutRange!.max
      );
    }

    if (filters.urgencyLevel && filters.urgencyLevel.length > 0) {
      filtered = filtered.filter(showing =>
        filters.urgencyLevel!.includes(showing.urgency_level)
      );
    }

    if (filters.hideClaimed) {
      filtered = filtered.filter(showing => showing.status !== 'claimed');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortOption.field];
      let bValue: any = b[sortOption.field];

      if (sortOption.field === 'showing_date') {
        aValue = new Date(`${a.showing_date} ${a.showing_time}`);
        bValue = new Date(`${b.showing_date} ${b.showing_time}`);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOption.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredShowings(filtered);
  };

  const handleClaimShowing = async (showingId: string) => {
    try {
      const { error } = await supabase
        .from('showings')
        .update({
          showing_agent_id: user?.id,
          status: 'claimed',
          updated_at: new Date().toISOString()
        })
        .eq('id', showingId);

      if (error) throw error;

      toast({
        title: "Showing Claimed!",
        description: "You have successfully claimed this showing.",
      });

      fetchShowings();
    } catch (error) {
      console.error('Error claiming showing:', error);
      toast({
        title: "Error",
        description: "Failed to claim showing",
        variant: "destructive"
      });
    }
  };

  const getUrgencyColor = (urgencyLevel: string, createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const minutesAgo = (now.getTime() - created.getTime()) / (1000 * 60);

    if (minutesAgo < 5) return 'bg-blue-500'; // New
    if (urgencyLevel === 'emergency') return 'bg-red-500';
    if (urgencyLevel === 'urgent') return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (showing: ShowingRequest) => {
    const now = new Date();
    const created = new Date(showing.created_at);
    const showingDateTime = new Date(`${showing.showing_date} ${showing.showing_time}`);
    const minutesAgo = (now.getTime() - created.getTime()) / (1000 * 60);
    const hoursUntilShowing = (showingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (minutesAgo < 5) {
      return <Badge className="bg-blue-500 text-white">New</Badge>;
    }
    if (hoursUntilShowing < 2 && hoursUntilShowing > 0) {
      return <Badge className="bg-red-500 text-white">Urgent</Badge>;
    }
    return null;
  };

  const availableCount = showings.filter(s => s.status === 'available').length;
  const claimedCount = showings.filter(s => s.status === 'claimed' && s.showing_agent_id === user?.id).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Showing Marketplace</h1>
          <p className="text-muted-foreground">Connect with agents for on-demand property showings</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Post Showing Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{availableCount}</p>
                <p className="text-xs text-muted-foreground">Available Showings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{claimedCount}</p>
                <p className="text-xs text-muted-foreground">My Active Showings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  ${showings.filter(s => s.status === 'available').reduce((sum, s) => sum + s.payout_amount, 0).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Available Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b">
        <Button
          variant={view === 'available' ? 'default' : 'ghost'}
          onClick={() => setView('available')}
        >
          Available Showings ({availableCount})
        </Button>
        <Button
          variant={view === 'my-requests' ? 'default' : 'ghost'}
          onClick={() => setView('my-requests')}
        >
          My Requests
        </Button>
        <Button
          variant={view === 'earnings' ? 'default' : 'ghost'}
          onClick={() => setView('earnings')}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Earnings
        </Button>
      </div>

      {/* Search and Filters */}
      {view !== 'earnings' && (
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by address, MLS, or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && view !== 'earnings' && (
        <ShowingFilters
          filters={filters}
          onFiltersChange={setFilters}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      )}

      {/* Content */}
      {view === 'earnings' ? (
        <AgentEarnings />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredShowings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No showings found</h3>
              <p className="text-gray-500">
                {view === 'available' 
                  ? "No available showings match your criteria." 
                  : "You haven't posted or claimed any showings yet."
                }
              </p>
            </div>
          ) : (
            filteredShowings.map((showing) => (
              <ShowingCard
                key={showing.id}
                showing={showing}
                onClaim={handleClaimShowing}
                currentUserId={user?.id}
                statusBadge={getStatusBadge(showing)}
              />
            ))
          )}
        </div>
      )}

      {/* Create Showing Modal */}
      <CreateShowingModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchShowings();
        }}
      />
    </div>
  );
};
