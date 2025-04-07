
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Fragment } from "react";

interface LeadAnalyticsProps {
  compact?: boolean;
}

// Sample data - In a real application, this would come from an API or state management
const leadTimeData = [
  { date: 'Apr 1', leads: 42, qualified: 18 },
  { date: 'Apr 2', leads: 38, qualified: 15 },
  { date: 'Apr 3', leads: 45, qualified: 21 },
  { date: 'Apr 4', leads: 53, qualified: 28 },
  { date: 'Apr 5', leads: 41, qualified: 19 },
  { date: 'Apr 6', leads: 36, qualified: 16 },
  { date: 'Apr 7', leads: 50, qualified: 29 },
];

const leadSourceData = [
  { name: 'Website', value: 45 },
  { name: 'Social Media', value: 25 },
  { name: 'Referral', value: 15 },
  { name: 'Other', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const LeadAnalytics = ({ compact = false }: LeadAnalyticsProps) => {
  const chartConfig: ChartConfig = {
    leads: {
      label: "Leads",
      theme: {
        light: "#0088FE",
        dark: "#0088FE",
      },
    },
    qualified: {
      label: "Qualified",
      theme: {
        light: "#00C49F",
        dark: "#00C49F",
      },
    },
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Generation</CardTitle>
          <CardDescription>New leads and qualification rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ChartContainer config={chartConfig}>
              <Fragment>
                <LineChart data={leadTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="qualified" stroke="var(--color-qualified)" strokeWidth={2} dot={false} />
                </LineChart>
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
          <CardTitle>Lead Generation Over Time</CardTitle>
          <CardDescription>New leads and qualified leads by day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <Fragment>
                <LineChart data={leadTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="qualified" stroke="var(--color-qualified)" strokeWidth={2} dot={false} />
                </LineChart>
                <ChartLegend content={<ChartLegendContent />} />
              </Fragment>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription>Distribution of leads by acquisition channel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Type Breakdown</CardTitle>
            <CardDescription>Mortgage vs. Realtor leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Mortgage', value: 65 },
                    { name: 'Realtor', value: 35 },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
