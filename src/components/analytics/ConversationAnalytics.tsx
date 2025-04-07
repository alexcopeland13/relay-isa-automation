
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Fragment } from "react";

interface ConversationAnalyticsProps {
  compact?: boolean;
}

// Sample data for conversation analytics
const conversationData = [
  { date: 'Apr 1', count: 28, duration: 3.2 },
  { date: 'Apr 2', count: 32, duration: 2.8 },
  { date: 'Apr 3', count: 36, duration: 3.5 },
  { date: 'Apr 4', count: 30, duration: 4.1 },
  { date: 'Apr 5', count: 40, duration: 3.7 },
  { date: 'Apr 6', count: 35, duration: 3.0 },
  { date: 'Apr 7', count: 42, duration: 3.8 },
];

const sentimentData = [
  { name: 'Positive', value: 60 },
  { name: 'Neutral', value: 25 },
  { name: 'Negative', value: 15 },
];

const COLORS = ['#00C49F', '#FFBB28', '#FF8042'];

export const ConversationAnalytics = ({ compact = false }: ConversationAnalyticsProps) => {
  const chartConfig: ChartConfig = {
    count: {
      label: "Conversations",
      theme: {
        light: "#8884d8",
        dark: "#8884d8",
      },
    },
    duration: {
      label: "Avg. Duration (min)",
      theme: {
        light: "#82ca9d",
        dark: "#82ca9d",
      },
    },
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversation Activity</CardTitle>
          <CardDescription>Volume and duration trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer config={chartConfig}>
              <Fragment>
                <AreaChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.2} />
                </AreaChart>
                <ChartLegend content={<ChartLegendContent />} />
              </Fragment>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Conversation Volume</CardTitle>
          <CardDescription>Number of AI conversations per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <Fragment>
                <AreaChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="count" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.2} />
                </AreaChart>
                <ChartLegend content={<ChartLegendContent />} />
              </Fragment>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversation Duration</CardTitle>
            <CardDescription>Average conversation time in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <Fragment>
                  <LineChart data={conversationData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="duration" stroke="var(--color-duration)" strokeWidth={2} />
                  </LineChart>
                  <ChartLegend content={<ChartLegendContent />} />
                </Fragment>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversation Sentiment</CardTitle>
            <CardDescription>Distribution of conversation sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
