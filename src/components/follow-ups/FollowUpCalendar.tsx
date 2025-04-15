import { useState } from 'react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { FollowUp } from '@/data/sampleFollowUpData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  MessageSquare, 
  User,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';

interface FollowUpCalendarProps {
  followUps: FollowUp[];
}

export const FollowUpCalendar = ({ followUps }: FollowUpCalendarProps) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'phone':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-amber-500 bg-amber-50';
      case 'approved':
        return 'border-green-500 bg-green-50';
      case 'completed':
        return 'border-blue-500 bg-blue-50';
      case 'declined':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300';
    }
  };

  const filteredFollowUps = followUps.filter(followUp => {
    if (assigneeFilter === 'all') return true;
    if (assigneeFilter === 'unassigned') return followUp.assignedTo === 'unassigned';
    return followUp.assignedTo === assigneeFilter;
  });

  const goToPrevious = () => {
    if (viewMode === 'day') {
      setCurrentDate(prevDate => addDays(prevDate, -1));
    } else if (viewMode === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, -7));
    } else {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      });
    }
  };

  const goToNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(prevDate => addDays(prevDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, 7));
    } else {
      setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      });
    }
  };

  const goToToday = () => {
    setCurrentDate(today);
  };

  const renderDayView = () => {
    const dayFollowUps = filteredFollowUps.filter(followUp => {
      const followUpDate = parseISO(followUp.scheduledFor);
      return isSameDay(followUpDate, currentDate);
    }).sort((a, b) => {
      return parseISO(a.scheduledFor).getTime() - parseISO(b.scheduledFor).getTime();
    });

    return (
      <div className="space-y-3">
        <div className="text-lg font-medium">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
        
        {dayFollowUps.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-10 border rounded-md bg-muted/30">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="font-medium">No follow-ups scheduled</h3>
            <p className="text-sm text-muted-foreground">
              There are no follow-ups scheduled for this day
            </p>
          </div>
        ) : (
          <div className="border rounded-md divide-y">
            {dayFollowUps.map((followUp) => (
              <div 
                key={followUp.id}
                className={`p-3 flex items-start ${getStatusColor(followUp.status)}`}
              >
                <div className="text-center mr-4 w-16">
                  <div className="text-sm font-medium">
                    {format(parseISO(followUp.scheduledFor), 'h:mm')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(followUp.scheduledFor), 'a')}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getChannelIcon(followUp.channel)}
                    <span className="font-medium">
                      {followUp.leadInfo.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {followUp.leadInfo.interestType}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {followUp.suggestedContent.substring(0, 100)}
                    {followUp.suggestedContent.length > 100 && '...'}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{followUp.assignedTo === 'unassigned' ? 'Unassigned' : followUp.assignedTo.split('@')[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-3">
        <div className="text-lg font-medium mb-4">
          {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day.toString()} className="text-center mb-2">
              <div className="text-sm font-medium">{format(day, 'EEE')}</div>
              <div 
                className={`text-sm rounded-full h-6 w-6 mx-auto flex items-center justify-center
                  ${isSameDay(day, today) ? 'bg-primary text-primary-foreground' : ''}
                `}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
          
          {weekDays.map((day) => {
            const dayFollowUps = filteredFollowUps.filter(followUp => {
              const followUpDate = parseISO(followUp.scheduledFor);
              return isSameDay(followUpDate, day);
            }).sort((a, b) => {
              return parseISO(a.scheduledFor).getTime() - parseISO(b.scheduledFor).getTime();
            });
            
            return (
              <div 
                key={`events-${day.toString()}`} 
                className="min-h-[120px] border rounded-md p-1 overflow-y-auto text-xs"
              >
                {dayFollowUps.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">No events</div>
                  </div>
                ) : (
                  dayFollowUps.map((followUp) => (
                    <HoverCard key={followUp.id}>
                      <HoverCardTrigger asChild>
                        <div 
                          className={`
                            mb-1 p-1 rounded border-l-4 cursor-pointer
                            ${getStatusColor(followUp.status)}
                          `}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            {getChannelIcon(followUp.channel)}
                            <span className="font-medium truncate">
                              {format(parseISO(followUp.scheduledFor), 'h:mm a')}
                            </span>
                          </div>
                          <div className="truncate">{followUp.leadInfo.name}</div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 p-0">
                        <div className={`p-3 ${getStatusColor(followUp.status)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{followUp.leadInfo.name}</div>
                            <Badge variant="outline" className="text-xs">
                              {followUp.leadInfo.interestType}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            {getChannelIcon(followUp.channel)}
                            <span>{followUp.channel}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{format(parseISO(followUp.scheduledFor), 'h:mm a')}</span>
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <div className="text-sm mb-2 line-clamp-3">
                            {followUp.suggestedContent}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>
                                {followUp.assignedTo === 'unassigned' ? 'Unassigned' : followUp.assignedTo.split('@')[0]}
                              </span>
                            </div>
                            <div>
                              {followUp.status === 'pending' ? 'Pending' : 
                               followUp.status === 'approved' ? 'Approved' :
                               followUp.status === 'completed' ? 'Completed' : 'Declined'}
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div>
        <div className="text-lg font-medium mb-4">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        
        <div className="mt-2">
          <CalendarPicker
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && setCurrentDate(date)}
            className="rounded-md border"
            components={{
              DayContent: ({ date }) => {
                const dayFollowUps = filteredFollowUps.filter(followUp => {
                  const followUpDate = parseISO(followUp.scheduledFor);
                  return isSameDay(followUpDate, date);
                });
                
                return (
                  <div className="w-full h-full flex flex-col">
                    <div>{format(date, 'd')}</div>
                    {dayFollowUps.length > 0 && (
                      <div className="mt-auto">
                        <div className="flex flex-wrap gap-1 mt-1 justify-center">
                          {dayFollowUps.length <= 3 ? (
                            dayFollowUps.map((followUp, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: 
                                    followUp.channel === 'email' ? 'rgb(59, 130, 246)' : 
                                    followUp.channel === 'phone' ? 'rgb(34, 197, 94)' : 
                                    'rgb(168, 85, 247)'
                                }}
                              />
                            ))
                          ) : (
                            <div className="text-xs font-medium text-primary">
                              {dayFollowUps.length}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
          <CardTitle className="text-xl">Follow-up Calendar</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'week' | 'month')}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <User className="h-4 w-4" />
                    {assigneeFilter === 'all' ? 'All Users' : 
                     assigneeFilter === 'unassigned' ? 'Unassigned' : 
                     assigneeFilter.split('@')[0]}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0">
                  <div className="p-2">
                    <div 
                      className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted"
                      onClick={() => setAssigneeFilter('all')}
                    >
                      All Users
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted"
                      onClick={() => setAssigneeFilter('unassigned')}
                    >
                      Unassigned
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted"
                      onClick={() => setAssigneeFilter('john.smith@nexusisa.com')}
                    >
                      John Smith
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted"
                      onClick={() => setAssigneeFilter('jane.doe@nexusisa.com')}
                    >
                      Jane Doe
                    </div>
                    <div 
                      className="px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-muted"
                      onClick={() => setAssigneeFilter('commercial.team@nexusisa.com')}
                    >
                      Commercial Team
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
};
