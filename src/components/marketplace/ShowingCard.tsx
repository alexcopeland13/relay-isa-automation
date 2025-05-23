
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShowingRequest } from './types';
import {
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ShowingCardProps {
  showing: ShowingRequest;
  onClaim: (showingId: string) => void;
  currentUserId?: string;
  statusBadge?: React.ReactNode;
}

export const ShowingCard: React.FC<ShowingCardProps> = ({
  showing,
  onClaim,
  currentUserId,
  statusBadge
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeUntilShowing = () => {
    const now = new Date();
    const showingDateTime = new Date(`${showing.showing_date} ${showing.showing_time}`);
    const diffInHours = (showingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 0) return 'Past';
    if (diffInHours < 1) return `${Math.round(diffInHours * 60)}m`;
    if (diffInHours < 24) return `${Math.round(diffInHours)}h`;
    return `${Math.round(diffInHours / 24)}d`;
  };

  const getUrgencyColor = () => {
    const timeUntil = getTimeUntilShowing();
    if (timeUntil === 'Past') return 'text-gray-400';
    if (showing.urgency_level === 'emergency') return 'text-red-500';
    if (showing.urgency_level === 'urgent' || timeUntil.includes('h')) return 'text-orange-500';
    return 'text-green-500';
  };

  const canClaim = showing.status === 'available' && 
                  showing.requesting_agent_id !== currentUserId;
  
  const isMyRequest = showing.requesting_agent_id === currentUserId;
  const isMyClaim = showing.showing_agent_id === currentUserId;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with badges */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <h3 className="font-semibold text-lg leading-tight">
                  {showing.property_address}
                </h3>
              </div>
              {showing.mls_number && (
                <p className="text-sm text-gray-500">MLS: {showing.mls_number}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              {statusBadge}
              <Badge variant="outline" className={getUrgencyColor()}>
                {getTimeUntilShowing()}
              </Badge>
            </div>
          </div>

          {/* Payout */}
          <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                ${showing.payout_amount}
              </span>
            </div>
            <span className="text-sm text-gray-600">{showing.duration}min showing</span>
          </div>

          {/* Date and Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formatDate(showing.showing_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formatTime(showing.showing_time)}</span>
            </div>
          </div>

          {/* Client Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{showing.client_name}</span>
              <Badge variant="outline" className="text-xs">
                {showing.client_type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{showing.client_phone}</span>
            </div>
          </div>

          {/* Special Instructions */}
          {showing.special_instructions && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">{showing.special_instructions}</p>
              </div>
            </div>
          )}

          {/* Status and Actions */}
          <div className="pt-4 border-t">
            {showing.status === 'available' && canClaim && (
              <Button 
                onClick={() => onClaim(showing.id)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Claim Showing
              </Button>
            )}
            
            {showing.status === 'claimed' && isMyClaim && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">You claimed this showing</span>
              </div>
            )}
            
            {showing.status === 'claimed' && !isMyClaim && !isMyRequest && (
              <div className="text-center text-gray-500">
                <span>Claimed by another agent</span>
              </div>
            )}
            
            {isMyRequest && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <span className="font-medium">Your request</span>
                <Badge variant="outline">
                  {showing.status}
                </Badge>
              </div>
            )}
            
            {showing.status === 'completed' && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
