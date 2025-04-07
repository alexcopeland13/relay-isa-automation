
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Fragment } from "react";

interface FollowUpAnalyticsProps {
  compact?: boolean;
}

// Sample data for follow-up analytics
const followUpData = [
  { date: 'Apr 1', completed: 18, scheduled: 24, response: 62 },
  { date: 'Apr 2', completed: 15, scheduled: 20, response: 58 },
  { date: 'Apr 3', completed: 22, scheduled: 28, response: 70 },
  { date: 'Apr 4', completed: 25, scheduled: 32, response: 64 },
  { date: 'Apr 5', completed: 20, scheduled: 26, response: 68 },
  { date: 'Apr 6', completed: 18, scheduled: 24, response: 60 },
  { date: 'Apr 7', completed: 24, scheduled: 30, response: 72 },
];

const channelData = [
  { name: 'Email', value: 40 },
  { name: 'Phone', value: 30 },
  { name: 'SMS', value: 20 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const FollowUpAnalytics = ({ compact = false }: FollowUpAnalyticsProps) => {
  const chartConfig: ChartConfig = {
    completed: {
      label: "Completed",
      theme: {
        light: "#0088FE",
        dark: "#0088FE",
      },
    },
    scheduled: {
      label: "Scheduled",
      theme: {
        light: "#00C49F",
        dark: "#00C49F",
      },
    },
    response: {
      label: "Response Rate (%)",
      theme: {
        light: "#FFBB28",
        dark: "#FFBB28",
      },
    },
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Performance</CardTitle>
          <CardDescription>Completion and response rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer config={chartConfig}>
              <Fragment>
                <BarChart data={followUpData.slice(-4)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill="var(--color-completed)" />
                  <Bar dataKey="scheduled" fill="var(--color-scheduled)" />
                </BarChart>
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
          <CardTitle>Follow-up Activity</CardTitle>
          <CardDescription>Completed vs scheduled follow-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <Fragment>
                <BarChart data={followUpData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="completed" fill="var(--color-completed)" />
                  <Bar dataKey="scheduled" fill="var(--color-scheduled)" />
                </BarChart>
                <ChartLegend content={<ChartLegendContent />} />
              </Fragment>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Response Rate</CardTitle>
            <CardDescription>Percentage of follow-ups receiving responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <Fragment>
                  <LineChart data={followUpData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="response" stroke="var(--color-response)" strokeWidth={2} />
                  </LineChart>
                  <ChartLegend content={<ChartLegendContent />} />
                </Fragment>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follow-up Channels</CardTitle>
            <CardDescription>Distribution by communication channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {channelData.map((entry, index) => (
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
