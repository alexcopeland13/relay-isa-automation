
import { useState } from 'react';
import { Message } from '@/types/conversation';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle,
  Flame,
  Clock
} from 'lucide-react';

interface SentimentGraphProps {
  messages: Message[];
}

// Updated to include both sentiment and interest properties
interface SentimentPoint {
  timestamp: string;
  index: number;
  sentiment: number;
  interest?: number; // Added optional interest property
  message: Message;
}

export const SentimentGraph = ({ messages }: SentimentGraphProps) => {
  const [view, setView] = useState<'sentiment' | 'interest'>('sentiment');
  const [selectedPoint, setSelectedPoint] = useState<SentimentPoint | null>(null);
  
  // Convert sentiment strings to numerical values
  const sentimentToNumber = (sentiment?: number): number => {
    if (typeof sentiment === 'number') return sentiment;
    return 0; // Default to neutral if no sentiment provided
  };
  
  // Create data points for the chart
  const sentimentData: SentimentPoint[] = messages.map((message, index) => ({
    timestamp: message.timestamp,
    index,
    sentiment: sentimentToNumber(message.sentiment),
    message
  }));
  
  // Create interest level data (simulated progression based on sentiment and conversation flow)
  const calculateInterestLevel = (messages: Message[], index: number): number => {
    // Start with a baseline interest of 0.5 (neutral)
    let interest = 0.5;
    
    // Look at all messages up to this point
    for (let i = 0; i <= index; i++) {
      const message = messages[i];
      
      // Only customer messages affect interest level
      if (message.role === 'user') {
        // Positive sentiment increases interest
        if (message.sentiment && message.sentiment > 0) interest += 0.05;
        // Negative sentiment decreases interest
        else if (message.sentiment && message.sentiment < 0) interest -= 0.08;
        
        // If message has highlights, it often indicates engagement
        if (message.highlights && message.highlights.length > 0) {
          interest += 0.03 * message.highlights.length;
        }
        
        // Look for specific keywords that might indicate interest
        const text = message.content.toLowerCase();
        if (text.includes('interested') || text.includes('sounds good') || text.includes('thank you')) {
          interest += 0.07;
        }
      }
    }
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, interest));
  };
  
  // Updated to create data points with both sentiment and interest properties
  const interestData = messages.map((message, index) => ({
    timestamp: message.timestamp,
    index,
    sentiment: sentimentToNumber(message.sentiment), // Keep sentiment for type consistency
    interest: calculateInterestLevel(messages, index),
    message
  }));
  
  // Format the tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-border rounded-md shadow-sm">
          <p className="text-sm font-medium mb-1">
            {view === 'sentiment' ? 'Sentiment' : 'Interest Level'}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            {data.message.timestamp}
          </p>
          <p className="text-sm truncate max-w-[200px]">
            {data.message.content.length > 60 
              ? `${data.message.content.substring(0, 60)}...` 
              : data.message.content}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Handle click on chart point
  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length) {
      setSelectedPoint(data.activePayload[0].payload);
    }
  };
  
  return (
    <div className="p-6 h-[600px] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <Tabs value={view} onValueChange={(v: string) => setView(v as 'sentiment' | 'interest')}>
          <TabsList>
            <TabsTrigger value="sentiment" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              Sentiment Tracking
            </TabsTrigger>
            <TabsTrigger value="interest" className="gap-1">
              <Flame className="h-4 w-4" />
              Interest Level
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={view === 'sentiment' ? sentimentData : interestData}
            onClick={handleClick}
            margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(value) => value.split(':').slice(0, 2).join(':')} 
            />
            <YAxis 
              domain={view === 'sentiment' ? [-1, 1] : [0, 1]} 
              tickFormatter={(value) => 
                view === 'sentiment' 
                  ? (value === 1 ? 'Positive' : value === 0 ? 'Neutral' : 'Negative')
                  : (value === 1 ? 'High' : value === 0.5 ? 'Medium' : value === 0 ? 'Low' : '')
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey={view === 'sentiment' ? 'sentiment' : 'interest'} 
              stroke={view === 'sentiment' ? "#1a4380" : "#ff6b35"} 
              fill={view === 'sentiment' ? "rgba(26, 67, 128, 0.2)" : "rgba(255, 107, 53, 0.2)"} 
              activeDot={{ r: 8 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {selectedPoint && (
        <div className="mt-4 border border-border rounded-lg p-4 animate-fade-in">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {selectedPoint.message.timestamp}
                <span className="text-xs ml-1 text-muted-foreground">({selectedPoint.message.role})</span>
              </h3>
            </div>
            <div>
              {view === 'sentiment' ? (
                <>
                  {selectedPoint.sentiment > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Positive</span>
                    </div>
                  )}
                  {selectedPoint.sentiment === 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Neutral</span>
                    </div>
                  )}
                  {selectedPoint.sentiment < 0 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm font-medium">Negative</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-emmaccent" />
                  <span className="text-sm font-medium">
                    {selectedPoint.interest && selectedPoint.interest >= 0.8 
                      ? 'High Interest' 
                      : selectedPoint.interest && selectedPoint.interest >= 0.5 
                        ? 'Medium Interest' 
                        : 'Low Interest'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <ScrollArea className="h-24 border border-border rounded-md p-3 bg-secondary/50">
            <p className="text-sm">{selectedPoint.message.content}</p>
            
            {selectedPoint.message.highlights && selectedPoint.message.highlights.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs font-medium mb-1">Key Information:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedPoint.message.highlights.map((highlight, i) => (
                    <span 
                      key={i} 
                      className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800"
                      title={typeof highlight === 'object' ? `${highlight.type} (${Math.round(highlight.confidence * 100)}% confidence)` : highlight}
                    >
                      {typeof highlight === 'object' ? highlight.text : highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          
          <div className="mt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelectedPoint(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
