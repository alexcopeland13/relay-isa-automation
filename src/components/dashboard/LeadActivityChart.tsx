
import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Sample data
const data = [
  { day: 'Mon', new: 4, qualified: 3, converted: 1 },
  { day: 'Tue', new: 7, qualified: 5, converted: 2 },
  { day: 'Wed', new: 5, qualified: 4, converted: 2 },
  { day: 'Thu', new: 9, qualified: 6, converted: 3 },
  { day: 'Fri', new: 6, qualified: 4, converted: 2 },
  { day: 'Sat', new: 3, qualified: 2, converted: 1 },
  { day: 'Sun', new: 2, qualified: 1, converted: 0 },
];

export const LeadActivityChart = () => {
  const [timeRange, setTimeRange] = useState('week');
  
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Lead Activity</CardTitle>
          <CardDescription>Lead progression over time</CardDescription>
        </div>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend verticalAlign="top" height={36} />
              <Line 
                type="monotone" 
                dataKey="new" 
                name="New Leads" 
                stroke="#1a4380" 
                strokeWidth={2}
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="qualified" 
                name="Qualified" 
                stroke="#4c72b0" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="converted" 
                name="Converted" 
                stroke="#ff6b35" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
